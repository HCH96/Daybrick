-- Daybrick 서버 구조 3번: 구직 관리 (job-search)
-- 앱(Rust migrations.rs)이 이 파일을 포함해 "begin; 이 SQL; 번호 기록; commit;" 한 요청으로 적용한다 (server-setup D16).
-- 모든 문은 다시 실행해도 안전해야 한다. 배포한 뒤에는 내용을 고치지 않고 새 번호로 덧붙인다 (server-setup R27).
-- 테이블은 `js_` 접두어, 본인 행만 읽고 쓴다. `js_gmail_tokens`만 서비스 역할 전용 (D14). 공개(anon) 정책은 두지 않는다 (R3).

-- 한도·단가 설정: 사용자별 한 행 (R73, R79). 단가는 100만 토큰당 달러 (D23)
create table if not exists public.js_settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  daily_limit int not null default 100,
  monthly_limit_usd numeric not null default 10,
  prices jsonb not null default '{
    "claude-opus-5-5": {"input": 4, "output": 20, "cacheRead": 0.4, "cacheWrite": 5},
    "claude-haiku-5-5": {"input": 0.1, "output": 0.5, "cacheRead": 0.01, "cacheWrite": 0.125}
  }'::jsonb,
  profile_version int not null default 0
);

-- 기준 잔액 입력 기록: 마지막 행이 기준 (R76)
create table if not exists public.js_balance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  amount_usd numeric not null,
  set_at timestamptz not null default now()
);
create index if not exists js_balance_records_user_idx on public.js_balance_records (user_id, set_at desc);

-- AI 호출 기록 (R72). 서버 함수(서비스 역할)만 넣는다
create table if not exists public.js_ai_calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  at timestamptz not null default now(),
  model text not null,
  task text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  cache_read int not null default 0,
  cache_write int not null default 0,
  cost_usd numeric not null default 0,
  ok boolean not null default true
);
create index if not exists js_ai_calls_user_at_idx on public.js_ai_calls (user_id, at desc);

-- 프로필 자료 (원본 파일은 버킷 job-search의 <user_id>/ 아래)
create table if not exists public.js_profile_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('pdf', 'md', 'text')),
  storage_path text,
  text text,
  created_at timestamptz not null default now()
);

-- 프로필: 저장할 때마다 버전 하나
create table if not exists public.js_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  version int not null,
  data jsonb not null,
  sources jsonb not null default '[]'::jsonb,
  saved_at timestamptz not null default now(),
  unique (user_id, version)
);

-- 프로필 초안: 사용자별 하나
create table if not exists public.js_profile_drafts (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- 어댑터 규칙 (D9, D16)
create table if not exists public.js_adapters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  rule jsonb not null,
  version int not null default 1,
  builtin boolean not null default false
);

-- 수집 사이트
create table if not exists public.js_sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  url text not null,
  adapter_id uuid references public.js_adapters (id) on delete set null,
  vars jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  last_result jsonb,
  last_at timestamptz
);

-- 수집 기록
create table if not exists public.js_collect_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  site_id uuid references public.js_sites (id) on delete set null,
  at timestamptz not null default now(),
  count int not null default 0,
  ok boolean not null,
  reason text
);
create index if not exists js_collect_runs_user_at_idx on public.js_collect_runs (user_id, at desc);

-- 공고. stage: new → filtered1 | extracted → filtered2 | suspect | scored / waiting(한도)
create table if not exists public.js_postings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  site_id uuid references public.js_sites (id) on delete set null,
  ext_id text,
  url text,
  company text,
  title text,
  duty text,
  norm_key text,
  body_text text,
  image_paths text[] not null default '{}',
  collected_at timestamptz not null default now(),
  stage text not null default 'new'
    check (stage in ('new', 'filtered1', 'extracted', 'filtered2', 'suspect', 'scored', 'waiting')),
  filtered_by jsonb,
  hidden_at timestamptz,
  applied_at timestamptz,
  unique (user_id, site_id, ext_id)
);
create index if not exists js_postings_user_stage_idx on public.js_postings (user_id, stage);
create index if not exists js_postings_user_norm_key_idx on public.js_postings (user_id, norm_key);

-- 추출 결과 (R48)와 인젝션 의심
create table if not exists public.js_extractions (
  posting_id uuid primary key references public.js_postings (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  fields jsonb not null default '{}'::jsonb,
  suspect boolean not null default false,
  suspect_quotes text[] not null default '{}'
);

-- 채점 결과
create table if not exists public.js_scores (
  posting_id uuid primary key references public.js_postings (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  profile_version int not null,
  score int not null,
  grade text not null,
  strengths jsonb not null default '[]'::jsonb,
  gaps jsonb not null default '[]'::jsonb,
  summary text not null default ''
);

-- 필터 조건 (D10)
create table if not exists public.js_filters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  stage int not null check (stage in (1, 2)),
  kind text not null check (kind in ('title-include', 'title-exclude', 'company-exclude', 'skill-include',
    'skill-exclude', 'max-years', 'employment', 'skill-overlap')),
  value jsonb not null,
  enabled boolean not null default true
);

-- 지원 건 요약 (D1). 카드는 PC 로컬에 있다
create table if not exists public.js_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  posting_id uuid references public.js_postings (id) on delete set null,
  company text not null,
  domain text,
  card_id text,
  status text not null,
  closed boolean not null default false
);

-- 메일 제안
create table if not exists public.js_mail_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  application_id uuid references public.js_applications (id) on delete cascade,
  subject text not null default '',
  sender text not null default '',
  received_at timestamptz,
  category text not null,
  from_status text,
  to_status text,
  stage text,
  schedule jsonb,
  quote text not null default '',
  state text not null default 'pending' check (state in ('pending', 'approved', 'rejected')),
  handled_at timestamptz
);

-- Gmail 토큰: 암호화한 갱신 토큰 (D3, D18). 서비스 역할만 읽고 쓴다
create table if not exists public.js_gmail_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  cipher text not null,
  iv text not null,
  email text,
  last_checked_at timestamptz,
  broken_at timestamptz
);

-- RLS: 모든 js_ 테이블에 켠다. 로그인하지 않은 사용자는 아무것도 못 한다 (R3)
do $$
declare
  t text;
begin
  foreach t in array array[
    'js_settings', 'js_balance_records', 'js_ai_calls', 'js_profile_sources', 'js_profiles',
    'js_profile_drafts', 'js_adapters', 'js_sites', 'js_collect_runs', 'js_postings', 'js_extractions',
    'js_scores', 'js_filters', 'js_applications', 'js_mail_suggestions', 'js_gmail_tokens'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;

  -- 본인 행만 읽고 쓰고 지운다 (D14)
  foreach t in array array[
    'js_settings', 'js_balance_records', 'js_profile_sources', 'js_profiles', 'js_profile_drafts',
    'js_adapters', 'js_sites', 'js_collect_runs', 'js_postings', 'js_extractions', 'js_scores',
    'js_filters', 'js_applications', 'js_mail_suggestions'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_own', t);
    execute format(
      'create policy %I on public.%I for all to authenticated '
      'using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      t || '_own', t);
  end loop;
end;
$$;

-- AI 호출 기록은 읽기만 (한도 검사의 근거라 앱이 고치지 못하게, R73)
revoke insert, update, delete on public.js_ai_calls from authenticated;
drop policy if exists js_ai_calls_read on public.js_ai_calls;
create policy js_ai_calls_read on public.js_ai_calls
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Gmail 토큰은 정책 없음 + 권한 회수: 서비스 역할만 접근 (D14)
revoke all on public.js_gmail_tokens from authenticated;

-- 앱이 읽는 Gmail 연결 상태: 연결 여부·이메일·마지막 확인만 (토큰은 보이지 않음)
-- 보기는 만든 사람 권한으로 토큰 테이블을 읽으므로, 본인 행 조건이 먼저 걸리게 security_barrier를 켠다
create or replace view public.js_gmail_status with (security_barrier = true) as
  select user_id, broken_at is null as connected, email, last_checked_at
  from public.js_gmail_tokens
  where user_id = (select auth.uid());

revoke all on public.js_gmail_status from anon, authenticated;
grant select on public.js_gmail_status to authenticated;

-- 기본 설정 행: 없으면 만들고 본인 행을 돌려준다 (R73, R79)
create or replace function public.js_ensure_settings()
returns public.js_settings
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_row public.js_settings;
begin
  if auth.uid() is null then
    raise exception 'js_ensure_settings: 로그인이 필요합니다';
  end if;
  insert into public.js_settings (user_id) values (auth.uid()) on conflict (user_id) do nothing;
  select * into v_row from public.js_settings where user_id = auth.uid();
  return v_row;
end;
$$;

revoke all on function public.js_ensure_settings() from public, anon;
grant execute on function public.js_ensure_settings() to authenticated;

-- 비공개 버킷: 프로필 자료·공고 이미지 (D14)
insert into storage.buckets (id, name, public)
values ('job-search', 'job-search', false)
on conflict (id) do nothing;

-- 본인 폴더(<user_id>/…)만 읽고 쓰고 지운다
drop policy if exists js_storage_select on storage.objects;
create policy js_storage_select on storage.objects
  for select to authenticated
  using (bucket_id = 'job-search' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists js_storage_insert on storage.objects;
create policy js_storage_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'job-search' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists js_storage_update on storage.objects;
create policy js_storage_update on storage.objects
  for update to authenticated
  using (bucket_id = 'job-search' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'job-search' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists js_storage_delete on storage.objects;
create policy js_storage_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'job-search' and (storage.foldername(name))[1] = (select auth.uid())::text);
