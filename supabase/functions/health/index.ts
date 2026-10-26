// health: 로그인 뒤 접속 확인 (D17).
// JWT 확인을 켜고 배포한다 (R35). 부른 사용자의 권한(RLS)으로 DB를 실제로 읽어
// 서버 구조 번호, 본인의 Anthropic 키 등록일, 로그인 이메일을 돌려준다.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { handleOptions, json } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  const authorization = req.headers.get("Authorization");
  if (!authorization) return json({ error: "unauthorized" }, 401);

  // 부른 사용자의 토큰으로 클라이언트를 만든다: 본인 행만 읽힌다
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return json({ error: "unauthorized" }, 401);
  const user = userData.user;

  const schema = await supabase.rpc("daybrick_schema_version");
  if (schema.error) return json({ error: "database" }, 500);

  const state = await supabase
    .from("daybrick_server_state")
    .select("anthropic_key_registered_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (state.error) return json({ error: "database" }, 500);

  return json({
    schema: typeof schema.data === "number" ? schema.data : null,
    keyRegisteredAt: state.data?.anthropic_key_registered_at ?? null,
    email: user.email ?? null,
  });
});
