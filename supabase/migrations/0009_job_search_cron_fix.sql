-- Daybrick 서버 구조 9번: 예약 이어 하기가 원문 대기 공고 때문에 멈추지 않게 고친다 (job-search R104, D71, D87)
-- 앱(Rust migrations.rs)이 이 파일을 포함해 "begin; 이 SQL; 번호 기록; commit;" 한 요청으로 적용한다 (server-setup D16).
-- 모든 문은 다시 실행해도 안전해야 한다. 배포한 뒤에는 내용을 고치지 않고 새 번호로 덧붙인다 (server-setup R27).
--
-- 0008의 js_cron_continue는 원문을 못 받은 공고가 하나라도 있으면 원문 받기만 부르고 끝났다.
-- 원문 받기가 계속 실패하면 최대 7일 동안 일괄 결과 확인·맡기기(js-process batch)가 돌지 않았다.
-- 이제 원문 받기를 부른 뒤에도 아래 조건을 보고 js-process batch를 함께 부른다.
-- (원문이 없는 공고는 batch의 맡기기 대상이 아니므로 둘이 같은 공고를 다루지 않는다. 0004·0007도 둘을 함께 불렀다.)

create or replace function public.js_cron_continue()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- 1) 최근 7일 안에 모은, 원문을 아직 못 받은 공고가 있으면 원문 받기
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

  -- 2) 진행 중 일괄·맡길 공고·직군 채우기가 있으면 일괄 처리 (원문 받기 여부와 상관없이)
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
