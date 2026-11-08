# r1 · 저장 구조·서버 (req-storage: R1–R8)

## A3 · 0010 마이그레이션 테이블·열·kind check·구조 번호 10
- 근거: R3, R4
- 수행: `supabase/migrations/0010_data_sync.sql` 전체 읽기, `src-tauri/src/server/migrations.rs`의 MIGRATIONS 끝부분과 `latest()` 읽기
- 예상: sync_documents에 data JSONB, file_version, rev, updated_at, device 열, kind 4종 check, 구조 번호 10
- 실제: `create table if not exists public.sync_documents` — user_id(uuid, auth.users 참조), kind(check in plan·calendar·applications·today), data jsonb not null, file_version int, rev bigint 기본 1, updated_at timestamptz 기본 now(), device text 기본 '', 기본 키 (user_id, kind). MIGRATIONS 마지막 항목이 `(10, include_str!(".../0010_data_sync.sql"))`이고 `latest()`는 마지막 번호를 돌려주므로 10
- 판정: 통과

## A4 · 0010 다시 실행 안전
- 근거: R4, R28
- 수행: 0010 SQL에서 문 종류 확인
- 예상: if not exists·create or replace만 쓰고, drop table/truncate/delete 없음
- 실제: 테이블 `create table if not exists`, 함수 `create or replace function`, 정책은 `drop policy if exists` 뒤 `create policy`(정책만 다시 만들고 행은 건드리지 않음), `alter table … enable row level security`·revoke·grant는 반복해도 같은 결과. `drop table`·`truncate`·`delete from` 없음
- 판정: 통과 (참고: `drop policy if exists`는 정책 재생성용이라 데이터에 영향 없음)

## A5 · RLS·권한
- 근거: R5
- 수행: 0010 SQL의 RLS·정책·revoke·grant 문 읽기
- 예상: RLS 켜짐, 본인 행 select만, anon 권한 없음, 테이블 직접 쓰기 권한 없음
- 실제: `enable row level security`, 정책은 `sync_documents_select … for select to authenticated using (user_id = (select auth.uid()))` 하나뿐. `revoke all … from anon`, `revoke insert, update, delete … from authenticated`. insert/update/delete 정책도 없음. 함수는 `revoke all … from public, anon` 뒤 `grant execute … to authenticated`
- 판정: 통과

## A6 · RPC daybrick_sync_push
- 근거: R5, R6, R14
- 수행: 0010 SQL의 함수 본문 읽기
- 예상: security definer, uid null이면 예외, 리비전 같을 때만 쓰고 rev+1, 다르면 충돌, 행 없을 때 충돌 응답의 rev·updated_at·device는 null
- 실제: `security definer` + `set search_path = public`. `auth.uid()`가 null이면 `raise exception '…로그인 필요'`. p_base_rev null이면 `insert … on conflict do nothing`(행이 이미 있으면 쓰지 않음), 아니면 `update … where user_id = v_user_id and kind = p_kind and rev = p_base_rev`로 `rev = rev + 1`. 쓰지 못하면 본인 행을 select into로 읽어 `{ok:false, reason:'conflict', rev, updated_at, device}` 반환 — 행이 없으면 select into가 변수를 null로 두므로 셋 다 null. 대상 사용자는 항상 auth.uid()
- 판정: 통과

## A7 · service_role 없음, anon key + 사용자 세션
- 근거: R6
- 수행: `grep -rni "service_role|serviceRole|service-role" src src-tauri/src`, `grep -rn createClient src`, `features/sync/serverApi.ts` 읽기
- 예상: 앱 코드에 service_role 사용 없음
- 실제: service_role은 안내 문구(messages.ts·guides.ts)와 키 검사(validate.ts: service_role 키를 "secret"으로 판정해 거부)에만 나옴. 클라이언트는 `supabaseClient.ts`의 `createClient(url, anonKey, …)` 하나. 동기화는 `serverSession.client`(로그인 세션)로만 `from("sync_documents").select`와 `rpc("daybrick_sync_push")`를 부름
- 판정: 통과

## A8 · 대상 4종뿐, 올리는 행에 URL·키 없음
- 근거: R1, R2, R8
- 수행: `features/sync/types.ts`(SYNC_KINDS), `kinds.ts`(KINDS·loadCommand), `serverApi.ts` pushDoc 인자 읽기
- 예상: plan·calendar·applications·today만, images/job-search/notifications/server.json/토큰 제외
- 실제: SYNC_KINDS·KINDS는 4종, 읽는 명령은 load_plan·load_calendar·load_applications·load_today뿐. images·job-search·notifications·server.json·sync.json을 읽는 코드 없음. RPC 인자는 p_kind, p_data(그 기능 파일 내용), p_file_version, p_base_rev, p_device뿐이라 서버 URL·anon key·토큰이 들어가지 않음
- 판정: 통과

## A25 · 기기 이름, 백업 폴더 열기
- 근거: R3, R33
- 수행: `src-tauri/src/sync.rs`의 `sync_device_name`·`open_sync_backup_dir`, `useUploadQueue.ts`의 `deviceName`, `lib.rs` 명령 등록 확인
- 예상: COMPUTERNAME, 실패 시 "PC", 백업 폴더 열기는 Rust opener
- 실제: `std::env::var("COMPUTERNAME")`을 trim해 비었거나 없으면 "PC". 프론트 `deviceName()`도 invoke 실패 시 "PC". `open_sync_backup_dir`는 `app.opener().open_path(...)`(tauri_plugin_opener, lib.rs에서 plugin 등록·명령 등록 확인)
- 판정: 통과
