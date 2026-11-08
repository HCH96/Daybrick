-- Daybrick 서버 구조 11번: Gmail 연결 상태 보기를 호출자 권한(security invoker)으로 바꾼다 (job-search R60, R70, D91)
-- 앱(Rust migrations.rs)이 이 파일을 포함해 "begin; 이 SQL; 번호 기록; commit;" 한 요청으로 적용한다 (server-setup D16).
-- 모든 문은 다시 실행해도 안전해야 한다. 배포한 뒤에는 내용을 고치지 않고 새 번호로 덧붙인다 (server-setup R27).
-- 이 파일에는 테이블을 지우거나 비우는 문을 넣지 않는다.
--
-- 0003의 js_gmail_status는 만든 사람 권한으로 js_gmail_tokens를 읽어 Supabase Security Advisor가
-- "Security Definer View"(CRITICAL)로 표시했다. 이제 보기는 로그인 사용자 권한으로 읽는다.
-- 그러려면 로그인 사용자가 토큰 테이블의 본인 행, 토큰이 아닌 열만 읽을 수 있어야 한다.
-- 토큰 열(cipher, iv)은 권한을 주지 않아 계속 서비스 역할만 읽는다. 쓰기 권한도 주지 않는다.

-- 토큰이 아닌 열만 읽기 권한 (열 단위 grant, 다시 줘도 안전)
grant select (user_id, email, last_checked_at, broken_at) on public.js_gmail_tokens to authenticated;

-- 본인 행만 읽는다
drop policy if exists js_gmail_tokens_read on public.js_gmail_tokens;
create policy js_gmail_tokens_read on public.js_gmail_tokens
  for select to authenticated
  using (user_id = (select auth.uid()));

-- 보기는 같은 모양 그대로, 호출자 권한으로 읽게 한다 (앱의 읽기 코드는 바뀌지 않음)
create or replace view public.js_gmail_status with (security_invoker = true, security_barrier = true) as
  select user_id, broken_at is null as connected, email, last_checked_at
  from public.js_gmail_tokens
  where user_id = (select auth.uid());

revoke all on public.js_gmail_status from anon, authenticated;
grant select on public.js_gmail_status to authenticated;
