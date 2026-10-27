import { invoke, isTauri } from "@tauri-apps/api/core";
import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import type { ApiErrorKind } from "../server/management";
import { cancelGoogleLogin, openLoginPage } from "../server/googleLogin";
import type { ServerSession } from "../server/session";
import { createServerClient } from "../server/supabaseClient";
import { saveGmailToken, type GmailSaveFailReason } from "./gmailApi";

/**
 * Gmail 연결 (R60–R62, D18 사용자 결정으로 바꿈).
 * 앱 로그인과 같은 Supabase Google 로그인을 잠깐 쓰는 클라이언트로 한 번 더 열어
 * Gmail 읽기 권한(gmail.readonly)과 갱신 토큰(access_type=offline, prompt=consent)을 받는다.
 * 받은 Google 갱신 토큰(provider_refresh_token)은 메모리로만 `js-gmail`에 넘기고, 잠깐 쓴 세션은 바로 끝낸다.
 * 앱의 로그인 세션은 그대로 둔다. 다른 Google 계정을 고르는 경우는 다루지 않는다 (사용자 결정).
 */

const GMAIL_SCOPES = "email https://www.googleapis.com/auth/gmail.readonly";

export type GmailConnectFailure =
  | { kind: "login"; reason: "timeout" | "cancelled" | "failed" }
  | { kind: "save"; reason: GmailSaveFailReason }
  | { kind: "api"; error: ApiErrorKind };

export type GmailConnectResult = { ok: true } | { ok: false; failure: GmailConnectFailure };

interface OAuthCallback {
  code: string | null;
  error: string | null;
}

function fail(failure: GmailConnectFailure): GmailConnectResult {
  return { ok: false, failure };
}

/** 기다리고 있는 Gmail 연결을 멈춘다 ([취소]) */
export function cancelGmailConnect() {
  cancelGoogleLogin();
}

/**
 * Gmail을 연결한다. 브라우저를 연 뒤 그 주소를 onOpened로 알린다 ([브라우저 다시 열기]에 씀).
 * connection은 지금 연결된 서버 주소·공개 키.
 */
export async function connectGmail(
  session: ServerSession,
  connection: { url: string; anonKey: string },
  onOpened: (url: string) => void,
): Promise<GmailConnectResult> {
  if (!isTauri()) return fail({ kind: "login", reason: "failed" });

  let port: number;
  try {
    port = await invoke<number>("start_oauth_listener");
  } catch {
    return fail({ kind: "login", reason: "failed" });
  }
  const waiting = invoke<OAuthCallback>("wait_oauth_callback").then(
    (callback) => ({ ok: true as const, callback }),
    (e: unknown) => ({ ok: false as const, reason: e === "timeout" ? ("timeout" as const) : ("cancelled" as const) }),
  );

  // 잠깐 쓰는 PKCE 클라이언트: 앱 세션(자격 증명 관리자에 저장된 로그인)과 섞이지 않게 한다
  const temp = createServerClient(connection.url, connection.anonKey, { pkce: true });
  const queryParams: Record<string, string> = { access_type: "offline", prompt: "consent" };
  if (session.email) queryParams.login_hint = session.email;
  const { data, error } = await temp.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `http://127.0.0.1:${port}/auth/callback`,
      skipBrowserRedirect: true,
      scopes: GMAIL_SCOPES,
      queryParams,
    },
  });
  if (error || !data.url) {
    cancelGoogleLogin();
    await waiting;
    return fail({ kind: "login", reason: "failed" });
  }
  openLoginPage(data.url);
  onOpened(data.url);

  const received = await waiting;
  if (!received.ok) return fail({ kind: "login", reason: received.reason });
  if (!received.callback.code) {
    return fail({ kind: "login", reason: received.callback.error === "access_denied" ? "cancelled" : "failed" });
  }

  const exchanged = await temp.auth.exchangeCodeForSession(received.callback.code);
  if (exchanged.error || !exchanged.data.session) {
    const network = exchanged.error && isAuthRetryableFetchError(exchanged.error);
    return network ? fail({ kind: "api", error: "network" }) : fail({ kind: "login", reason: "failed" });
  }
  const refreshToken = exchanged.data.session.provider_refresh_token ?? null;
  // 잠깐 쓴 세션은 바로 끝낸다 (앱 세션은 그대로)
  await temp.auth.signOut({ scope: "local" }).catch(() => undefined);
  if (!refreshToken) return fail({ kind: "save", reason: "no-token" });

  const saved = await saveGmailToken(session, refreshToken);
  if (!saved.ok) return fail({ kind: "api", error: saved.error });
  if (!saved.value.ok) return fail({ kind: "save", reason: saved.value.reason });
  return { ok: true };
}
