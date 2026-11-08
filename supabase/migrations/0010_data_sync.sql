-- Daybrick 서버 구조 10번: 데이터 동기화 (data-sync)
-- 앱(Rust migrations.rs)이 이 파일을 포함해 "begin; 이 SQL; 번호 기록; commit;" 한 요청으로 적용한다 (server-setup D16).
-- 모든 문은 다시 실행해도 안전해야 한다. 배포한 뒤에는 내용을 고치지 않고 새 번호로 덧붙인다 (server-setup R27).
-- 이 파일에는 테이블을 지우거나 비우는 문을 넣지 않는다 (R28).

-- 사용자·종류마다 한 행: 로컬 파일 내용 그대로(JSONB) + 파일 버전·리비전·수정 시각·올린 기기 (R3, R8, D1)
create table if not exists public.sync_documents (
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('plan', 'calendar', 'applications', 'today')),
  data jsonb not null,
  file_version int not null,
  rev bigint not null default 1,
  updated_at timestamptz not null default now(),
  device text not null default '',
  primary key (user_id, kind)
);

alter table public.sync_documents enable row level security;

-- 로그인하지 않은 사용자는 아무것도 못 한다. 쓰기는 daybrick_sync_push로만 한다 (R5, D6).
revoke all on public.sync_documents from anon;
revoke insert, update, delete on public.sync_documents from authenticated;

-- 본인 행만 읽는다 (R5, D6)
drop policy if exists sync_documents_select on public.sync_documents;
create policy sync_documents_select on public.sync_documents
  for select to authenticated
  using (user_id = (select auth.uid()));

-- 올리기: 리비전이 같을 때만 쓰고 rev를 1 올린다. 다르면 충돌과 지금 행 정보를 돌려준다 (D6).
-- p_base_rev가 null이면 행이 없을 때만 넣는다. 대상 사용자는 반드시 로그인 사용자 본인이다.
-- 돌려주는 값: { ok: true, rev, updated_at } | { ok: false, reason: 'conflict', rev, updated_at, device }
create or replace function public.daybrick_sync_push(
  p_kind text,
  p_data jsonb,
  p_file_version int,
  p_base_rev bigint,
  p_device text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_rev bigint;
  v_updated_at timestamptz;
  v_device text;
begin
  if v_user_id is null then
    raise exception 'daybrick_sync_push: 로그인 필요';
  end if;

  if p_base_rev is null then
    insert into public.sync_documents (user_id, kind, data, file_version, rev, updated_at, device)
    values (v_user_id, p_kind, p_data, p_file_version, 1, now(), coalesce(p_device, ''))
    on conflict (user_id, kind) do nothing
    returning rev, updated_at into v_rev, v_updated_at;
  else
    update public.sync_documents
    set data = p_data,
        file_version = p_file_version,
        rev = rev + 1,
        updated_at = now(),
        device = coalesce(p_device, '')
    where user_id = v_user_id and kind = p_kind and rev = p_base_rev
    returning rev, updated_at into v_rev, v_updated_at;
  end if;

  if v_rev is not null then
    return jsonb_build_object('ok', true, 'rev', v_rev, 'updated_at', v_updated_at);
  end if;

  -- 충돌: 지금 서버 행(없으면 null)을 함께 돌려준다
  select d.rev, d.updated_at, d.device
    into v_rev, v_updated_at, v_device
    from public.sync_documents d
   where d.user_id = v_user_id and d.kind = p_kind;

  return jsonb_build_object(
    'ok', false,
    'reason', 'conflict',
    'rev', v_rev,
    'updated_at', v_updated_at,
    'device', v_device
  );
end;
$$;

revoke all on function public.daybrick_sync_push(text, jsonb, int, bigint, text) from public, anon;
grant execute on function public.daybrick_sync_push(text, jsonb, int, bigint, text) to authenticated;
