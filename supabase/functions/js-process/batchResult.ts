// js-process 일괄 결과 받기 (job-search R103, R104, R108, R41, D71, D80).
// 진행 중(submitted) 일괄이 끝났으면 결과 파일을 줄 단위로 읽어 공고마다 저장한다.
// 추출 결과는 인젝션 의심 → 중복 확인 → 2차 필터(`routeExtracted`)를 AI 없이 하고, 통과한 공고(`extracted`)는
// 같은 실행의 `submitBatches`가 채점 일괄로 맡긴다. 채점 결과는 점수를 저장하고 `scored`로 둔다.
// 저장한 공고는 `batch_id`를 비우므로, 같은 결과를 다시 읽어도(시간이 다 되어 다음 실행이 처음부터 읽을 때) 두 번 저장하지 않는다.
// 직군 채우기 일괄(kind family)은 familyBackfill.ts가 따로 읽는다 (D75).
import { type AiModel, isCreditError, noticeCredit, readResult, recordBatchCall } from "../_shared/ai.ts";
import { type BatchLine, getBatch, isBatchFailure, readResults } from "../_shared/batch.ts";
import { routeExtracted } from "./batch.ts";
import {
  type Context,
  POSTING_COLUMNS,
  type PostingRow,
  type ProcessFailHit,
  saveExtraction,
  saveScore,
  type Stop,
} from "./steps.ts";

/** anthropic_id 없이 이 시간보다 오래된 submitted 행은 맡기기가 끊긴 것이다 (D80). 함수 시간 한도(150초)보다 넉넉히 */
const UNSENT_STALE_MS = 10 * 60 * 1000;
/** 기록에 쓰는 모델: 결과 메시지에 모델이 없을 때 (extractRequest·scoreRequest와 같다) */
const DEFAULT_MODEL: Record<ResultKind, AiModel> = { extract: "claude-haiku-5-5", score: "claude-opus-5-5" };
/** 추출 결과를 받을 때 채점 전 단계(의심·중복·2차 필터)로 보내는 단계. 그 사이 단계가 바뀐 공고는 결과만 저장한다 */
const EXTRACT_FROM = new Set(["new", "waiting"]);

type ResultKind = "extract" | "score";

interface BatchRow {
  id: string;
  anthropic_id: string | null;
  kind: ResultKind;
  submitted_at: string;
}

export interface PollResult {
  /** 이번 실행에서 결과를 저장한 공고 수 (일괄 종류별) */
  saved: { extract: number; score: number };
  stopped: Stop | null;
}

/** 결과 한 줄 처리 결과: 저장함 / 대기로 되돌림 / 실패로 둠 / 이미 저장해 건너뜀 / 크레딧 부족 / DB 오류 */
type LineOutcome = "saved" | "released" | "failed" | "skip" | "credit" | "database";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function modelOf(kind: ResultKind, message: unknown): AiModel {
  const model = isRecord(message) ? message.model : null;
  return model === "claude-haiku-5-5" || model === "claude-opus-5-5" ? model : DEFAULT_MODEL[kind];
}

/** errored 항목의 오류 본문 `{ type: "error", error: { type, message } }` (모양이 달라도 읽는다) */
function errorOf(error: unknown): { type: string; message: string } {
  const inner = isRecord(error) && isRecord(error.error) ? error.error : isRecord(error) ? error : {};
  return {
    type: typeof inner.type === "string" ? inner.type : "",
    message: typeof inner.message === "string" ? inner.message : "",
  };
}

/**
 * 공고 하나를 이 일괄에서 빼며 고친다 (`batch_id = 이 일괄`인 행만). 더 고칠 칸은 `patch`로 같이 넣는다.
 * 대기로 되돌리기는 `batch_id`만 비운다 (stage는 맡기기 전 그대로라 다음 일괄 처리에 다시 들어간다, R108).
 */
async function release(ctx: Context, batchId: string, postingId: string, patch: Record<string, unknown> = {}) {
  const res = await ctx.caller.admin.from("js_postings").update({ ...patch, batch_id: null })
    .eq("user_id", ctx.caller.userId).eq("id", postingId).eq("batch_id", batchId);
  return !res.error;
}

/** 거절된 공고: failed + 이유 (D47과 같은 모양). 다시 맡겨도 또 거절되므로 대기열에서 뺀다 */
async function fail(ctx: Context, batchId: string, postingId: string, message: string): Promise<LineOutcome> {
  const hit: ProcessFailHit = { id: "process", kind: "process-failed", matched: [message.slice(0, 200)] };
  return (await release(ctx, batchId, postingId, { stage: "failed", filtered_by: [hit] })) ? "failed" : "database";
}

/** 성공 결과 저장. 추출은 채점 전 단계까지 보내고, 채점은 점수를 저장한다 */
async function saveSucceeded(ctx: Context, batch: BatchRow, p: PostingRow, message: unknown, version: number) {
  const model = modelOf(batch.kind, message);
  await recordBatchCall(ctx.caller, {
    task: batch.kind,
    model,
    usage: isRecord(message) ? message.usage : null,
    ok: true,
  });
  const data = readResult({ task: batch.kind, model }, message);
  if (data === undefined) {
    // 정책 거절(refusal)은 다시 맡겨도 같으니 failed, 그 밖(max_tokens 등)은 대기로 되돌린다
    const stop = isRecord(message) ? message.stop_reason : null;
    if (stop === "refusal") return await fail(ctx, batch.id, p.id, "AI가 이 공고의 처리를 거절함 (refusal)");
    return (await release(ctx, batch.id, p.id)) ? "released" : "database";
  }

  if (batch.kind === "extract") {
    const ex = await saveExtraction(ctx, p, data);
    if (!ex) return "database";
    if (EXTRACT_FROM.has(p.stage) && (await routeExtracted(ctx, p, ex)) === null) return "database";
  } else if (!(await saveScore(ctx, p, data, version, p.stage === "extracted" || p.stage === "waiting"))) {
    return "database";
  }
  return (await release(ctx, batch.id, p.id)) ? "saved" : "database";
}

/** 결과 한 줄을 저장한다. 이 일괄에 아직 맡겨져 있는 공고만 (이미 저장한 공고는 batch_id가 비어 건너뜀) */
async function saveLine(ctx: Context, batch: BatchRow, line: BatchLine, version: number): Promise<LineOutcome> {
  const row = await ctx.caller.admin.from("js_postings").select(POSTING_COLUMNS)
    .eq("user_id", ctx.caller.userId).eq("id", line.customId).eq("batch_id", batch.id).maybeSingle();
  if (row.error) return "database";
  if (!row.data) return "skip";
  const p = row.data as PostingRow;

  if (line.type === "succeeded") return await saveSucceeded(ctx, batch, p, line.message, version);

  if (line.type === "errored") {
    await recordBatchCall(ctx.caller, { task: batch.kind, model: DEFAULT_MODEL[batch.kind], usage: null, ok: false });
    if (isCreditError(400, line.error)) return (await release(ctx, batch.id, p.id)) ? "credit" : "database";
    const error = errorOf(line.error);
    console.error(`일괄 항목 오류: kind=${batch.kind} type=${error.type} message=${error.message.slice(0, 300)}`);
    // 내용 거절(invalid_request)은 다시 맡겨도 같으니 failed (D47의 rejected와 같은 판정), 나머지는 대기로 (R108)
    if (error.type === "invalid_request_error") return await fail(ctx, batch.id, p.id, error.message || error.type);
  }
  // 그 밖 errored·expired·canceled: batch_id만 비워 다음 일괄 처리에 다시 넣는다 (R108)
  return (await release(ctx, batch.id, p.id)) ? "released" : "database";
}

/** 일괄 행을 닫는다: 아직 맡겨져 있는 공고의 batch_id를 비우고 상태·끝난 시각·개수를 적는다 */
async function closeBatch(ctx: Context, batchId: string, status: "saved" | "failed", counts: unknown): Promise<boolean> {
  const { admin, userId } = ctx.caller;
  const freed = await admin.from("js_postings").update({ batch_id: null }).eq("user_id", userId).eq("batch_id", batchId);
  if (freed.error) return false;
  const closed = await admin.from("js_batches").update({ status, ended_at: new Date().toISOString(), counts })
    .eq("id", batchId).eq("user_id", userId);
  return !closed.error;
}

/** 채점 일괄을 맡길 때의 프로필 버전: 맡긴 시각까지 저장된 가장 큰 버전 (프로필은 늘 새 버전으로 저장된다, D27). 못 읽으면 null */
async function profileVersionAt(ctx: Context, submittedAt: string): Promise<number | null> {
  const row = await ctx.caller.admin.from("js_profiles").select("version")
    .eq("user_id", ctx.caller.userId).lte("saved_at", submittedAt)
    .order("version", { ascending: false }).limit(1).maybeSingle();
  if (row.error) return null;
  return typeof row.data?.version === "number" ? row.data.version : ctx.profile?.version ?? 0;
}

function failureStop(reason: "missing-key" | "network" | "upstream" | "credit" | "bad-response"): Stop {
  if (reason === "credit") return { reason: "credit" };
  return { reason: reason === "bad-response" ? "upstream" : reason };
}

/**
 * 진행 중 일괄을 확인하고 끝난 것의 결과를 저장한다 (R103, R104, R108).
 * `deadline`(Date.now() 값)이 지나면 멈추고, 다 읽지 못한 일괄은 submitted 그대로 두어 다음 실행이 이어 읽는다.
 */
export async function pollBatches(ctx: Context, deadline: number): Promise<PollResult> {
  const result: PollResult = { saved: { extract: 0, score: 0 }, stopped: null };
  const database: Stop = { reason: "database" };
  const rows = await ctx.caller.admin.from("js_batches").select("id, anthropic_id, kind, submitted_at")
    .eq("user_id", ctx.caller.userId).eq("status", "submitted").in("kind", ["extract", "score"])
    .order("submitted_at");
  if (rows.error) return { ...result, stopped: database };

  let creditNoticed = false;
  for (const batch of (rows.data ?? []) as BatchRow[]) {
    if (Date.now() > deadline) {
      result.stopped = { reason: "time" };
      break;
    }
    // 맡기기가 중간에 끊긴 행 (D80): 맡긴 공고를 대기로 되돌리고 실패로 닫는다
    if (!batch.anthropic_id) {
      if (Date.now() - Date.parse(batch.submitted_at) > UNSENT_STALE_MS && !(await closeBatch(ctx, batch.id, "failed", null))) {
        result.stopped = database;
        break;
      }
      continue;
    }

    const info = await getBatch(batch.anthropic_id);
    if (isBatchFailure(info)) {
      if (info.reason === "credit" && !creditNoticed) {
        creditNoticed = true;
        await noticeCredit(ctx.caller);
      }
      result.stopped = failureStop(info.reason);
      continue;
    }
    if (info.status !== "ended" || !info.resultsUrl) continue;

    const version = batch.kind === "score" ? await profileVersionAt(ctx, batch.submitted_at) : 0;
    if (version === null) {
      result.stopped = database;
      break;
    }
    let lineFailed = false;
    let creditSeen = false;
    const read = await readResults(info.resultsUrl, async (line) => {
      const outcome = await saveLine(ctx, batch, line, version);
      if (outcome === "saved") result.saved[batch.kind] += 1;
      if (outcome === "credit") creditSeen = true;
      if (outcome === "database") {
        lineFailed = true;
        return false;
      }
    }, deadline);
    if (creditSeen && !creditNoticed) {
      creditNoticed = true;
      await noticeCredit(ctx.caller);
    }

    if (read === "done") {
      if (!(await closeBatch(ctx, batch.id, "saved", info.counts))) {
        result.stopped = database;
        break;
      }
      continue;
    }
    if (read === "time") {
      result.stopped = { reason: "time" };
      break;
    }
    if (read === "stopped") {
      result.stopped = lineFailed ? database : { reason: "upstream" };
      break;
    }
    result.stopped = failureStop(read.reason);
  }
  return result;
}
