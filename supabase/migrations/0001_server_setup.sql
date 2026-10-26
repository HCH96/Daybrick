-- Daybrick 서버 구조 1번: 서버 연결 (server-setup)
-- 앱(Rust migrations.rs)이 이 파일을 포함해 "begin; 이 SQL; 번호 기록; commit;" 한 요청으로 적용한다 (D16, R26).
-- 모든 문은 다시 실행해도 안전해야 한다 (R16). 이미 배포한 단계이므로 내용을 고치지 않는다 (R27).

-- 서버 구조 기록: 적용한 번호, 시각, 앱 버전 (R20)
create table if not exists public.daybrick_schema_versions (
  version int primary key,
  applied_at timestamptz not null default now(),
  app_version text not null
);

alter table public.daybrick_schema_versions enable row level security;

-- 로그인 사용자는 읽기만 (R34). 쓰기는 관리 API(PAT)로만 한다.
revoke insert, update, delete on public.daybrick_schema_versions from anon, authenticated;
drop policy if exists daybrick_schema_versions_read on public.daybrick_schema_versions;
create policy daybrick_schema_versions_read on public.daybrick_schema_versions
  for select to authenticated
  using (true);

-- 서버 상태: 사용자별 한 행 (Anthropic 키 등록일 등)
create table if not exists public.daybrick_server_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  anthropic_key_registered_at timestamptz
);

alter table public.daybrick_server_state enable row level security;

-- 본인 행만 읽고 쓴다 (R34, D5)
drop policy if exists daybrick_server_state_select on public.daybrick_server_state;
create policy daybrick_server_state_select on public.daybrick_server_state
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists daybrick_server_state_insert on public.daybrick_server_state;
create policy daybrick_server_state_insert on public.daybrick_server_state
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists daybrick_server_state_update on public.daybrick_server_state;
create policy daybrick_server_state_update on public.daybrick_server_state
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- 공개 RPC: 로그인 전 접속 확인용, 최대 번호만 돌려준다 (D17)
create or replace function public.daybrick_schema_version()
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select max(version) from public.daybrick_schema_versions;
$$;

revoke all on function public.daybrick_schema_version() from public;
grant execute on function public.daybrick_schema_version() to anon, authenticated;
