import { invoke, isTauri } from "@tauri-apps/api/core";
import { isAuthRetryableFetchError, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "./supabaseClient";
import { parseSupabaseUrl } from "./validate";

/**
 * 로그인 세션 (R31, D14).
 * 자격 증명 관리자(`Daybrick/<ref>`)에는 refresh 토큰만 두고, 앱을 켤 때 그 토큰으로 세션을 다시 받는다.
 * 토큰이 새로 나올 때마다(로그인·갱신) 저장한 값을 바꾸고, 로그아웃하면 지운다.
 */

/** 로그인한 상태: 세션을 든 클라이언트와 계정 */
export interface ServerSession {
  client: SupabaseClient;
  userId: string;
  email: string | null;
}

interface ConnectionKeys {
  url: string;
  anonKey: string;
}

function projectRef(url: string): string | null {
  return parseSupabaseUrl(url)?.ref ?? null;
}

function saveRefreshToken(ref: string, token: string) {
  if (!isTauri()) return;
  invoke("save_refresh_token", { projectRef: ref, token }).catch(() => console.error("로그인 정보를 저장하지 못함"));
}

/** 이 서버의 저장된 로그인 정보를 지운다 (로그아웃·연결 해제) */
export async function deleteSavedLogin(url: string): Promise<void> {
  const ref = projectRef(url);
  if (!ref || !isTauri()) return;
  await invoke("delete_refresh_token", { projectRef: ref }).catch(() => console.error("로그인 정보를 지우지 못함"));
}

async function loadRefreshToken(ref: string): Promise<string | null> {
  if (!isTauri()) return null;
  try {
    return await invoke<string | null>("load_refresh_token", { projectRef: ref });
  } catch {
    return null;
  }
}

/**
 * 로그인에 쓰고 로그인 뒤에도 계속 쓰는 클라이언트 (PKCE, 토큰 자동 갱신).
 * 토큰이 바뀔 때마다 자격 증명 관리자의 값을 바꾼다.
 */
export function createSessionClient({ url, anonKey }: ConnectionKeys): SupabaseClient {
  const client = createServerClient(url, anonKey, { autoRefresh: true, pkce: true });
  const ref = projectRef(url);
  client.auth.onAuthStateChange((event, session) => {
    if (!ref) return;
    // 이 콜백 안에서는 Supabase 호출을 기다리지 않는다 (라이브러리 안내)
    if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
      saveRefreshToken(ref, session.refresh_token);
    } else if (event === "SIGNED_OUT") {
      void deleteSavedLogin(url);
    }
  });
  return client;
}

export function toServerSession(client: SupabaseClient, session: Session): ServerSession {
  return { client, userId: session.user.id, email: session.user.email ?? null };
}

/** 앱을 켤 때 저장된 refresh 토큰으로 세션을 다시 받는다. 토큰이 없거나 받지 못하면 null. */
export async function restoreSession(connection: ConnectionKeys): Promise<ServerSession | null> {
  const ref = projectRef(connection.url);
  if (!ref) return null;
  const token = await loadRefreshToken(ref);
  if (!token) return null;

  const client = createSessionClient(connection);
  const { data, error } = await client.auth.refreshSession({ refresh_token: token });
  if (error || !data.session) {
    await client.auth.stopAutoRefresh();
    // 인터넷이 끊겼으면 토큰은 남겨 두고 다음에 다시 받는다. 서버가 토큰을 거절했으면 지운다.
    if (error && !isAuthRetryableFetchError(error)) await deleteSavedLogin(connection.url);
    return null;
  }
  return toServerSession(client, data.session);
}

/** 세션 클라이언트를 멈춘다 (다른 세션으로 바꾸거나 연결을 끊을 때) */
export function stopSession(session: ServerSession) {
  void session.client.auth.stopAutoRefresh();
}

/** 로그아웃: 서버의 세션을 끝내고 저장된 로그인 정보를 지운다 */
export async function signOut(session: ServerSession, url: string): Promise<void> {
  await session.client.auth.signOut({ scope: "local" });
  stopSession(session);
  await deleteSavedLogin(url);
}
