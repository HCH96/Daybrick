# 알림 6단계: 서버 구조 0002

- 요구사항: R29, R36
- 목업: 없음
- 경로 기준: 저장소 `supabase/`, Rust `apps/desktop/src-tauri/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙 (D11), `server/migrations.rs` 머리 주석의 단계 규칙 (server-setup R27)

## 할 일
- `supabase/migrations/0002_notifications.sql`을 만든다. 모든 문은 다시 실행해도 안전하게 쓴다 (`if not exists`, `create or replace`, `drop policy if exists`).
  - `notifications` 테이블: 열은 structure.md 2절 기준. `user_id`는 `auth.users` 참조, `importance` check(`info`/`warning`), `read_at` 기본값 null.
  - 인덱스: `(user_id, updated_at desc)`. 부분 고유 인덱스 `(user_id, source, merge_key) where read_at is null and merge_key is not null`.
  - RLS: 0001과 같은 작성 방식으로 본인 행만 select·update·delete할 수 있게 한다. insert 권한은 `anon`·`authenticated`에서 뺀다.
  - `daybrick_notify(p_source, p_kind, p_importance, p_title, p_body, p_target, p_merge_key, p_user_id default null)` 함수: security definer, `set search_path = ''`.
    - 대상 사용자: `auth.uid()`가 있으면 그 값을 쓰고, 서비스 역할일 때만 `p_user_id`를 쓴다.
    - 같은 키의 안 읽은 행이 있으면 제목·내용·`updated_at`을 갱신하고, 없으면 새로 넣는다 (R24·R29).
  - 실시간: `supabase_realtime` 발행 목록에 `notifications`를 추가한다. 이미 들어 있으면 건너뛴다.
- `server/migrations.rs`의 `MIGRATIONS`에 2번을 추가한다. 0001은 고치지 않는다.

## 확인할 결과
- 테스트용 Supabase 프로젝트에 연결된 앱을 새 빌드로 켜면 "서버 업데이트" 안내가 나오고, 실행하면 서버 번호가 2가 된다.
- SQL 편집기에서 `daybrick_notify`를 같은 `merge_key`로 두 번 부르면 행이 1개이고 `updated_at`이 바뀐다. 그 행의 `read_at`을 채운 뒤 다시 부르면 새 행이 생긴다.
- 로그인하지 않은 상태(anon)로는 행을 읽거나 넣을 수 없다.
- `cargo check`, `npm run build`가 성공한다.

## 이 단계에서 만들거나 고칠 파일
- `supabase/migrations/0002_notifications.sql`
- `apps/desktop/src-tauri/src/server/migrations.rs`
