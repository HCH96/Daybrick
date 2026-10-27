// 서버 함수 공용: 호출자 확인과 서비스 클라이언트 (job-search D15).
// 사용자 토큰으로 부른 사람을 확인한다. 예약 실행 비밀값으로 부르는 경로는 15단계에서 더한다.
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

/** 확인된 호출자: 사용자 id와 서비스 역할 클라이언트 (RLS를 거치지 않으므로 항상 user_id로 걸러 쓴다) */
export interface Caller {
  userId: string;
  admin: SupabaseClient;
}

/** 서비스 역할 클라이언트. `js_ai_calls` 기록처럼 앱이 쓸 수 없는 테이블에 넣을 때 쓴다. */
export function serviceClient(): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** 요청의 사용자 토큰으로 호출자를 확인한다. 토큰이 없거나 맞지 않으면 null */
export async function getCaller(req: Request): Promise<Caller | null> {
  const authorization = req.headers.get("Authorization");
  if (!authorization) return null;
  const userClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data.user) return null;
  return { userId: data.user.id, admin: serviceClient() };
}
