// js-gmail 공용: 갱신 토큰 암호화와 Google 토큰 호출 (job-search R62, R70, D18).
// 갱신 토큰은 `GMAIL_TOKEN_KEY`(16진수 64글자 = 32바이트, D24)로 AES-GCM 암호화해 `js_gmail_tokens`에만 둔다.
// 토큰 값은 응답·로그 어디에도 남기지 않는다.
import { decodeBase64, encodeBase64 } from "jsr:@std/encoding/base64";
import type { Caller } from "../_shared/auth.ts";
import { noticeKeys, sendNotice } from "../_shared/notify.ts";

export const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const REVOKE_URL = "https://oauth2.googleapis.com/revoke";

/** 비밀값 GMAIL_TOKEN_KEY로 AES 키를 만든다. 없거나 모양이 틀리면 null */
async function tokenKey(): Promise<CryptoKey | null> {
  const hex = Deno.env.get("GMAIL_TOKEN_KEY") ?? "";
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) return null;
  const raw = new Uint8Array(32);
  for (let i = 0; i < 32; i++) raw[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export interface Sealed {
  cipher: string;
  iv: string;
}

/** 갱신 토큰을 암호화한다. 키가 없으면 null */
export async function sealToken(token: string): Promise<Sealed | null> {
  const key = await tokenKey();
  if (!key) return null;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(token));
  return { cipher: encodeBase64(new Uint8Array(cipher)), iv: encodeBase64(iv) };
}

/** 암호문을 갱신 토큰으로 되돌린다. 키가 없거나 풀 수 없으면 null */
export async function openToken(sealed: Sealed): Promise<string | null> {
  const key = await tokenKey();
  if (!key) return null;
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: decodeBase64(sealed.iv) },
      key,
      decodeBase64(sealed.cipher),
    );
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}

function clientKeys(): { id: string; secret: string } | null {
  const id = Deno.env.get("GOOGLE_CLIENT_ID") ?? "";
  const secret = Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "";
  return id && secret ? { id, secret } : null;
}

/**
 * 갱신 토큰으로 접근 토큰을 받는다.
 * - ok: 접근 토큰과 허락된 권한 목록
 * - rejected: Google이 토큰을 거절 (만료·권한 취소, R70)
 * - missing-key: 클라이언트 ID·비밀번호 비밀값이 없음
 * - network·upstream: 연결 실패·그 밖의 Google 오류
 */
export type AccessResult =
  | { ok: true; accessToken: string; scopes: string[] }
  | { ok: false; reason: "rejected" | "missing-key" | "network" | "upstream" };

export async function accessToken(refreshToken: string): Promise<AccessResult> {
  const keys = clientKeys();
  if (!keys) return { ok: false, reason: "missing-key" };
  let response: Response;
  try {
    response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: keys.id,
        client_secret: keys.secret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
  } catch {
    return { ok: false, reason: "network" };
  }
  const body: Record<string, unknown> = await response.json().catch(() => ({}));
  if (!response.ok) {
    // invalid_grant = 갱신 토큰 만료·취소
    return { ok: false, reason: body.error === "invalid_grant" ? "rejected" : "upstream" };
  }
  if (typeof body.access_token !== "string") return { ok: false, reason: "upstream" };
  const scopes = typeof body.scope === "string" ? body.scope.split(" ") : [];
  return { ok: true, accessToken: body.access_token, scopes };
}

/** Google 쪽 권한을 취소한다 (R63). 이미 취소된 토큰(400)도 취소된 것으로 본다. 연결 실패면 false */
export async function revokeToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(REVOKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
    });
    await response.body?.cancel();
    return response.ok || response.status === 400;
  } catch {
    return false;
  }
}

/** 갱신 토큰이 거절됐을 때 끊김을 기록하고, 처음 끊긴 때에만 알림을 보낸다 (R70, R80) */
export async function markBroken(caller: Caller): Promise<void> {
  const { data } = await caller.admin
    .from("js_gmail_tokens")
    .update({ broken_at: new Date().toISOString() })
    .eq("user_id", caller.userId)
    .is("broken_at", null)
    .select("user_id");
  if (!data || data.length === 0) return;
  await sendNotice(caller, {
    kind: "gmail-broken",
    importance: "warning",
    title: "Gmail 연결 끊김",
    body: "Google이 Gmail 읽기 권한을 거절해 메일 확인을 멈췄어요. 설정 탭에서 다시 연결해 주세요.",
    tab: "settings",
    mergeKey: noticeKeys.gmailBroken(),
  });
}

/**
 * 저장된 갱신 토큰으로 접근 토큰을 받는다 (14단계 메일 확인이 쓴다).
 * 토큰이 거절되면 `broken_at`을 남긴다.
 */
export async function storedAccessToken(caller: Caller): Promise<AccessResult | { ok: false; reason: "not-connected" }> {
  const { data } = await caller.admin
    .from("js_gmail_tokens")
    .select("cipher, iv, broken_at")
    .eq("user_id", caller.userId)
    .maybeSingle();
  if (!data || data.broken_at) return { ok: false, reason: "not-connected" };
  const token = await openToken({ cipher: data.cipher, iv: data.iv });
  if (!token) return { ok: false, reason: "missing-key" };
  const result = await accessToken(token);
  if (!result.ok && result.reason === "rejected") await markBroken(caller);
  return result;
}
