// js-process 일괄 맡기기 (job-search R102, R106, R109, R110, R73, D64, D70–D73).
// 대기 공고를 골라 1차 필터는 AI 없이 바로 하고, 추출·채점 요청을 Anthropic 일괄 작업으로 맡긴다.
// 결과 확인·저장은 batchResult.ts(5단계)가 한다. 맡긴 공고는 `batch_id`가 채워져 다음 실행의 대상에서 빠진다.
import { type CallClaudeInput, messageParams, monthlyRoom, noticeCredit } from "../_shared/ai.ts";
import { batchRequestJson, createBatch, isBatchFailure } from "../_shared/batch.ts";
import { checkDuplicate } from "./dedupe.ts";
import {
  type Context,
  type Extraction,
  extractRequest,
  firstFilter,
  POSTING_COLUMNS,
  type PostingRow,
  scoreRequest,
  secondFilter,
  setStage,
  type Stop,
} from "./steps.ts";

/** 일괄 하나에 넣는 최대 공고 수와 본문 크기 (첨부 포함, D71) */
const MAX_ITEMS = 40;
const MAX_BYTES = 30 * 1024 * 1024;
/** 시작 뒤 이 시간이 지나면 새 요청을 만들지 않는다 (남은 공고는 다음 실행) */
const SUBMIT_BEFORE_MS = 100_000;
/** 한 번에 고르는 대기 공고 수 (나머지는 다음 실행) */
const PICK_LIMIT = 400;
/** id 목록으로 읽을 때 한 번에 넣는 id 수 (주소 길이) */
const ID_CHUNK = 100;
/** 예상 비용 기본값: 최근 30일 일괄 기록이 없을 때 (D72) */
const DEFAULT_EST = { extract: 0.002, score: 0.03 } as const;
const EST_DAYS = 30;

export type BatchKind = "extract" | "score" | "family";

/** 진행 중 일괄 상태 (앱 `BatchState`와 같은 모양, D70) */
export interface BatchState {
  kind: BatchKind;
  count: number;
  submittedAt: string;
}

export interface SubmitResult {
  submitted: { extract: number; score: number };
  /** 월 한도 때문에 맡기지 못하고 waiting으로 둔 공고 수 (R110) */
  held: number;
  stopped: Stop | null;
}

/** 진행 중(submitted) 일괄 목록과 예상 비용 합. 읽지 못하면 null */
export async function loadInFlight(ctx: Context): Promise<{ states: BatchState[]; estSum: number } | null> {
  const rows = await ctx.caller.admin.from("js_batches").select("kind, posting_ids, submitted_at, est_cost_usd")
    .eq("user_id", ctx.caller.userId).eq("status", "submitted").order("submitted_at");
  if (rows.error) return null;
  let estSum = 0;
  const states = (rows.data ?? []).map((r) => {
    const est = Number(r.est_cost_usd);
    if (Number.isFinite(est)) estSum += est;
    return {
      kind: r.kind as BatchKind,
      count: Array.isArray(r.posting_ids) ? r.posting_ids.length : 0,
      submittedAt: r.submitted_at as string,
    };
  });
  return { states, estSum };
}

/** 작업별 예상 비용: 최근 30일 일괄 호출(성공) 평균, 없으면 기본값 (D72) */
async function estimateCost(ctx: Context, task: "extract" | "score"): Promise<number> {
  const since = new Date(Date.now() - EST_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const rows = await ctx.caller.admin.from("js_ai_calls").select("cost_usd")
    .eq("user_id", ctx.caller.userId).eq("batch", true).eq("task", task).eq("ok", true).gte("at", since)
    .order("at", { ascending: false }).limit(1000);
  const costs = (rows.data ?? []).map((r) => Number(r.cost_usd)).filter((n) => Number.isFinite(n) && n > 0);
  if (rows.error || costs.length === 0) return DEFAULT_EST[task];
  return costs.reduce((a, b) => a + b, 0) / costs.length;
}

/** 맡길 공고: 맡긴 중 아님·숨기지 않음·원문 있음. new(+ 프로필이 있으면 waiting·extracted), 오래된 순 */
async function pickPostings(ctx: Context): Promise<PostingRow[] | null> {
  const stages = ctx.profile ? ["waiting", "extracted", "new"] : ["new"];
  const picked: PostingRow[] = [];
  for (const stage of stages) {
    if (picked.length >= PICK_LIMIT) break;
    const rows = await ctx.caller.admin.from("js_postings").select(POSTING_COLUMNS)
      .eq("user_id", ctx.caller.userId).eq("stage", stage).is("batch_id", null).is("hidden_at", null)
      .not("body_text", "is", null).order("collected_at").limit(PICK_LIMIT - picked.length);
    if (rows.error) return null;
    picked.push(...((rows.data ?? []) as PostingRow[]));
  }
  return picked;
}

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** 이미 있는 추출 결과 (R109) */
async function loadExtractions(ctx: Context, ids: string[]): Promise<Map<string, Extraction> | null> {
  const map = new Map<string, Extraction>();
  for (const part of chunks(ids, ID_CHUNK)) {
    const rows = await ctx.caller.admin.from("js_extractions").select("posting_id, fields, suspect")
      .eq("user_id", ctx.caller.userId).in("posting_id", part);
    if (rows.error) return null;
    for (const r of rows.data ?? []) map.set(r.posting_id as string, { fields: r.fields, suspect: r.suspect === true });
  }
  return map;
}

/** 지금 프로필 버전의 점수가 있는 공고 (R109, D73) */
async function loadCurrentScores(ctx: Context, ids: string[]): Promise<Set<string> | null> {
  const set = new Set<string>();
  if (!ctx.profile) return set;
  for (const part of chunks(ids, ID_CHUNK)) {
    const rows = await ctx.caller.admin.from("js_scores").select("posting_id")
      .eq("user_id", ctx.caller.userId).eq("profile_version", ctx.profile.version).in("posting_id", part);
    if (rows.error) return null;
    for (const r of rows.data ?? []) set.add(r.posting_id as string);
  }
  return set;
}

/**
 * 추출이 있는 공고를 채점 전까지 보낸다: 인젝션 의심 → suspect, 중복 확인(묶이면 끝, R83) → 2차 필터 → extracted.
 * 바뀐 stage를 돌려준다 (`extracted`면 채점 대상). 저장에 실패하면 null. 일괄 결과 저장(5단계)도 이 함수를 쓴다.
 */
export async function routeExtracted(ctx: Context, p: PostingRow, ex: Extraction): Promise<string | null> {
  if (ex.suspect) return (await setStage(ctx, p.id, "suspect")) ? "suspect" : null;
  const dup = await checkDuplicate(ctx, p, ex.fields);
  if (dup === null) return null;
  if (dup.bundled) return dup.stage;
  const filtered2 = await secondFilter(ctx, p, ex.fields);
  if (filtered2 === null) return null;
  if (filtered2) return "filtered2";
  return (await setStage(ctx, p.id, "extracted")) ? "extracted" : null;
}

/** 일괄 하나로 모으는 중인 요청들 */
interface Packer {
  kind: "extract" | "score";
  ids: string[];
  lines: string[];
  bytes: number;
  est: number;
  sent: number;
}

const encoder = new TextEncoder();

/**
 * 모은 요청을 일괄 작업으로 맡긴다. 순서: js_batches 행(anthropic_id 없음) → 공고 batch_id → createBatch → anthropic_id.
 * 맡기기에 실패하면 행을 지워 공고 batch_id도 비운다(on delete set null). 실패 이유를 돌려주고, 성공이면 null.
 */
async function flush(ctx: Context, packer: Packer): Promise<Stop | null> {
  if (packer.ids.length === 0) return null;
  const { admin, userId } = ctx.caller;
  const ids = packer.ids;
  const lines = packer.lines;
  const est = packer.est;
  packer.ids = [];
  packer.lines = [];
  packer.bytes = 0;
  packer.est = 0;

  const row = await admin.from("js_batches")
    .insert({ user_id: userId, kind: packer.kind, posting_ids: ids, status: "submitted", est_cost_usd: est })
    .select("id").single();
  if (row.error || !row.data) return { reason: "database" };
  const batchId = row.data.id as string;
  const remove = () => admin.from("js_batches").delete().eq("id", batchId).eq("user_id", userId);

  const marked = await admin.from("js_postings").update({ batch_id: batchId }).eq("user_id", userId).in("id", ids);
  if (marked.error) {
    await remove();
    return { reason: "database" };
  }

  const created = await createBatch(lines);
  if (isBatchFailure(created)) {
    await remove();
    if (created.reason === "credit") {
      await noticeCredit(ctx.caller);
      return { reason: "credit" };
    }
    return { reason: created.reason === "bad-response" ? "upstream" : created.reason };
  }
  const saved = await admin.from("js_batches").update({ anthropic_id: created.id }).eq("id", batchId).eq("user_id", userId);
  if (saved.error) console.error(`js_batches anthropic_id 기록 실패: ${created.id}`);
  packer.sent += ids.length;
  return null;
}

/** 요청 하나를 더한다. 개수·크기가 넘치면 먼저 맡긴다 */
async function add(ctx: Context, packer: Packer, id: string, input: CallClaudeInput, est: number): Promise<Stop | null> {
  const line = batchRequestJson(id, messageParams(input));
  const size = encoder.encode(line).byteLength;
  if (packer.ids.length >= MAX_ITEMS || (packer.ids.length > 0 && packer.bytes + size > MAX_BYTES)) {
    const stop = await flush(ctx, packer);
    if (stop) return stop;
  }
  packer.ids.push(id);
  packer.lines.push(line);
  packer.bytes += size;
  packer.est += est;
  return null;
}

/**
 * 대기 공고를 일괄로 맡긴다 (R102, R106). `new`는 1차 필터를 먼저 하고, 추출이 있으면 추출을 맡기지 않고
 * 채점 전까지 보내며, 지금 프로필 점수가 있으면 `scored`로 바로 둔다 (R109, D73).
 * 맡길 수 있는 양 = 월 한도 − 이번 달 사용액 − 진행 중 일괄의 예상 비용 합. 넘치는 공고는 waiting (R110, D72).
 */
export async function submitBatches(ctx: Context, startedAt: number): Promise<SubmitResult> {
  const result: SubmitResult = { submitted: { extract: 0, score: 0 }, held: 0, stopped: null };
  const database: Stop = { reason: "database" };

  const room = await monthlyRoom(ctx.caller);
  const inFlight = await loadInFlight(ctx);
  if (room === null || !inFlight) return { ...result, stopped: database };
  let budget = room - inFlight.estSum;
  const est = { extract: await estimateCost(ctx, "extract"), score: await estimateCost(ctx, "score") };

  const postings = await pickPostings(ctx);
  if (!postings) return { ...result, stopped: database };
  const ids = postings.map((p) => p.id);
  const extractions = await loadExtractions(ctx, ids);
  const scored = await loadCurrentScores(ctx, ids);
  if (!extractions || !scored) return { ...result, stopped: database };

  const packers: Record<"extract" | "score", Packer> = {
    extract: { kind: "extract", ids: [], lines: [], bytes: 0, est: 0, sent: 0 },
    score: { kind: "score", ids: [], lines: [], bytes: 0, est: 0, sent: 0 },
  };

  /** 월 한도 안에 들어가면 요청을 더하고, 아니면 waiting으로 둔다 */
  const submit = async (p: PostingRow, kind: "extract" | "score", input: () => Promise<CallClaudeInput | null>) => {
    if (budget < est[kind]) {
      result.held += 1;
      if (p.stage !== "waiting" && !(await setStage(ctx, p.id, "waiting"))) return database;
      return null;
    }
    const request = await input();
    if (!request) return null;
    budget -= est[kind];
    return await add(ctx, packers[kind], p.id, request, est[kind]);
  };

  for (const p of postings) {
    if (Date.now() - startedAt > SUBMIT_BEFORE_MS) {
      result.stopped = { reason: "time" };
      break;
    }
    if (p.stage === "new") {
      const filtered1 = await firstFilter(ctx, p);
      if (filtered1 === null) {
        result.stopped = database;
        break;
      }
      if (filtered1) continue;
    }

    const ex = extractions.get(p.id);
    if (!ex) {
      result.stopped = await submit(p, "extract", () => extractRequest(ctx, p));
      if (result.stopped) break;
      continue;
    }

    // 추출 재사용 (R109): 채점 전 단계(의심·중복·2차 필터)를 AI 없이 한다
    if (p.stage !== "extracted") {
      const stage = await routeExtracted(ctx, p, ex);
      if (stage === null) {
        result.stopped = database;
        break;
      }
      if (stage !== "extracted") continue;
    }
    if (!ctx.profile) continue;
    if (scored.has(p.id)) {
      if (!(await setStage(ctx, p.id, "scored"))) {
        result.stopped = database;
        break;
      }
      continue;
    }
    result.stopped = await submit(p, "score", () => Promise.resolve(scoreRequest(ctx, p, ex.fields)));
    if (result.stopped) break;
  }

  // 시간·한도로 멈춰도 이미 모은 요청은 맡긴다 (DB·크레딧 오류면 맡기지 않는다)
  const fatal = result.stopped && result.stopped.reason !== "time";
  if (!fatal) {
    for (const packer of [packers.extract, packers.score]) {
      const stop = await flush(ctx, packer);
      if (stop) {
        result.stopped = stop;
        break;
      }
    }
  }
  result.submitted = { extract: packers.extract.sent, score: packers.score.sent };
  if (!result.stopped && result.held > 0) result.stopped = { reason: "limit", which: "monthly" };
  return result;
}
