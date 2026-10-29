-- Daybrick 서버 구조 8번: 직군 거르기·일괄 처리·애매한 쌍 (job-search R96, R98, R99, R102–R110, R115, D70, D71, D74, D75)
-- 앱(Rust migrations.rs)이 이 파일을 포함해 "begin; 이 SQL; 번호 기록; commit;" 한 요청으로 적용한다 (server-setup D16).
-- 모든 문은 다시 실행해도 안전해야 한다. 배포한 뒤에는 내용을 고치지 않고 새 번호로 덧붙인다 (server-setup R27).
--
-- 더하는 것:
--   js_batches                  Anthropic Batch 작업 (kind extract|score|family, status submitted|ended|saved|failed)
--   js_postings.batch_id        맡긴 중인 공고 (대기열·맡기기 대상에서 빠짐, stage는 늘리지 않음)
--   js_ai_calls.batch           일괄 호출 여부 (할인 단가, R110)
--   js_pair_checks              애매한 쌍 판정 (a < b, result same|different|unknown, R113)
--   js_settings.family_version  1이면 기존 공고 직군 채우기·옮기기 끝 (D75)
--   js_postings_backup_0008     바꾸기 전 공고의 id·stage·filtered_by 한 번 복사 (D75)
--   js_filters.kind             title-nondev(1차)·dev-only(2차)와 기존 사용자 기본 줄 (D74)
--   js_refilter / js_cron_continue 다시 만들기 (D35, D71)

-- 1. 백업 표: 칸·필터를 바꾸기 전에, 표가 없을 때만 만들고 그때 한 번 채운다 (서버 업데이트를 다시 해도 덮지 않음)
do $$
begin
  if to_regclass('public.js_postings_backup_0008') is null then
    create table public.js_postings_backup_0008 (
      id uuid primary key,
      user_id uuid not null references auth.users (id) on delete cascade,
      stage text,
      filtered_by jsonb,
      backed_up_at timestamptz not null default now()
    );
    insert into public.js_postings_backup_0008 (id, user_id, stage, filtered_by)
      select id, user_id, stage, filtered_by from public.js_postings;
  end if;
end;
$$;

-- 백업 표는 본인 행 읽기만 (고치는 것은 서버 업데이트 SQL뿐)
alter table public.js_postings_backup_0008 enable row level security;
revoke all on public.js_postings_backup_0008 from anon;
revoke insert, update, delete on public.js_postings_backup_0008 from authenticated;
drop policy if exists js_postings_backup_0008_read on public.js_postings_backup_0008;
create policy js_postings_backup_0008_read on public.js_postings_backup_0008
  for select to authenticated
  using (user_id = (select auth.uid()));

-- 2. 일괄 작업 (D70). 서버 함수(서비스 역할)만 쓴다
create table if not exists public.js_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  anthropic_id text,
  kind text not null check (kind in ('extract', 'score', 'family')),
  posting_ids uuid[] not null default '{}',
  status text not null default 'submitted' check (status in ('submitted', 'ended', 'saved', 'failed')),
  submitted_at timestamptz not null default now(),
  ended_at timestamptz,
  est_cost_usd numeric not null default 0,
  counts jsonb
);
create index if not exists js_batches_user_status_idx on public.js_batches (user_id, status);

-- 3. 맡긴 중인 공고 (D70)
alter table public.js_postings
  add column if not exists batch_id uuid references public.js_batches (id) on delete set null;
create index if not exists js_postings_user_batch_idx on public.js_postings (user_id, batch_id);

-- 4. AI 호출 기록의 일괄 여부 (R110)
alter table public.js_ai_calls add column if not exists batch boolean not null default false;

-- 5. 애매한 쌍 판정 (R113, D70). a < b
create table if not exists public.js_pair_checks (
  user_id uuid not null references auth.users (id) on delete cascade,
  a uuid not null references public.js_postings (id) on delete cascade,
  b uuid not null references public.js_postings (id) on delete cascade,
  result text not null check (result in ('same', 'different', 'unknown')),
  at timestamptz not null default now(),
  check (a < b),
  unique (user_id, a, b)
);

-- 일괄 작업·쌍 판정은 본인 행 읽기만, 쓰기는 서비스 역할 (D14)
do $$
declare
  t text;
begin
  foreach t in array array['js_batches', 'js_pair_checks'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('revoke insert, update, delete on public.%I from authenticated', t);
    execute format('drop policy if exists %I on public.%I', t || '_read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (user_id = (select auth.uid()))',
      t || '_read', t);
  end loop;
end;
$$;

-- 6. 직군 채우기 버전 (D75)
alter table public.js_settings add column if not exists family_version int not null default 0;

-- 7. 필터 종류에 title-nondev·dev-only를 더한다 (기존 검사를 지우고 다시, D74)
do $$
declare
  v_name text;
begin
  for v_name in
    select c.conname from pg_constraint c
    where c.conrelid = 'public.js_filters'::regclass
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) like '%kind%'
  loop
    execute format('alter table public.js_filters drop constraint %I', v_name);
  end loop;
end;
$$;

alter table public.js_filters add constraint js_filters_kind_check
  check (kind in ('title-include', 'title-exclude', 'company-exclude', 'skill-include', 'skill-exclude',
                  'max-years', 'employment', 'skill-overlap', 'title-nondev', 'dev-only'));

-- 8. 기존 사용자 기본 줄: js_settings가 있는 사용자마다 같은 kind 줄이 없을 때만 (R96, R98)
insert into public.js_filters (user_id, stage, kind, value, enabled)
  select s.user_id, 1, 'title-nondev',
    '{"words": ["모델러", "원화", "애니메이터", "이펙트", "테크니컬 아티스트", "테크니컬 디자이너", "기획"]}'::jsonb,
    true
  from public.js_settings s
  where not exists (
    select 1 from public.js_filters f where f.user_id = s.user_id and f.kind = 'title-nondev'
  );

insert into public.js_filters (user_id, stage, kind, value, enabled)
  select s.user_id, 2, 'dev-only', '{}'::jsonb, true
  from public.js_settings s
  where not exists (
    select 1 from public.js_filters f where f.user_id = s.user_id and f.kind = 'dev-only'
  );

-- 9. 필터 다시 적용을 다시 만든다 (0003과 같고 두 가지를 더한다, D35)
--    - 일괄 처리에 맡긴 중인 공고(batch_id)는 건드리지 않는다 (결과가 오면 서버 함수가 단계를 정한다)
--    - dev-only가 켜져 있으면 채점된 비개발 공고(직군이 dev·unknown·없음이 아님)를 filtered2로 옮긴다 (R99).
--      점수 행은 그대로 둔다 ([그래도 채점]으로 되돌릴 수 있게). R47의 "채점한 공고는 그대로"의 예외
--    되돌리거나 옮긴 공고 수를 돌려준다.
create or replace function public.js_refilter()
returns int
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count int;
  v_moved int;
  v_dev_only uuid;
begin
  if auth.uid() is null then
    raise exception 'js_refilter: 로그인이 필요합니다';
  end if;
  update public.js_postings
    set stage = 'new', filtered_by = null
    where user_id = auth.uid() and stage in ('new', 'filtered1', 'extracted', 'filtered2')
      and (stage <> 'new' or filtered_by is not null)
      and batch_id is null;
  get diagnostics v_count = row_count;

  select f.id into v_dev_only
    from public.js_filters f
    where f.user_id = auth.uid() and f.kind = 'dev-only' and f.enabled
    order by f.id
    limit 1;
  if v_dev_only is not null then
    update public.js_postings p
      set stage = 'filtered2',
          filtered_by = jsonb_build_array(jsonb_build_object(
            'id', v_dev_only, 'kind', 'dev-only', 'matched', jsonb_build_array(e.fields->>'family')))
      from public.js_extractions e
      where e.posting_id = p.id
        and p.user_id = auth.uid()
        and p.stage = 'scored'
        and p.batch_id is null
        and e.fields->>'family' is not null
        and e.fields->>'family' not in ('dev', 'unknown');
    get diagnostics v_moved = row_count;
    v_count := v_count + v_moved;
  end if;
  return v_count;
end;
$$;

revoke all on function public.js_refilter() from public, anon;
grant execute on function public.js_refilter() to authenticated;

-- 10. 예약 이어 하기를 다시 만든다 (D71, R104)
--     - 최근 7일 원문 없는 공고가 있으면 원문 받기(js-collect bodies)만 부르고 끝 (맡기지 않고 기다린다)
--     - 아니면 진행 중 일괄(submitted)·맡길 공고·직군 채우기(family_version < 1)가 있을 때만 js-process batch
--     - 둘 다 없으면 부르지 않는다
create or replace function public.js_cron_continue()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.js_postings p
    join public.js_sites s on s.id = p.site_id and s.enabled
    where p.body_text is null
      and p.hidden_at is null
      and p.stage <> 'duplicate'
      and p.collected_at > now() - interval '7 days'
  ) then
    perform public.js_cron_call('js-collect', '{"action": "bodies"}'::jsonb);
    return;
  end if;

  if exists (select 1 from public.js_batches b where b.status = 'submitted')
    or exists (
      select 1 from public.js_postings p
      where p.batch_id is null
        and p.hidden_at is null
        and p.body_text is not null
        and (
          p.stage = 'new'
          or (p.stage in ('waiting', 'extracted') and exists (
            select 1 from public.js_settings s where s.user_id = p.user_id and s.profile_version > 0
          ))
        )
    )
    or exists (select 1 from public.js_settings s where s.family_version < 1)
  then
    perform public.js_cron_call('js-process', '{"mode": "batch"}'::jsonb);
  end if;
end;
$$;

revoke all on function public.js_cron_continue() from public, anon, authenticated;
