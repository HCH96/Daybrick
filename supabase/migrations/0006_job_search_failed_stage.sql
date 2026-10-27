-- Daybrick 서버 구조 6번: 공고 처리 실패 단계 (job-search R74, L28, D47)
-- 앱(Rust migrations.rs)이 이 파일을 포함해 "begin; 이 SQL; 번호 기록; commit;" 한 요청으로 적용한다 (server-setup D16).
-- 모든 문은 다시 실행해도 안전해야 한다. 배포한 뒤에는 내용을 고치지 않고 새 번호로 덧붙인다 (server-setup R27).
--
-- 문제: Anthropic이 공고 하나의 요청을 거절하면(예: 이미지가 8,000픽셀을 넘음) 처리 대기열 맨 앞에서 매번 같은 공고로 멈췄다.
-- 수정: 그 공고를 stage = 'failed'(filtered_by에 거절 이유)로 두어 대기열에서 뺀다. 걸러진 공고 목록에서 다시 시도할 수 있다.

-- 0003이 만든 stage 검사(이름은 Postgres가 붙임)를 지우고 'failed'를 더해 다시 만든다
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
  check (stage in ('new', 'filtered1', 'extracted', 'filtered2', 'suspect', 'scored', 'waiting', 'failed'));
