// ai-key-check: 서버 함수 비밀값 ANTHROPIC_API_KEY가 동작하는지 확인한다.
// JWT 확인을 켜고 배포한다 (R35). 요금이 들지 않는 모델 목록 조회만 하고, 성공 여부만 돌려준다.
// 키 값과 Anthropic 응답 본문은 돌려주지 않는다 (R18).
import { createClient } from "jsr:@supabase/supabase-js@2";
import { handleOptions, json } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  const authorization = req.headers.get("Authorization");
  if (!authorization) return json({ ok: false, reason: "unauthorized" }, 401);

  // 로그인한 사용자인지 확인 (anon 키만 든 요청은 사용자 없음으로 거절)
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return json({ ok: false, reason: "unauthorized" }, 401);

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ ok: false, reason: "missing" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/models?limit=1", {
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
    });
    await response.body?.cancel();
    if (response.ok) return json({ ok: true });
    const reason = response.status === 401 || response.status === 403 ? "invalid" : "upstream";
    return json({ ok: false, reason });
  } catch {
    return json({ ok: false, reason: "network" });
  }
});
