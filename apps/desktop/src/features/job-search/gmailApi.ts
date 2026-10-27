import type { ApiResult } from "../server/management";
import type { ServerSession } from "../server/session";
import { functionError, isRecord, postgrestError } from "./api";

/**
 * Gmail 연결 상태 읽기와 `js-gmail` 연결·해제 호출 (R60–R63, R70, D18).
 * 앱은 토큰을 저장하지 않는다. 연결할 때 받은 갱신 토큰은 메모리로만 서버 함수에 넘긴다.
 */

/** 연결 상태. 행이 없으면 off, 토큰이 거절돼 끊겼으면 broken (R70) */
export type GmailStatus =
  | { state: "off" }
  | { state: "connected" | "broken"; email: string | null; lastCheckedAt: string | null };

export async function loadGmailStatus(session: ServerSession): Promise<ApiResult<GmailStatus>> {
  const { data, error, status } = await session.client
    .from("js_gmail_status")
    .select("connected, email, last_checked_at")
    .maybeSingle();
  if (error) return { ok: false, error: postgrestError(error, status) };
  if (!isRecord(data)) return { ok: true, value: { state: "off" } };
  return {
    ok: true,
    value: {
      state: data.connected === true ? "connected" : "broken",
      email: typeof data.email === "string" ? data.email : null,
      lastCheckedAt: typeof data.last_checked_at === "string" ? data.last_checked_at : null,
    },
  };
}

const CONNECT_REASONS = ["no-token", "no-scope", "rejected", "missing-key", "network", "upstream", "database"] as const;
export type GmailSaveFailReason = (typeof CONNECT_REASONS)[number];

export type GmailSaveResult = { ok: true } | { ok: false; reason: GmailSaveFailReason };

/** 갱신 토큰을 서버에 넘겨 확인·암호화 저장한다 (R62) */
export async function saveGmailToken(session: ServerSession, refreshToken: string): Promise<ApiResult<GmailSaveResult>> {
  const { data, error } = await session.client.functions.invoke<unknown>("js-gmail", {
    body: { action: "connect", refreshToken },
  });
  if (error) return { ok: false, error: functionError(error) };
  if (!isRecord(data) || typeof data.ok !== "boolean") return { ok: false, error: "bad-response" };
  if (data.ok) return { ok: true, value: { ok: true } };
  const reason = CONNECT_REASONS.find((r) => r === data.reason) ?? "upstream";
  return { ok: true, value: { ok: false, reason } };
}

/** 연결 해제 (R63): 서버 토큰을 지우고 Google 권한을 취소한다. revoked=false면 Google 쪽 취소는 못 했다 */
export async function disconnectGmail(session: ServerSession): Promise<ApiResult<{ revoked: boolean }>> {
  const { data, error } = await session.client.functions.invoke<unknown>("js-gmail", {
    body: { action: "disconnect" },
  });
  if (error) return { ok: false, error: functionError(error) };
  if (!isRecord(data) || data.ok !== true) return { ok: false, error: isRecord(data) ? "server" : "bad-response" };
  return { ok: true, value: { revoked: data.revoked !== false } };
}
