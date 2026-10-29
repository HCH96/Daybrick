-- Daybrick 서버 구조 7번: 다른 사이트 중복 공고 묶기 (job-search R85, R87, R90, R93, D54, D56, D57)
-- 앱(Rust migrations.rs)이 이 파일을 포함해 "begin; 이 SQL; 번호 기록; commit;" 한 요청으로 적용한다 (server-setup D16).
-- 모든 문은 다시 실행해도 안전해야 한다. 배포한 뒤에는 내용을 고치지 않고 새 번호로 덧붙인다 (server-setup R27).
--
-- 더하는 것:
--   js_sites.own_site            자사 채용 사이트 여부 (R90). 기존 기본 넥슨 사이트는 true
--   js_postings.dup_of           묶인 대표 공고 (깊이 1: 묶인 공고는 바로 대표를 가리킨다)
--   js_postings.unbundled        사용자가 [따로 보기]로 묶음을 풀었는지 (다시 자동으로 묶지 않음)
--   stage 'duplicate'            묶인 공고. 추천·걸러진 공고·처리 대기열에서 stage로 빠진다
--   js_settings.dedupe_version   1이면 소급 적용(R89) 끝 (js-process가 처음 처리할 때 올린다, D56)
--   js_postings_backup_0007      바꾸기 전 공고의 id·stage·norm_key 한 번 복사 (D56)
--   js_switch_rep / js_unbundle  대표 바꾸기(서비스 역할) / 묶음 풀기(본인)

-- 1. 백업 표: 칸을 바꾸기 전에, 표가 없을 때만 만들고 그때 한 번 채운다 (서버 업데이트를 다시 해도 덮지 않음)
do $$
begin
  if to_regclass('public.js_postings_backup_0007') is null then
    create table public.js_postings_backup_0007 (
      id uuid primary key,
      user_id uuid not null references auth.users (id) on delete cascade,
      stage text,
      norm_key text,
      backed_up_at timestamptz not null default now()
    );
    insert into public.js_postings_backup_0007 (id, user_id, stage, norm_key)
      select id, user_id, stage, norm_key from public.js_postings;
  end if;
end;
$$;

-- 백업 표는 본인 행 읽기만 (고치는 것은 서버 업데이트 SQL뿐)
alter table public.js_postings_backup_0007 enable row level security;
revoke all on public.js_postings_backup_0007 from anon;
revoke insert, update, delete on public.js_postings_backup_0007 from authenticated;
drop policy if exists js_postings_backup_0007_read on public.js_postings_backup_0007;
create policy js_postings_backup_0007_read on public.js_postings_backup_0007
  for select to authenticated
  using (user_id = (select auth.uid()));

-- 2. 자사 채용 사이트 여부 (R90). 칸을 처음 만들 때만 기본 넥슨 사이트를 true로 (사용자가 바꾼 값을 되돌리지 않게)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'js_sites' and column_name = 'own_site'
  ) then
    alter table public.js_sites add column own_site boolean not null default false;
    update public.js_sites s
      set own_site = true
      from public.js_adapters a
      where a.id = s.adapter_id and a.builtin and a.name = 'nexon';
  end if;
end;
$$;

-- 3. 공고 묶음 칸
alter table public.js_postings
  add column if not exists dup_of uuid references public.js_postings (id) on delete set null;
alter table public.js_postings
  add column if not exists unbundled boolean not null default false;
create index if not exists js_postings_user_dup_of_idx on public.js_postings (user_id, dup_of);

-- 4. stage 검사에 'duplicate'를 더한다 (0006처럼 기존 검사를 지우고 다시)
do $$
declare
  v_name text;
begin
  for v_name in
    select c.conname from pg_constraint c
    where c.conrelid = 'public.js_postings'::regclass
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) like '%stage%'
  loop
    execute format('alter table public.js_postings drop constraint %I', v_name);
  end loop;
end;
$$;

alter table public.js_postings add constraint js_postings_stage_check
  check (stage in ('new', 'filtered1', 'extracted', 'filtered2', 'suspect', 'scored', 'waiting', 'failed',
                   'duplicate'));

-- 5. 소급 적용 버전 (D56)
alter table public.js_settings add column if not exists dedupe_version int not null default 0;

-- 6. 대표 바꾸기 (R87, D54): 서비스 역할(서버 함수)과 js_unbundle만 부른다.
--    새 대표에 옛 대표의 stage·filtered_by·hidden_at과 추출·점수를 복사(upsert)하고,
--    옛 대표와 옛 대표에 묶인 공고를 모두 새 대표에 묶는다. 복사라서 옛 대표에도 자기 추출·점수가 남는다.
create or replace function public.js_switch_rep(p_user uuid, p_old uuid, p_new uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_old public.js_postings;
begin
  if p_old = p_new then
    return;
  end if;
  select * into v_old from public.js_postings where id = p_old and user_id = p_user;
  if not found then
    raise exception 'js_switch_rep: 옛 대표 공고가 없습니다 (%)', p_old;
  end if;
  if not exists (select 1 from public.js_postings where id = p_new and user_id = p_user) then
    raise exception 'js_switch_rep: 새 대표 공고가 없습니다 (%)', p_new;
  end if;

  update public.js_postings
    set stage = v_old.stage, filtered_by = v_old.filtered_by, hidden_at = v_old.hidden_at, dup_of = null
    where id = p_new and user_id = p_user;

  insert into public.js_extractions (posting_id, user_id, fields, suspect, suspect_quotes)
    select p_new, e.user_id, e.fields, e.suspect, e.suspect_quotes
    from public.js_extractions e where e.posting_id = p_old
  on conflict (posting_id) do update
    set fields = excluded.fields, suspect = excluded.suspect, suspect_quotes = excluded.suspect_quotes;

  insert into public.js_scores (posting_id, user_id, profile_version, score, grade, strengths, gaps, summary)
    select p_new, s.user_id, s.profile_version, s.score, s.grade, s.strengths, s.gaps, s.summary
    from public.js_scores s where s.posting_id = p_old
  on conflict (posting_id) do update
    set profile_version = excluded.profile_version, score = excluded.score, grade = excluded.grade,
        strengths = excluded.strengths, gaps = excluded.gaps, summary = excluded.summary;

  update public.js_postings
    set stage = 'duplicate', dup_of = p_new, hidden_at = null
    where user_id = p_user and id <> p_new and (id = p_old or dup_of = p_old);
end;
$$;

revoke all on function public.js_switch_rep(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.js_switch_rep(uuid, uuid, uuid) to service_role;

-- 7. 묶음 풀기 (R93, D54): 본인 공고만. 새 대표 id(대표를 풀었을 때) 또는 null을 돌려준다.
--    묶인 공고: dup_of null, unbundled true, stage new (일반 처리 순서를 다시 탄다)
--    대표: 남은 공고 중 자사 사이트 먼저·먼저 수집된 순으로 새 대표(R86) → js_switch_rep → 옛 대표를 푼다
--    js_switch_rep을 부르려고 만든 사람 권한으로 돈다. 그래서 본인 확인을 직접 한다.
create or replace function public.js_unbundle(p_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_row public.js_postings;
  v_new uuid;
begin
  if v_user is null then
    raise exception 'js_unbundle: 로그인이 필요합니다';
  end if;
  select * into v_row from public.js_postings where id = p_id and user_id = v_user;
  if not found then
    raise exception 'js_unbundle: 공고가 없습니다 (%)', p_id;
  end if;

  if v_row.dup_of is not null then
    update public.js_postings
      set dup_of = null, unbundled = true, stage = 'new', filtered_by = null
      where id = p_id;
    return null;
  end if;

  select p.id into v_new
    from public.js_postings p
    left join public.js_sites s on s.id = p.site_id
    where p.user_id = v_user and p.dup_of = p_id
    order by coalesce(s.own_site, false) desc, p.collected_at, p.id
    limit 1;
  if v_new is null then
    -- 묶인 공고가 없는 대표: 풀 것이 없다
    return null;
  end if;

  perform public.js_switch_rep(v_user, p_id, v_new);
  update public.js_postings
    set dup_of = null, unbundled = true, stage = 'new', filtered_by = null
    where id = p_id;
  return v_new;
end;
$$;

revoke all on function public.js_unbundle(uuid) from public, anon;
grant execute on function public.js_unbundle(uuid) to authenticated;

-- 8. 기본 어댑터 만들기를 다시 만든다 (D44: 0003·0005는 고치지 않음). 0005와 같고, 사이트를 넣을 때 own_site를 정한다
--    (넥슨 true, 게임잡 false, R90).
create or replace function public.js_ensure_defaults()
returns int
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_defaults constant jsonb := jsonb_build_array(
    jsonb_build_object('version', 1, 'site', '게임잡', 'url', 'https://www.gamejob.co.kr', 'own', false,
      'vars', '{"dutyCode": "1"}'::jsonb,
      'rule', $rule${"format":1,"name":"gamejob","vars":["dutyCode"],"delayMs":1500,"list":{"url":"https://www.gamejob.co.kr/Recruit/_GI_Job_List/","method":"POST","headers":{"X-Requested-With":"XMLHttpRequest"},"body":"condition%5Bduty%5D={dutyCode}&condition%5Bmenucode%5D=duty&page={page}&direct=0&order=1&pagesize=40&tabcode=1","pages":2,"type":"html","item":".tblList tbody tr","fields":{"id":{"sel":".tit a","attr":"href","regex":"GI_No=(\\d+)"},"title":{"sel":".tit a"},"company":{"sel":".company strong"},"link":{"sel":".tit a","attr":"href","base":"https://www.gamejob.co.kr"},"duty":{"sel":".tit a","attr":"onclick","regex":"IsNullOrWhiteSpace\\('([^']*)'\\)","optional":true}}},"detail":{"url":"https://www.gamejob.co.kr/Recruit/GI_Read_Comt_Ifrm?gno={id}","type":"html","body":"body","images":"img"}}$rule$::jsonb),
    jsonb_build_object('version', 1, 'site', '넥슨', 'url', 'https://careers.nexon.com/recruit', 'own', true,
      'vars', '{}'::jsonb,
      'rule', $rule${"format":1,"name":"nexon","vars":[],"delayMs":1500,"list":{"url":"https://career-gateway.nexon.com/career/v1/open/job-posts","method":"POST","body":{"corpCodes":[],"jobCategories":[],"careerTypes":[],"employmentTypes":[],"workingAreas":[],"query":null,"page":"{page}","size":15},"pages":10,"type":"json","item":"$.list[*]","fields":{"id":{"sel":"jobPostNo"},"title":{"sel":"title"},"company":{"sel":"corpName"},"link":{"sel":"jobPostNo","base":"https://careers.nexon.com/recruit/"},"body":{"sel":"contents","optional":true}}},"detail":{"url":"https://career-gateway.nexon.com/career/v1/open/job-posts/{id}","type":"json","body":"$.contents","images":"img"}}$rule$::jsonb)
  );
  v_item jsonb;
  v_adapter_id uuid;
  v_count int := 0;
  v_changed int;
begin
  if auth.uid() is null then
    raise exception 'js_ensure_defaults: 로그인이 필요합니다';
  end if;

  -- 같은 사용자의 호출은 한 번에 하나만 (동시에 불려도 두 벌 넣지 않게)
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('js_ensure_defaults'), pg_catalog.hashtext(auth.uid()::text));

  if not exists (select 1 from public.js_adapters where user_id = auth.uid() and builtin) then
    for v_item in select * from jsonb_array_elements(v_defaults) loop
      v_adapter_id := null;
      insert into public.js_adapters (user_id, name, rule, version, builtin)
      values (auth.uid(), v_item->'rule'->>'name', v_item->'rule', (v_item->>'version')::int, true)
      on conflict (user_id, name) where builtin do nothing
      returning id into v_adapter_id;
      -- 고유 색인에 걸려 넣지 못했으면 사이트도 넣지 않는다
      continue when v_adapter_id is null;
      insert into public.js_sites (user_id, name, url, adapter_id, vars, own_site)
      values (auth.uid(), v_item->>'site', v_item->>'url', v_adapter_id, v_item->'vars',
              (v_item->>'own')::boolean);
      v_count := v_count + 1;
    end loop;
    return v_count;
  end if;

  for v_item in select * from jsonb_array_elements(v_defaults) loop
    update public.js_adapters
      set rule = v_item->'rule', version = (v_item->>'version')::int
      where user_id = auth.uid() and builtin and name = v_item->'rule'->>'name'
        and version < (v_item->>'version')::int;
    get diagnostics v_changed = row_count;
    v_count := v_count + v_changed;
  end loop;
  return v_count;
end;
$$;

revoke all on function public.js_ensure_defaults() from public, anon;
grant execute on function public.js_ensure_defaults() to authenticated;

-- 9. 예약 이어 하기를 다시 만든다. 0004와 같고, 원문 받기 조건에서 묶인 공고(duplicate)를 뺀다
--    (묶인 공고는 원문을 받지 않으므로, 빼지 않으면 15분마다 js-collect bodies를 헛되이 부른다).
create or replace function public.js_cron_continue()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.js_postings p
    where p.hidden_at is null
      and p.body_text is not null
      and (
        p.stage = 'new'
        or (p.stage in ('waiting', 'extracted') and exists (
          select 1 from public.js_settings s where s.user_id = p.user_id and s.profile_version > 0
        ))
      )
  ) then
    perform public.js_cron_call('js-process', '{"mode": "queue"}'::jsonb);
  end if;

  if exists (
    select 1 from public.js_postings p
    join public.js_sites s on s.id = p.site_id and s.enabled
    where p.body_text is null
      and p.hidden_at is null
      and p.stage <> 'duplicate'
      and p.collected_at > now() - interval '7 days'
  ) then
    perform public.js_cron_call('js-collect', '{"action": "bodies"}'::jsonb);
  end if;
end;
$$;

revoke all on function public.js_cron_continue() from public, anon, authenticated;
