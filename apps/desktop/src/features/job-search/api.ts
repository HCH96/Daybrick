import type { PostgrestError } from "@supabase/supabase-js";
import type { ApiErrorKind, ApiResult } from "../server/management";
import type { ServerSession } from "../server/session";
import type { JsSettings, ModelPrice } from "./types";

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
