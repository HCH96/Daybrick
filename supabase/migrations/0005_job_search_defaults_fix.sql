-- Daybrick 서버 구조 5번: 기본 어댑터 중복 생성 수정 (job-search R26–R27, D44)
-- 앱(Rust migrations.rs)이 이 파일을 포함해 "begin; 이 SQL; 번호 기록; commit;" 한 요청으로 적용한다 (server-setup D16).
-- 모든 문은 다시 실행해도 안전해야 한다. 배포한 뒤에는 내용을 고치지 않고 새 번호로 덧붙인다 (server-setup R27).
--
-- 문제: js_ensure_defaults()가 거의 동시에 두 번 불리면(개발 모드 StrictMode 등) 둘 다 "기본 어댑터 없음"으로 보고
-- 기본 어댑터·사이트를 두 벌 넣었다.
-- 수정: 1) 이미 생긴 중복 정리  2) 같은 사용자의 같은 기본 어댑터는 하나만(고유 색인)  3) 함수를 사용자별로 잠가 한 번에 하나만 실행

-- 1-1. 중복 기본 어댑터를 쓰는 사이트를 남길 어댑터로 옮긴다.
--      남길 어댑터: (사용자, 이름)마다 버전이 가장 높은 것, 같으면 id가 작은 것.
with ranked as (
  select id,
         row_number() over w as rn,
         first_value(id) over w as keep_id
  from public.js_adapters
  where builtin
  window w as (partition by user_id, name order by version desc, id)
)
update public.js_sites s
  set adapter_id = r.keep_id
  from ranked r
  where s.adapter_id = r.id and r.rn > 1;

-- 1-2. 남길 것 외의 중복 기본 어댑터를 지운다 (위에서 사이트를 옮겼으므로 연결이 끊기는 사이트는 없다).
with ranked as (
  select id, row_number() over (partition by user_id, name order by version desc, id) as rn
  from public.js_adapters
  where builtin
)
delete from public.js_adapters a
  using ranked r
  where a.id = r.id and r.rn > 1;

-- 1-3. 기본 어댑터를 쓰면서 이름·주소·어댑터·사이트별 값이 모두 같은 사이트는 하나만 남긴다.
--      수집한 공고나 수집 기록이 있는 사이트는 지우지 않는다 (공고의 사이트 연결을 잃지 않게).
--      남길 사이트: 공고가 있는 것 → 수집한 적 있는 것 → id가 작은 것 순.
with ranked as (
  select s.id,
         row_number() over (
           partition by s.user_id, s.name, s.url, s.adapter_id, s.vars
           order by exists (select 1 from public.js_postings p where p.site_id = s.id) desc,
                    (s.last_at is not null) desc,
                    s.id
         ) as rn
  from public.js_sites s
  join public.js_adapters a on a.id = s.adapter_id and a.builtin
)
delete from public.js_sites s
  using ranked r
  where s.id = r.id and r.rn > 1
    and not exists (select 1 from public.js_postings p where p.site_id = s.id)
    and not exists (select 1 from public.js_collect_runs c where c.site_id = s.id);

-- 2. 같은 사용자의 같은 이름 기본 어댑터는 하나만 둔다.
create unique index if not exists js_adapters_builtin_name_uq
  on public.js_adapters (user_id, name) where builtin;

-- 3. 함수를 사용자별 잠금과 함께 다시 만든다. 규칙 내용은 0003과 같다 (원본: supabase/adapters/*.json).
--    잠금은 요청(트랜잭션)이 끝날 때 풀린다. 두 번째 호출은 첫 번째가 끝날 때까지 기다린 뒤 "이미 있음"으로 본다.
create or replace function public.js_ensure_defaults()
returns int
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_defaults constant jsonb := jsonb_build_array(
    jsonb_build_object('version', 1, 'site', '게임잡', 'url', 'https://www.gamejob.co.kr',
      'vars', '{"dutyCode": "1"}'::jsonb,
      'rule', $rule${"format":1,"name":"gamejob","vars":["dutyCode"],"delayMs":1500,"list":{"url":"https://www.gamejob.co.kr/Recruit/_GI_Job_List/","method":"POST","headers":{"X-Requested-With":"XMLHttpRequest"},"body":"condition%5Bduty%5D={dutyCode}&condition%5Bmenucode%5D=duty&page={page}&direct=0&order=1&pagesize=40&tabcode=1","pages":2,"type":"html","item":".tblList tbody tr","fields":{"id":{"sel":".tit a","attr":"href","regex":"GI_No=(\\d+)"},"title":{"sel":".tit a"},"company":{"sel":".company strong"},"link":{"sel":".tit a","attr":"href","base":"https://www.gamejob.co.kr"},"duty":{"sel":".tit a","attr":"onclick","regex":"IsNullOrWhiteSpace\\('([^']*)'\\)","optional":true}}},"detail":{"url":"https://www.gamejob.co.kr/Recruit/GI_Read_Comt_Ifrm?gno={id}","type":"html","body":"body","images":"img"}}$rule$::jsonb),
    jsonb_build_object('version', 1, 'site', '넥슨', 'url', 'https://careers.nexon.com/recruit',
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
      insert into public.js_sites (user_id, name, url, adapter_id, vars)
      values (auth.uid(), v_item->>'site', v_item->>'url', v_adapter_id, v_item->'vars');
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
