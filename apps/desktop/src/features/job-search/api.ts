import type { PostgrestError } from "@supabase/supabase-js";
import type { ApiErrorKind, ApiResult } from "../server/management";
import type { ServerSession } from "../server/session";
import type { AiCall, BalanceRecord, JsSettings, ModelPrice } from "./types";

/**
 * 구직 관리 서버 읽기·쓰기 (로그인 세션의 Supabase 클라이언트 사용).
 * 실패는 서버 연결과 같은 원인 종류(`ApiErrorKind`)로 돌려준다. 단계마다 함수를 더한다.
 */

function postgrestError(error: PostgrestError, status: number): ApiErrorKind {
  // status 0 = 요청 자체가 실패 (인터넷 끊김)
  if (status === 0) return "network";
  if (error.code === "42501" || status === 403) return "forbidden";
  if (status === 401) return "unauthorized";
  if (status === 404) return "not-found";
  if (status === 429) return "rate-limited";
  return "server";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** numeric 열은 글자로 올 수 있어 숫자로 바꾼다 */
function toNumber(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

function parsePrice(value: unknown): ModelPrice | null {
  if (!isRecord(value)) return null;
  const input = toNumber(value.input);
  const output = toNumber(value.output);
  if (input === null || output === null) return null;
  return {
    input,
    output,
    cacheRead: toNumber(value.cacheRead) ?? 0,
    cacheWrite: toNumber(value.cacheWrite) ?? 0,
  };
}

function parseSettings(row: unknown): JsSettings | null {
  if (!isRecord(row)) return null;
  const dailyLimit = toNumber(row.daily_limit);
  const monthlyLimitUsd = toNumber(row.monthly_limit_usd);
  const profileVersion = toNumber(row.profile_version);
  if (dailyLimit === null || monthlyLimitUsd === null || profileVersion === null) return null;
  const prices: Record<string, ModelPrice> = {};
  if (isRecord(row.prices)) {
    for (const [model, value] of Object.entries(row.prices)) {
      const price = parsePrice(value);
      if (price) prices[model] = price;
    }
  }
  return { dailyLimit, monthlyLimitUsd, prices, profileVersion };
}

/** 본인 설정을 읽는다. 행이 없으면 기본값(하루 100회, 월 $10, 기본 단가)으로 만든 뒤 돌려준다 (R73, R79) */
export async function loadSettings(session: ServerSession): Promise<ApiResult<JsSettings>> {
  const { data, error, status } = await session.client.rpc("js_ensure_settings");
  if (error) return { ok: false, error: postgrestError(error, status) };
  const settings = parseSettings(data);
  return settings ? { ok: true, value: settings } : { ok: false, error: "bad-response" };
}

/** 하루 호출 수·월 사용액 한도를 저장한다 (R73) */
export async function saveLimits(
  session: ServerSession,
  limits: { dailyLimit: number; monthlyLimitUsd: number },
): Promise<ApiResult<null>> {
  const { error, status } = await session.client
    .from("js_settings")
    .update({ daily_limit: limits.dailyLimit, monthly_limit_usd: limits.monthlyLimitUsd })
    .eq("user_id", session.userId);
  return error ? { ok: false, error: postgrestError(error, status) } : { ok: true, value: null };
}

/** 모델 단가표를 저장한다 (R79). 받은 표로 통째로 바꾼다 */
export async function savePrices(
  session: ServerSession,
  prices: Record<string, ModelPrice>,
): Promise<ApiResult<null>> {
  const { error, status } = await session.client
    .from("js_settings")
    .update({ prices })
    .eq("user_id", session.userId);
  return error ? { ok: false, error: postgrestError(error, status) } : { ok: true, value: null };
}

function parseBalanceRecord(row: unknown): BalanceRecord | null {
  if (!isRecord(row)) return null;
  const amountUsd = toNumber(row.amount_usd);
  if (typeof row.id !== "string" || typeof row.set_at !== "string" || amountUsd === null) return null;
  return { id: row.id, amountUsd, setAt: row.set_at };
}

/** 기준 잔액 입력 기록: 최근 것부터 `limit`개 (R76) */
export async function loadBalanceRecords(session: ServerSession, limit: number): Promise<ApiResult<BalanceRecord[]>> {
  const { data, error, status } = await session.client
    .from("js_balance_records")
    .select("id, amount_usd, set_at")
    .order("set_at", { ascending: false })
    .limit(limit);
  if (error) return { ok: false, error: postgrestError(error, status) };
  const records = (data ?? []).map(parseBalanceRecord);
  return records.every((r): r is BalanceRecord => r !== null)
    ? { ok: true, value: records }
    : { ok: false, error: "bad-response" };
}

/** 기준 잔액을 새로 넣는다: 이 시점부터 기준 이후 사용액을 $0부터 센다 (R76) */
export async function addBalanceRecord(session: ServerSession, amountUsd: number): Promise<ApiResult<null>> {
  const { error, status } = await session.client.from("js_balance_records").insert({ amount_usd: amountUsd });
  return error ? { ok: false, error: postgrestError(error, status) } : { ok: true, value: null };
}

function parseAiCall(row: unknown): AiCall | null {
  if (!isRecord(row)) return null;
  const costUsd = toNumber(row.cost_usd);
  if (typeof row.id !== "string" || typeof row.at !== "string" || costUsd === null) return null;
  return {
    id: row.id,
    at: row.at,
    model: typeof row.model === "string" ? row.model : "",
    task: typeof row.task === "string" ? row.task : "",
    inputTokens: toNumber(row.input_tokens) ?? 0,
    outputTokens: toNumber(row.output_tokens) ?? 0,
    cacheRead: toNumber(row.cache_read) ?? 0,
    cacheWrite: toNumber(row.cache_write) ?? 0,
    costUsd,
    ok: row.ok !== false,
  };
}

const PAGE_SIZE = 1000;

/** `sinceIso` 이후의 AI 호출 기록 (읽기만, R72). 서버 응답 상한(1000행)을 넘으면 나눠 읽는다 */
export async function loadAiCallsSince(session: ServerSession, sinceIso: string): Promise<ApiResult<AiCall[]>> {
  const calls: AiCall[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error, status } = await session.client
      .from("js_ai_calls")
      .select("id, at, model, task, input_tokens, output_tokens, cache_read, cache_write, cost_usd, ok")
      .gte("at", sinceIso)
      .order("at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) return { ok: false, error: postgrestError(error, status) };
    const rows = data ?? [];
    for (const row of rows) {
      const call = parseAiCall(row);
      if (!call) return { ok: false, error: "bad-response" };
      calls.push(call);
    }
    if (rows.length < PAGE_SIZE) return { ok: true, value: calls };
  }
}
