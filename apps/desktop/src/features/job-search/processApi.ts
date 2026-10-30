import type { ApiResult } from "../server/management";
import type { ServerSession } from "../server/session";
import { functionError, isRecord, postgrestError, toNumber } from "./api";
import { parseStop, type ProcessStop } from "./recommendApi";
import type { BatchState } from "./types";

/** 처리 상태 읽기와 "지금 평가"가 부르는 서버 함수 (R74, R105, R106, D46) */

/** 처리 대기열 단계 (js-process QUEUE_STAGES와 같다) */
const QUEUE_STAGES = ["new", "waiting", "extracted"];

const BATCH_KINDS: readonly BatchState["kind"][] = ["extract", "score", "family"];

export interface ProcessState {
  /** 원문이 있고 아직 처리(필터·추출·채점)되지 않았고, 일괄로 맡기지 않은 공고 수 */
  queue: number;
  /** 원문을 아직 못 받은 공고 수 (켜진 사이트, 최근 7일, 예약 이어 하기와 같은 조건) */
  bodies: number;
  /** 진행 중인 일괄 작업 (`js_batches.status = submitted`, 맡긴 시각 순) */
  inFlight: BatchState[];
}

function parseBatchState(row: unknown): BatchState | null {
  if (!isRecord(row) || typeof row.submitted_at !== "string") return null;
  const kind = BATCH_KINDS.find((k) => k === row.kind);
  if (!kind) return null;
  return { kind, count: Array.isArray(row.posting_ids) ? row.posting_ids.length : 0, submittedAt: row.submitted_at };
}

/** 처리 대기·원문 대기 개수와 진행 중 일괄을 읽는다 */
export async function loadProcessState(session: ServerSession): Promise<ApiResult<ProcessState>> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600_000).toISOString();
  const [queue, bodies, batches] = await Promise.all([
    session.client.from("js_postings").select("id", { count: "exact", head: true })
      .in("stage", QUEUE_STAGES).is("hidden_at", null).is("batch_id", null).not("body_text", "is", null),
    session.client.from("js_postings").select("id, js_sites!inner(enabled)", { count: "exact", head: true })
      // 묶인 공고(duplicate)는 서버가 원문을 받지 않으므로 세지 않는다 (예약 이어 하기 조건과 같게, D88)
      .eq("js_sites.enabled", true).is("body_text", null).is("hidden_at", null).neq("stage", "duplicate")
      .gt("collected_at", weekAgo),
    session.client.from("js_batches").select("kind, posting_ids, submitted_at")
      .eq("status", "submitted").order("submitted_at", { ascending: true }),
  ]);
  if (queue.error) return { ok: false, error: postgrestError(queue.error, queue.status) };
  if (bodies.error) return { ok: false, error: postgrestError(bodies.error, bodies.status) };
  if (batches.error) return { ok: false, error: postgrestError(batches.error, batches.status) };
  const rows: unknown[] = batches.data ?? [];
  const inFlight = rows.map(parseBatchState).filter((b): b is BatchState => b !== null);
  return { ok: true, value: { queue: queue.count ?? 0, bodies: bodies.count ?? 0, inFlight } };
}

/** 일괄 처리 한 번의 결과 (`js-process { mode: "batch" }` 응답) */
export interface BatchRunResult {
  /** 이번 실행에서 결과를 저장한 공고 수 */
  saved: { extract: number; score: number };
  /** 이번 실행에서 맡긴 공고 수 */
  submitted: { extract: number; score: number };
  /** 월 한도 때문에 맡기지 못하고 대기로 둔 공고 수 */
  held: number;
  inFlight: BatchState[];
  stopped: ProcessStop | null;
}

function pair(value: unknown): { extract: number; score: number } {
  if (!isRecord(value)) return { extract: 0, score: 0 };
  return { extract: toNumber(value.extract) ?? 0, score: toNumber(value.score) ?? 0 };
}

/** 서버 응답의 BatchState (`{ kind, count, submittedAt }`) */
function parseResponseState(value: unknown): BatchState | null {
  if (!isRecord(value) || typeof value.submittedAt !== "string") return null;
  const kind = BATCH_KINDS.find((k) => k === value.kind);
  return kind ? { kind, count: toNumber(value.count) ?? 0, submittedAt: value.submittedAt } : null;
}

function parseBatchRun(data: unknown): BatchRunResult | null {
  if (!isRecord(data) || data.ok !== true) return null;
  const states: unknown[] = Array.isArray(data.inFlight) ? data.inFlight : [];
  return {
    saved: pair(data.saved),
    submitted: pair(data.submitted),
    held: toNumber(data.held) ?? 0,
    inFlight: states.map(parseResponseState).filter((b): b is BatchState => b !== null),
    stopped: parseStop(data.stopped),
  };
}

/** 끝난 일괄의 결과를 저장하고 대기 공고를 일괄 처리로 맡긴다 (`js-process { mode: "batch" }` 한 번, R106) */
export async function submitBatchOnce(session: ServerSession): Promise<ApiResult<BatchRunResult>> {
  const { data, error } = await session.client.functions.invoke<unknown>("js-process", { body: { mode: "batch" } });
  if (error) return { ok: false, error: functionError(error) };
  const value = parseBatchRun(data);
  return value ? { ok: true, value } : { ok: false, error: "bad-response" };
}

/** 원문 이어 받기 결과. 켜진 사이트가 없으면 null */
export type BodiesResult = { pending: number } | null;

/** 원문을 못 받은 공고의 원문을 한 번 받는다 (`js-collect { action: "bodies" }`) */
export async function fetchBodiesOnce(session: ServerSession): Promise<ApiResult<BodiesResult>> {
  const { data, error } = await session.client.functions.invoke<unknown>("js-collect", { body: { action: "bodies" } });
  if (error) return { ok: false, error: functionError(error) };
  if (!isRecord(data) || typeof data.ok !== "boolean") return { ok: false, error: "bad-response" };
  if (!data.ok) return data.reason === "no-sites" ? { ok: true, value: null } : { ok: false, error: "server" };
  return { ok: true, value: { pending: toNumber(data.pending) ?? 0 } };
}
