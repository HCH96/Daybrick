-- Daybrick 서버 구조 4번: 구직 관리 예약 실행 (job-search R33, R64, R74, D19)
-- 앱(Rust migrations.rs)이 이 파일을 포함해 "begin; 이 SQL; 번호 기록; commit;" 한 요청으로 적용한다 (server-setup D16).
-- 모든 문은 다시 실행해도 안전해야 한다. 배포한 뒤에는 내용을 고치지 않고 새 번호로 덧붙인다 (server-setup R27).
--
-- pg_cron이 시각에 맞춰 아래 함수를 부르고, 함수는 pg_net으로 서버 함수(js-collect·js-process·js-gmail)를 부른다.
-- 요청에는 `x-daybrick-cron` 머리글에 예약 비밀값을 싣는다. 함수 쪽 `_shared/auth.ts`가 함수 비밀값
-- `DAYBRICK_CRON_SECRET`과 비교해 이 서버의 사용자(계정 하나)를 대신 처리한다.
-- vault 값 두 개는 앱이 서버 업데이트·자동 세팅의 "비밀값 만들기"에서 넣는다 (Rust management.rs):
--   daybrick_cron_secret  예약 비밀값 (함수 비밀값 DAYBRICK_CRON_SECRET과 같은 값, D24)
--   daybrick_project_url  https://<프로젝트 ref>.supabase.co
-- 둘 중 하나라도 없으면 예약 작업은 아무것도 부르지 않는다.
-- pg_cron 시각은 UTC다. 한국 시간(UTC+9)으로 맞춘 값을 적었다.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- 서버 함수 하나를 예약 비밀값과 함께 부른다. 응답은 기다리지 않는다 (pg_net은 요청을 넣고 바로 돌아온다).
create or replace function public.js_cron_call(p_function text, p_body jsonb)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url text;
  v_secret text;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'daybrick_project_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'daybrick_cron_secret';
  if v_url is null or v_secret is null or v_url = '' or v_secret = '' then
    raise warning 'js_cron_call: vault에 예약 실행 값이 없어 % 호출을 건너뜀', p_function;
    return null;
  end if;
  return net.http_post(
    url := rtrim(v_url, '/') || '/functions/v1/' || p_function,
    body := p_body,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-daybrick-cron', v_secret),
    -- 서버 함수는 110초 안에 끝내도록 만들었다 (무료 플랜 150초 한도)
    timeout_milliseconds := 150000
  );
end;
$$;

-- 주간 수집 (R33): 켜진 사이트가 있을 때만. 처리(js-process)는 아래 이어 하기 작업이 새 공고를 보고 부른다.
create or replace function public.js_cron_weekly_collect()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.js_sites where enabled) then
    perform public.js_cron_call('js-collect', '{"action": "run"}'::jsonb);
  end if;
end;
$$;

-- 이어 하기 (R74, D17, D31): 15분마다
-- 1) 처리할 공고(new, 프로필이 있으면 waiting·extracted도)가 있으면 js-process queue
-- 2) 켜진 사이트에 최근 7일 안에 모은, 원문을 아직 못 받은 공고가 있으면 js-collect bodies
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
      and p.collected_at > now() - interval '7 days'
  ) then
    perform public.js_cron_call('js-collect', '{"action": "bodies"}'::jsonb);
  end if;
end;
$$;

-- 메일 확인 (R64): Gmail이 연결돼 있고 끊기지 않았을 때만
create or replace function public.js_cron_mail()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.js_gmail_tokens where broken_at is null) then
    perform public.js_cron_call('js-gmail', '{"action": "check"}'::jsonb);
  end if;
end;
$$;

-- 예약 함수는 pg_cron(postgres)만 부른다. 앱 사용자·공개 사용자는 부를 수 없다
revoke all on function public.js_cron_call(text, jsonb) from public, anon, authenticated;
revoke all on function public.js_cron_weekly_collect() from public, anon, authenticated;
revoke all on function public.js_cron_continue() from public, anon, authenticated;
revoke all on function public.js_cron_mail() from public, anon, authenticated;

-- 작업 3개. 같은 이름이면 시각·명령을 새로 바꾼다 (다시 실행해도 안전)
-- 주간 수집: 월요일 06:00 KST = 일요일 21:00 UTC
select cron.schedule('js-weekly-collect', '0 21 * * 0', 'select public.js_cron_weekly_collect()');
-- 이어 하기: 15분마다 (정각 작업과 겹치지 않게 7분부터)
select cron.schedule('js-continue', '7,22,37,52 * * * *', 'select public.js_cron_continue()');
-- 메일 확인: 매일 07:00 KST = 22:00 UTC
select cron.schedule('js-daily-mail', '0 22 * * *', 'select public.js_cron_mail()');
