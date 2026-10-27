// 서버 함수 공용: 호출자 확인과 서비스 클라이언트 (job-search D15, D19).
// 두 경로로 부른 사람을 확인한다.
// 1. 예약 실행: `x-daybrick-cron` 머리글이 함수 비밀값 `DAYBRICK_CRON_SECRET`와 같으면 서비스 역할로
//    이 서버의 사용자(계정 하나, 새 가입 막기)를 대신 처리한다. 머리글이 있는데 틀리면 거절한다.
// 2. 앱: 요청의 사용자 토큰(Authorization)으로 확인한다.
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

/** 확인된 호출자: 사용자 id와 서비스 역할 클라이언트 (RLS를 거치지 않으므로 항상 user_id로 걸러 쓴다) */
export interface Caller {
  userId: string;
  admin: SupabaseClient;
  /** 예약 실행(pg_cron)이 부른 것이면 true */
  viaCron: boolean;
}

export const CRON_HEADER = "x-daybrick-cron";

/** 서비스 역할 클라이언트. `js_ai_calls` 기록처럼 앱이 쓸 수 없는 테이블에 넣을 때 쓴다. */
export function serviceClient(): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** 길이가 같을 때 모든 글자를 비교한다 (비교 시간으로 값을 짐작하지 못하게) */
function sameSecret(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** 이 서버의 사용자: 가장 먼저 만든 계정 (자동 세팅이 첫 로그인 뒤 새 가입을 막아 계정은 하나다) */
async function soleUserId(admin: SupabaseClient): Promise<string | null> {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 50 });
  if (error || data.users.length === 0) return null;
  const sorted = [...data.users].sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));
  return sorted[0].id;
}

/** 예약 실행 머리글로 확인한다. 머리글이 없으면 undefined, 틀리거나 사용자가 없으면 null */
async function cronCaller(req: Request): Promise<Caller | null | undefined> {
  const header = req.headers.get(CRON_HEADER);
  if (header === null) return undefined;
  const secret = Deno.env.get("DAYBRICK_CRON_SECRET") ?? "";
  if (secret === "" || !sameSecret(header, secret)) return null;
  const admin = serviceClient();
  const userId = await soleUserId(admin);
  return userId ? { userId, admin, viaCron: true } : null;
}

/** 요청의 예약 비밀값 또는 사용자 토큰으로 호출자를 확인한다. 둘 다 없거나 맞지 않으면 null (함수는 401) */
export async function getCaller(req: Request): Promise<Caller | null> {
  const cron = await cronCaller(req);
  if (cron !== undefined) return cron;

  const authorization = req.headers.get("Authorization");
  if (!authorization) return null;
  const userClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data.user) return null;
  return { userId: data.user.id, admin: serviceClient(), viaCron: false };
}
