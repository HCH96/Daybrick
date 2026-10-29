// js-process 기존 공고 직군 채우기·옮기기 (job-search R99, R100, R47, D69, D75).
// 서버 업데이트 뒤 `family_version < 1`인 동안 batch 실행 맨 앞에서 한 번씩 돈다:
//   1. 진행 중 직군 일괄(kind family)이 있으면 결과를 확인하고, 끝났으면 `fields.family`만 채운다.
//      성공 결과가 아닌 항목(errored·expired·canceled, 읽을 수 없는 결과)은 `unknown`으로 둔다 (다시 묻지 않음, R101).
//   2. 진행 중 일괄이 없고 직군 없는 공고(duplicate 제외, 숨김·지원 포함)가 있으면 Haiku 일괄 하나로 맡긴다.
//      원문은 보내지 않고 제목·회사·직무 + 추출 항목의 직무·자격 요건 앞부분만 보낸다. 월 한도 안만 맡긴다 (D64, D72).
//   3. 직군 없는 공고가 남지 않으면 옮기기: `dev-only`가 켜져 있으면 채점(또는 채점 대기)된 비개발 공고를 filtered2로.
//      점수는 지우지 않는다 (R99). 끝나면 `family_version = 1`. 바꾸기 전 단계는 0008 백업 표에 있다.
// 직군 일괄은 공고의 `batch_id`를 채우지 않는다 (추출이 이미 있어 처리 대기열과 겹치지 않고, 채점·필터 다시 적용을 막지 않으려고).
import { type AiModel, isCreditError, messageParams, monthlyRoom, noticeCredit, readResult, recordBatchCall } from "../_shared/ai.ts";
import { type BatchLine, batchRequestJson, createBatch, getBatch, isBatchFailure, readResults } from "../_shared/batch.ts";
import { DEV_FAMILIES, type FilterHit } from "../_shared/filters.ts";
import { FAMILY_SCHEMA, FAMILY_SYSTEM, FAMILY_VALUES, familyContent } from "../_shared/prompts.ts";
import { estimateCost, loadInFlight } from "./batch.ts";
import type { Context } from "./steps.ts";

const MODEL: AiModel = "claude-haiku-5-5";
/** anthropic_id 없이 이 시간보다 오래된 submitted 행은 맡기기가 끊긴 것이다 (batchResult.ts와 같다, D80) */
const UNSENT_STALE_MS = 10 * 60 * 1000;
/** 한 번에 읽는 행 수 (PostgREST 최대 행 수 안) */
const PAGE = 1000;
/** id 목록으로 읽거나 고칠 때 한 번에 넣는 id 수 (주소 길이) */
const ID_CHUNK = 100;
/** 옮기기 대상 단계: 채점됨, 채점을 기다리는 공고 (2차 필터를 직군 없이 통과한 것) */
const MOVE_STAGES = ["scored", "extracted", "waiting"];

interface FamilyBatchRow {
  id: string;
  anthropic_id: string | null;
  submitted_at: string;
}

interface Target {
  id: string;
  title: string | null;
  company: string | null;
  duty: string | null;
  fields: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function familyOf(data: unknown): string {
  const value = isRecord(data) ? data.family : null;
  return typeof value === "string" && (FAMILY_VALUES as readonly string[]).includes(value) ? value : "unknown";
}

/** 직군 없는 추출의 공고 (duplicate 제외, 숨김·지원 포함). 읽지 못하면 null */
async function loadTargets(ctx: Context): Promise<Target[] | null> {
  const { admin, userId } = ctx.caller;
  const fields = new Map<string, unknown>();
  for (let from = 0; ; from += PAGE) {
    const rows = await admin.from("js_extractions").select("posting_id, fields")
      .eq("user_id", userId).is("fields->>family", null).order("posting_id").range(from, from + PAGE - 1);
    if (rows.error) return null;
    for (const r of rows.data ?? []) fields.set(r.posting_id as string, r.fields);
    if ((rows.data ?? []).length < PAGE) break;
  }
  const targets: Target[] = [];
  for (const part of chunks([...fields.keys()], ID_CHUNK)) {
    const rows = await admin.from("js_postings").select("id, title, company, duty")
      .eq("user_id", userId).neq("stage", "duplicate").in("id", part);
    if (rows.error) return null;
    for (const r of rows.data ?? []) {
      targets.push({ id: r.id, title: r.title, company: r.company, duty: r.duty, fields: fields.get(r.id) ?? null });
    }
  }
  return targets;
}

/**
 * 직군 없는 공고를 일괄 하나로 맡긴다. 순서는 맡기기(D80)와 같다: js_batches 행 → createBatch → anthropic_id.
 * 월 한도 안에 들어가는 만큼만 맡기고(D64), 하나도 못 맡기면 false (다음 실행이 다시 본다).
 */
async function submitFamily(ctx: Context, targets: Target[]): Promise<boolean> {
  const { admin, userId } = ctx.caller;
  const room = await monthlyRoom(ctx.caller);
  const inFlight = await loadInFlight(ctx);
  if (room === null || !inFlight) return false;
  const est = await estimateCost(ctx, "family");
  const fit = est > 0 ? Math.floor((room - inFlight.estSum) / est) : targets.length;
  const picked = targets.slice(0, Math.max(0, fit));
  if (picked.length === 0) return false;

  const lines = picked.map((t) =>
    batchRequestJson(t.id, messageParams({
      task: "family",
      model: MODEL,
      system: FAMILY_SYSTEM,
      content: familyContent(t, t.fields),
      schema: FAMILY_SCHEMA,
      maxTokens: 256,
    }))
  );
  const row = await admin.from("js_batches")
    .insert({
      user_id: userId,
      kind: "family",
      posting_ids: picked.map((t) => t.id),
      status: "submitted",
      est_cost_usd: est * picked.length,
    })
    .select("id").single();
  if (row.error || !row.data) return false;
  const batchId = row.data.id as string;

  const created = await createBatch(lines);
  if (isBatchFailure(created)) {
    await admin.from("js_batches").delete().eq("id", batchId).eq("user_id", userId);
    if (created.reason === "credit") await noticeCredit(ctx.caller);
    return false;
  }
  const saved = await admin.from("js_batches").update({ anthropic_id: created.id }).eq("id", batchId).eq("user_id", userId);
  if (saved.error) console.error(`js_batches anthropic_id 기록 실패: ${created.id}`);
  return true;
}

/** `fields.family`만 채운다. 이미 채워져 있으면(다시 읽은 줄) 건너뛴다. 채웠으면 true, 건너뛰면 false, 실패면 null */
async function saveFamily(ctx: Context, postingId: string, family: string): Promise<boolean | null> {
  const { admin, userId } = ctx.caller;
  const row = await admin.from("js_extractions").select("fields")
    .eq("user_id", userId).eq("posting_id", postingId).maybeSingle();
  if (row.error) return null;
  if (!row.data) return false;
  const fields = isRecord(row.data.fields) ? row.data.fields : {};
  if (typeof fields.family === "string" && fields.family !== "") return false;
  const updated = await admin.from("js_extractions").update({ fields: { ...fields, family } })
    .eq("user_id", userId).eq("posting_id", postingId);
  return updated.error ? null : true;
}

/** 결과 한 줄: 성공이면 결과의 직군, 아니면 unknown. 기록은 실제로 채운 줄만 남긴다 (다시 읽어도 두 번 기록하지 않는다) */
async function saveLine(ctx: Context, line: BatchLine, credit: { seen: boolean }): Promise<boolean> {
  const ok = line.type === "succeeded";
  const data = ok ? readResult({ task: "family", model: MODEL }, line.message) : undefined;
  const saved = await saveFamily(ctx, line.customId, familyOf(data));
  if (saved === null) return false;
  if (saved && (ok || line.type === "errored")) {
    await recordBatchCall(ctx.caller, {
      task: "family",
      model: MODEL,
      usage: ok && isRecord(line.message) ? line.message.usage : null,
      ok,
    });
  }
  if (line.type === "errored" && isCreditError(400, line.error)) credit.seen = true;
  return true;
}

async function closeBatch(ctx: Context, batchId: string, status: "saved" | "failed", counts: unknown): Promise<boolean> {
  const closed = await ctx.caller.admin.from("js_batches").update({ status, ended_at: new Date().toISOString(), counts })
    .eq("id", batchId).eq("user_id", ctx.caller.userId);
  return !closed.error;
}

/**
 * 진행 중 직군 일괄을 확인한다. 끝나서 다 저장했거나 끊긴 행을 정리했으면 "closed",
 * 아직 진행 중·시간 부족·오류면 "waiting" (다음 실행이 이어 본다), 진행 중 일괄이 없으면 "none".
 */
async function pollFamily(ctx: Context, deadline: number): Promise<"none" | "closed" | "waiting"> {
  const rows = await ctx.caller.admin.from("js_batches").select("id, anthropic_id, submitted_at")
    .eq("user_id", ctx.caller.userId).eq("status", "submitted").eq("kind", "family").order("submitted_at");
  if (rows.error) return "waiting";
  const batches = (rows.data ?? []) as FamilyBatchRow[];
  if (batches.length === 0) return "none";

  for (const batch of batches) {
    if (Date.now() > deadline) return "waiting";
    if (!batch.anthropic_id) {
      if (Date.now() - Date.parse(batch.submitted_at) <= UNSENT_STALE_MS) return "waiting";
      if (!(await closeBatch(ctx, batch.id, "failed", null))) return "waiting";
      continue;
    }
    const info = await getBatch(batch.anthropic_id);
    if (isBatchFailure(info)) {
      if (info.reason === "credit") await noticeCredit(ctx.caller);
      return "waiting";
    }
    if (info.status !== "ended" || !info.resultsUrl) return "waiting";
    const credit = { seen: false };
    const read = await readResults(info.resultsUrl, (line) => saveLine(ctx, line, credit), deadline);
    if (credit.seen) await noticeCredit(ctx.caller);
    if (read !== "done" || !(await closeBatch(ctx, batch.id, "saved", info.counts))) return "waiting";
  }
  return "closed";
}

/** 켜진 `dev-only`가 있으면 채점(또는 채점 대기)된 비개발 공고를 filtered2로 옮긴다 (R99). 실패하면 false */
async function moveNonDev(ctx: Context): Promise<boolean> {
  const filter = ctx.filters.find((f) => f.enabled && f.kind === "dev-only");
  if (!filter) return true;
  const { admin, userId } = ctx.caller;
  const byFamily = new Map<string, string[]>();
  for (let from = 0; ; from += PAGE) {
    const rows = await admin.from("js_extractions").select("posting_id, fields->>family")
      .eq("user_id", userId).not("fields->>family", "is", null)
      .not("fields->>family", "in", `(${DEV_FAMILIES.join(",")})`)
      .order("posting_id").range(from, from + PAGE - 1);
    if (rows.error) return false;
    for (const r of (rows.data ?? []) as { posting_id: string; family: string | null }[]) {
      if (!r.family) continue;
      byFamily.set(r.family, [...(byFamily.get(r.family) ?? []), r.posting_id]);
    }
    if ((rows.data ?? []).length < PAGE) break;
  }
  for (const [family, ids] of byFamily) {
    const hit: FilterHit = { id: filter.id, kind: "dev-only", matched: [family] };
    for (const part of chunks(ids, ID_CHUNK)) {
      // 맡긴 중인 공고(batch_id)는 결과 저장이 단계를 정하므로 건드리지 않는다 (js_refilter와 같다)
      const moved = await admin.from("js_postings").update({ stage: "filtered2", filtered_by: [hit] })
        .eq("user_id", userId).in("stage", MOVE_STAGES).is("batch_id", null).in("id", part);
      if (moved.error) return false;
    }
  }
  return true;
}

/**
 * 기존 공고 직군 채우기·옮기기 (R99, R100, D75). `family_version >= 1`이면 아무것도 하지 않는다.
 * 실패해도 batch 실행의 나머지(결과 저장·맡기기)는 계속하고, 다음 실행이 다시 이어 한다.
 */
export async function ensureFamilyBackfill(ctx: Context, deadline: number): Promise<void> {
  const { admin, userId } = ctx.caller;
  const settings = await admin.from("js_settings").select("family_version").eq("user_id", userId).maybeSingle();
  if (settings.error) return;
  const version = typeof settings.data?.family_version === "number" ? settings.data.family_version : 0;
  if (version >= 1) return;

  const polled = await pollFamily(ctx, deadline);
  if (polled === "waiting") return;

  const targets = await loadTargets(ctx);
  if (!targets) return;
  if (targets.length > 0) {
    // 방금 일괄을 닫았는데도 남은 공고는 저장에 실패한 줄이다 → 다시 맡긴다. 맡기지 못하면 다음 실행이 다시 본다
    if (!(await submitFamily(ctx, targets))) console.warn("js-process: 직군 채우기 일괄을 맡기지 못함 (다음 실행에서 다시)");
    return;
  }

  if (!(await moveNonDev(ctx))) {
    console.warn("js-process: 비개발 공고 옮기기 실패 (다음 실행에서 다시)");
    return;
  }
  const done = await admin.from("js_settings").update({ family_version: 1 }).eq("user_id", userId);
  if (done.error) console.warn("js-process: family_version 기록 실패 (다음 실행에서 다시)");
}
