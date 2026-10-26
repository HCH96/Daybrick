import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 로그인 세션을 메모리에만 두는 저장소.
 * 앱을 다시 켤 때 쓰는 refresh 토큰은 `session.ts`가 자격 증명 관리자에 따로 저장한다 (D14).
 */
export function createMemoryStorage() {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value);
    },
    removeItem: (key: string) => {
      items.delete(key);
    },
  };
}

interface ClientOptions {
  /** 세션 토큰을 스스로 갱신할지. 접속 확인처럼 잠깐 쓰는 클라이언트는 끈다 (타이머가 남지 않게). */
  autoRefresh?: boolean;
  /** Google 로그인(PKCE, D13)에 쓰는 클라이언트인지 */
  pkce?: boolean;
}

/** 주소·키로 Supabase 클라이언트를 만든다. 세션은 메모리에만 둔다. */
export function createServerClient(url: string, anonKey: string, options: ClientOptions = {}): SupabaseClient {
  const autoRefresh = options.autoRefresh ?? false;
  return createClient(url, anonKey, {
    auth: {
      storage: createMemoryStorage(),
      persistSession: autoRefresh,
      autoRefreshToken: autoRefresh,
      detectSessionInUrl: false,
      flowType: options.pkce ? "pkce" : "implicit",
    },
  });
}
