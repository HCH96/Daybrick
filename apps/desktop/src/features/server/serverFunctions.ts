import {
  FunctionsFetchError,
  FunctionsHttpError,
  type PostgrestError,
  type SupabaseClient,
} from "@supabase/supabase-js";
import type { ApiErrorKind, ApiResult } from "./management";
import type { ServerSession } from "./session";

/**
 * 로그인한 세션으로 부르는 서버 쪽 작업: 서버 함수 `health`·`ai-key-check`, 본인 서버 상태 행 기록.
 * 실패는 `management.ts`와 같은 원인 종류(`ApiErrorKind`)로 돌려준다.
 */

/** `health` 응답 (D17): 서버 구조 번호, 본인의 Anthropic 키 등록일, 로그인 이메일 */
export interface HealthInfo {
  schema: number | null;
  keyRegisteredAt: string | null;
  email: string | null;
}

/** `ai-key-check` 실패 이유 (서버 함수가 돌려주는 글자) */
export type AiKeyFailure = "invalid" | "missing" | "upstream" | "network" | "unauthorized";

function statusKind(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not-found";
  if (status === 429) return "rate-limited";
  return "server";
}

function functionError(error: unknown): ApiErrorKind {
  if (error instanceof FunctionsHttpError) {
    const response: unknown = error.context;
    return response instanceof Response ? statusKind(response.status) : "server";
  }
  if (error instanceof FunctionsFetchError) return "network";
  return "server";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/** 로그인 뒤 접속 확인: DB를 실제로 읽는 `health` 서버 함수 (D17) */
export async function fetchHealth(client: SupabaseClient): Promise<ApiResult<HealthInfo>> {
  const { data, error } = await client.functions.invoke<unknown>("health");
  if (error) return { ok: false, error: functionError(error) };
  if (!isRecord(data)) return { ok: false, error: "bad-response" };
  return {
    ok: true,
    value: {
      schema: typeof data.schema === "number" ? data.schema : null,
      keyRegisteredAt: stringOrNull(data.keyRegisteredAt),
      email: stringOrNull(data.email),
    },
  };
}

export type AiKeyCheck = { ok: true } | { ok: false; reason: AiKeyFailure };

/** 서버 함수 비밀값 ANTHROPIC_API_KEY가 동작하는지 (`ai-key-check`) */
export async function checkServerAiKey(client: SupabaseClient): Promise<ApiResult<AiKeyCheck>> {
  const { data, error } = await client.functions.invoke<unknown>("ai-key-check");
  if (error) return { ok: false, error: functionError(error) };
  if (!isRecord(data) || typeof data.ok !== "boolean") return { ok: false, error: "bad-response" };
  if (data.ok) return { ok: true, value: { ok: true } };
  const reason = typeof data.reason === "string" ? data.reason : "upstream";
  const known: readonly AiKeyFailure[] = ["invalid", "missing", "upstream", "network", "unauthorized"];
  const failure = known.find((k) => k === reason) ?? "upstream";
  return { ok: true, value: { ok: false, reason: failure } };
}

function postgrestError(error: PostgrestError, status: number): ApiErrorKind {
  // status 0 = 요청 자체가 실패 (인터넷 끊김)
  if (status === 0) return "network";
  return error.code === "42501" ? "forbidden" : statusKind(status);
}

/**
 * 본인 서버 상태 행에 Anthropic 키 등록일을 기록한다 (R29, `daybrick_server_state`).
 * 등록일은 자동 세팅의 "계정 등록" 단계 시각을 쓴다 (D29). 행이 있으면 바꾼다.
 */
export async function recordKeyRegistered(session: ServerSession, at: string): Promise<ApiResult<null>> {
  const { error, status } = await session.client
    .from("daybrick_server_state")
    .upsert({ user_id: session.userId, anthropic_key_registered_at: at }, { onConflict: "user_id" });
  if (error) return { ok: false, error: postgrestError(error, status) };
  return { ok: true, value: null };
}
