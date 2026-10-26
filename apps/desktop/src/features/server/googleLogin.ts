import { invoke, isTauri } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { isAuthRetryableFetchError, type SupabaseClient } from "@supabase/supabase-js";
import { toServerSession, type ServerSession } from "./session";

/**
 * Google 로그인 (R28, R51–R53, D13).
 * Rust 수신기를 127.0.0.1 빈 포트에 열고 → Supabase가 만든 Google 로그인 주소를 기본 브라우저로 열고 →
 * 브라우저가 돌아온 `code`를 세션으로 바꾼다 (PKCE). 앱은 Google 비밀번호를 받지 않는다.
 * 계정 하나만 허용은 서버의 새 가입 막기(D12)가 하므로, 등록되지 않은 계정은 code 없이 거부로 돌아온다.
 */

/**
 * 로그인 실패 원인
 * - login-denied: 이 서버에 등록되지 않은 계정 (R53)
 * - login-timeout: 5분 안에 브라우저 로그인을 마치지 않음
 * - login-cancelled: 브라우저에서 취소했거나 앱에서 기다림을 멈춤
 * - login-failed: 그 밖의 실패 (설정 오류 등)
 * - network: 서버에 접속하지 못함
 */
export type LoginErrorKind = "login-denied" | "login-timeout" | "login-cancelled" | "login-failed" | "network";

export type LoginResult = { ok: true; session: ServerSession } | { ok: false; error: LoginErrorKind };

/** Rust `oauth_listener.rs`가 돌려주는 콜백 값 */
interface OAuthCallback {
  code: string | null;
  error: string | null;
  errorCode: string | null;
  errorDescription: string | null;
}

/** Rust 수신기 오류 글자 → 원인 */
function listenerError(e: unknown): LoginErrorKind {
  if (e === "timeout") return "login-timeout";
  if (e === "cancelled") return "login-cancelled";
  return "login-failed";
}

/** 새 가입 막기에 걸린 거부인지 (등록되지 않은 계정, R53) */
function isSignupDenied(callback: OAuthCallback): boolean {
  if (callback.errorCode === "signup_disabled") return true;
  return /sign ?ups? not allowed|signup/i.test(callback.errorDescription ?? "");
}

/** 로그인 페이지를 기본 브라우저로 연다 ([브라우저 다시 열기]도 이것) */
export function openLoginPage(url: string) {
  openUrl(url).catch(() => console.error("브라우저를 열지 못함"));
}

/** 기다리고 있는 로그인을 멈춘다 (마법사 [취소]) */
export function cancelGoogleLogin() {
  if (!isTauri()) return;
  invoke("cancel_oauth_listener").catch(() => undefined);
}

/**
 * Google로 로그인한다. 브라우저를 연 뒤 그 주소를 onOpened로 알린다 ([브라우저 다시 열기]에 씀).
 * client는 `createSessionClient`로 만든 PKCE 클라이언트여야 한다.
 */
export async function signInWithGoogle(
  client: SupabaseClient,
  onOpened: (url: string) => void,
): Promise<LoginResult> {
  if (!isTauri()) return { ok: false, error: "login-failed" };

  let port: number;
  try {
    port = await invoke<number>("start_oauth_listener");
  } catch {
    return { ok: false, error: "login-failed" };
  }
  // 브라우저를 열기 전부터 기다린다 (빨리 돌아와도 놓치지 않게)
  const waiting = invoke<OAuthCallback>("wait_oauth_callback").then(
    (callback) => ({ ok: true as const, callback }),
    (e: unknown) => ({ ok: false as const, error: listenerError(e) }),
  );

  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `http://127.0.0.1:${port}/auth/callback`,
      skipBrowserRedirect: true,
      // 이메일 확인 권한만 (R28, D9). Gmail 권한은 Gmail 기능이 따로 받는다 (R52).
      scopes: "email",
      // 거부된 뒤 [다른 계정으로 로그인]에서 계정을 고를 수 있게 한다
      queryParams: { prompt: "select_account" },
    },
  });
  if (error || !data.url) {
    cancelGoogleLogin();
    await waiting;
    return { ok: false, error: "login-failed" };
  }
  openLoginPage(data.url);
  onOpened(data.url);

  const received = await waiting;
  if (!received.ok) return { ok: false, error: received.error };
  const { callback } = received;
  if (!callback.code) {
    if (isSignupDenied(callback)) return { ok: false, error: "login-denied" };
    if (callback.error === "access_denied") return { ok: false, error: "login-cancelled" };
    return { ok: false, error: "login-failed" };
  }

  const exchanged = await client.auth.exchangeCodeForSession(callback.code);
  if (exchanged.error || !exchanged.data.session) {
    const network = exchanged.error && isAuthRetryableFetchError(exchanged.error);
    return { ok: false, error: network ? "network" : "login-failed" };
  }
  return { ok: true, session: toServerSession(client, exchanged.data.session) };
}
