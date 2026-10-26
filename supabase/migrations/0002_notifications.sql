-- Daybrick 서버 구조 2번: 알림 (notifications)
-- 앱(Rust migrations.rs)이 이 파일을 포함해 "begin; 이 SQL; 번호 기록; commit;" 한 요청으로 적용한다 (server-setup D16).
-- 모든 문은 다시 실행해도 안전해야 한다. 배포한 뒤에는 내용을 고치지 않고 새 번호로 덧붙인다 (server-setup R27).

-- 서버 작업이 만든 알림 (R29, R36). 열은 앱의 AppNotification과 같다.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source text not null,
  kind text not null,
  importance text not null default 'info' check (importance in ('info', 'warning')),
  title text not null,
  body text not null default '',
  target jsonb,
  merge_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  read_at timestamptz default null
);

-- 목록 받기: 사용자별 최신순
create index if not exists notifications_user_updated_idx
  on public.notifications (user_id, updated_at desc);

-- 합치기: 같은 키의 안 읽은 알림은 하나만 (R24, D6, D11)
create unique index if not exists notifications_unread_merge_key_idx
  on public.notifications (user_id, source, merge_key)
  where read_at is null and merge_key is not null;

alter table public.notifications enable row level security;

-- 로그인하지 않은 사용자는 아무것도 못 한다. 넣기는 daybrick_notify로만 한다 (R36, D11).
revoke all on public.notifications from anon;
revoke insert on public.notifications from authenticated;

-- 본인 행만 읽고, 확인 기록을 바꾸고, 지운다 (R33, D5, D11)
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists notifications_delete on public.notifications;
create policy notifications_delete on public.notifications
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- 알림 보내기: 같은 키의 안 읽은 행이 있으면 제목·내용·updated_at을 갱신하고, 없으면 새로 넣는다 (R24, R29).
-- 대상 사용자: 로그인 사용자면 본인, JWT가 서비스 역할이거나 없을 때(서버 함수·SQL 편집기)만 p_user_id.
create or replace function public.daybrick_notify(
  p_source text,
  p_kind text,
  p_importance text,
  p_title text,
  p_body text,
  p_target jsonb,
  p_merge_key text,
  p_user_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text := auth.role();
  v_id uuid;
begin
  if v_user_id is null then
    if v_role is not null and v_role <> 'service_role' then
      raise exception 'daybrick_notify: 대상 사용자를 정할 수 없습니다 (role=%)', v_role;
    end if;
    v_user_id := p_user_id;
  end if;

  if v_user_id is null then
    raise exception 'daybrick_notify: p_user_id가 필요합니다';
  end if;

  insert into public.notifications
    (user_id, source, kind, importance, title, body, target, merge_key)
  values
    (v_user_id, p_source, p_kind, coalesce(p_importance, 'info'), p_title,
     coalesce(p_body, ''), p_target, p_merge_key)
  on conflict (user_id, source, merge_key) where read_at is null and merge_key is not null
  do update set
    title = excluded.title,
    body = excluded.body,
    updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.daybrick_notify(text, text, text, text, text, jsonb, text, uuid) from public, anon;
grant execute on function public.daybrick_notify(text, text, text, text, text, jsonb, text, uuid)
  to authenticated, service_role;

-- 실시간: supabase_realtime 발행 목록에 추가한다. 이미 들어 있으면 건너뛴다 (R31, D4).
do $$
begin
  if exists (select 1 from pg_catalog.pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_catalog.pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
     ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;
