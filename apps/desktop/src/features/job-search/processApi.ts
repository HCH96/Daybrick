import type { ApiResult } from "../server/management";
import type { ServerSession } from "../server/session";
import { functionError, isRecord, postgrestError, toNumber } from "./api";
import { parseProcessResult, type ProcessResult } from "./recommendApi";

/** 처리 상태 읽기와 "지금 평가"가 부르는 서버 함수 (R74, 사용자 테스트 r1 추가 요청 3·5) */

/** 처리 대기열 단계 (js-process QUEUE_STAGES와 같다) */
const QUEUE_STAGES = ["new", "waiting", "extracted"];

export interface ProcessState {
  /** 원문이 있고 아직 처리(필터·추출·채점)되지 않은 공고 수 */
  queue: number;
  /** 원문을 아직 못 받은 공고 수 (켜진 사이트, 최근 7일, 예약 이어 하기와 같은 조건) */
  bodies: number;
}

/** 처리 대기·원문 대기 개수를 읽는다 */
export async function loadProcessState(session: ServerSession): Promise<ApiResult<ProcessState>> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600_000).toISOString();
  const [queue, bodies] = await Promise.all([
    session.client.from("js_postings").select("id", { count: "exact", head: true })
      .in("stage", QUEUE_STAGES).is("hidden_at", null).not("body_text", "is", null),
    session.client.from("js_postings").select("id, js_sites!inner(enabled)", { count: "exact", head: true })
      .eq("js_sites.enabled", true).is("body_text", null).is("hidden_at", null).gt("collected_at", weekAgo),
  ]);
  if (queue.error) return { ok: false, error: postgrestError(queue.error, queue.status) };
  if (bodies.error) return { ok: false, error: postgrestError(bodies.error, bodies.status) };
  return { ok: true, value: { queue: queue.count ?? 0, bodies: bodies.count ?? 0 } };
}

/** 대기 공고를 한 번 처리한다 (`js-process { mode: "queue" }`, 한 번에 최대 limit개) */
export async function processQueueOnce(session: ServerSession, limit: number): Promise<ApiResult<ProcessResult>> {
  const { data, error } = await session.client.functions.invoke<unknown>("js-process", {
    body: { mode: "queue", limit },
  });
  if (error) return { ok: false, error: functionError(error) };
  const value = parseProcessResult(data);
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
