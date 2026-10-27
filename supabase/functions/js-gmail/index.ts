// js-gmail: Gmail 연결·해제·메일 확인 (job-search R60–R70, D18). 메일 확인 코드는 check.ts.
// 게이트웨이 JWT 확인을 끄고 배포하고, 호출자는 getCaller(사용자 토큰 또는 예약 비밀값)로 확인한다.
// 메일 확인은 예약 실행이 하루 한 번(07:00 KST) 부르고, 새 제안이 있으면 "메일 제안 N개" 알림을 보낸다. 앱은 Supabase Google 로그인으로 받은 Google 갱신 토큰을 메모리로만 넘기고,
// 이 함수가 확인·암호화해 `js_gmail_tokens`에 둔다. 토큰은 앱에 돌려주지 않는다.
// 요청: { action: "connect", refreshToken } | { action: "disconnect" } | { action: "check" }
// 응답:
// - connect: { ok: true, email } 또는 { ok: false, reason } (no-token·no-scope·rejected·missing-key·network·upstream·database)
// - disconnect: { ok: true, revoked } 또는 { ok: false, reason: "database" }. revoked=false면 Google 권한 취소를 못 한 것
// - check: { ok: true, scanned, matched, suggested, stopped } 또는 { ok: false, reason } (check.ts의 CheckResult)
import { getCaller, type Caller } from "../_shared/auth.ts";
import { handleOptions, json } from "../_shared/cors.ts";
import { noticeKeys, sendNotice } from "../_shared/notify.ts";
import { checkMail } from "./check.ts";
import { accessToken, GMAIL_SCOPE, openToken, revokeToken, sealToken } from "./token.ts";

async function callerEmail(caller: Caller): Promise<string | null> {
  const { data } = await caller.admin.auth.admin.getUserById(caller.userId);
  return data.user?.email ?? null;
}

async function connect(caller: Caller, refreshToken: unknown): Promise<Response> {
  if (typeof refreshToken !== "string" || refreshToken.trim() === "") return json({ ok: false, reason: "no-token" });
  // 토큰이 살아 있고 Gmail 읽기 권한이 실제로 허락됐는지 먼저 확인한다 (동의 화면에서 체크를 풀 수 있음)
  const access = await accessToken(refreshToken);
  if (!access.ok) return json({ ok: false, reason: access.reason });
  if (!access.scopes.includes(GMAIL_SCOPE)) {
    await revokeToken(refreshToken);
    return json({ ok: false, reason: "no-scope" });
  }

  const sealed = await sealToken(refreshToken);
  if (!sealed) return json({ ok: false, reason: "missing-key" });
  const email = await callerEmail(caller);
  const { error } = await caller.admin.from("js_gmail_tokens").upsert({
    user_id: caller.userId,
    cipher: sealed.cipher,
    iv: sealed.iv,
    email,
    broken_at: null,
  });
  if (error) return json({ ok: false, reason: "database" });
  return json({ ok: true, email });
}

async function disconnect(caller: Caller): Promise<Response> {
  const { data } = await caller.admin
    .from("js_gmail_tokens")
    .select("cipher, iv")
    .eq("user_id", caller.userId)
    .maybeSingle();
  let revoked = true;
  if (data) {
    const token = await openToken({ cipher: data.cipher, iv: data.iv });
    revoked = token ? await revokeToken(token) : false;
  }
  // Google 권한 취소에 실패해도 서버 토큰은 지운다 (R62: 쓰지 않을 토큰을 남기지 않음)
  const { error } = await caller.admin.from("js_gmail_tokens").delete().eq("user_id", caller.userId);
  if (error) return json({ ok: false, reason: "database" });
  return json({ ok: true, revoked });
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  const caller = await getCaller(req);
  if (!caller) return json({ ok: false, reason: "unauthorized" }, 401);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // 본문이 없으면 알 수 없는 요청
  }
  if (body.action === "connect") return await connect(caller, body.refreshToken);
  if (body.action === "disconnect") return await disconnect(caller);
  if (body.action === "check") {
    const result = await checkMail(caller);
    if (result.ok && result.suggested > 0) await noticeMail(caller);
    return json(result);
  }
  return json({ ok: false, reason: "unknown-action" }, 400);
});

/** 메일 제안 알림 (R80): N은 처리하지 않은 제안 전체 수. 합치기 키로 안 읽은 알림 하나를 갱신한다 */
async function noticeMail(caller: Caller) {
  const { count, error } = await caller.admin.from("js_mail_suggestions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", caller.userId).eq("state", "pending");
  if (error || !count) return;
  await sendNotice(caller, {
    kind: "mail-suggest",
    importance: "info",
    title: `메일 제안 ${count}개`,
    tab: "mail",
    mergeKey: noticeKeys.mail(),
  });
}
