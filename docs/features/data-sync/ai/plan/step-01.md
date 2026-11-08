# 데이터 동기화 1단계: 서버 테이블·RPC (0010)

- 요구사항: R3–R6, R8, R28
- 목업: 없음 (서버 구조만)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D1, D5, D6

## 할 일
- 새 `supabase/migrations/0010_data_sync.sql` (0002 머리말 양식, 모든 문은 다시 실행해도 안전):
  - `create table if not exists public.sync_documents` (structure.md 2절). `user_id`는 `auth.users` 참조 + `on delete cascade`, `kind`는 4개만 허용하는 check, `rev bigint not null default 1`, `updated_at default now()`, `device text not null default ''`.
  - RLS 켜기, `revoke all ... from anon`. authenticated는 본인 행(`user_id = (select auth.uid())`) select만 정책으로 허용하고, insert·update·delete 권한은 뺀다(쓰기는 RPC로만).
  - `daybrick_sync_push(p_kind text, p_data jsonb, p_file_version int, p_base_rev bigint, p_device text) returns jsonb`, `security definer`, `set search_path = public`. 대상 사용자는 반드시 `auth.uid()`이고, 없으면 예외.
    - `p_base_rev is null`: `insert … on conflict do nothing`. 넣지 못했으면 충돌.
    - 아니면 `update … set rev = rev + 1 … where user_id = auth.uid() and kind = p_kind and rev = p_base_rev`. 0행이면 충돌.
    - 충돌이면 지금 행의 rev·updated_at·device를 함께 돌려준다.
  - `revoke execute … from public, anon`, `grant execute … to authenticated`.
  - 테이블을 지우거나 비우는 문은 넣지 않는다 (R28).
- `src-tauri/src/server/migrations.rs`: `MIGRATIONS` 끝에 `(10, include_str!(".../0010_data_sync.sql"))`.

## 확인할 결과
- `cargo check` 성공.
- 앱을 켜면 설정 › 서버 연결의 서버 구조가 "서버 9 / 앱 10 · 서버 업데이트 필요"로 보인다.
- 서버 업데이트를 마치면 "서버 10 / 앱 10 · 최신". Supabase 대시보드 Table Editor에 `sync_documents`가 있고 RLS가 켜져 있다.
- SQL 편집기에서 `select daybrick_sync_push('plan', '{}'::jsonb, 1, null, 'x');`를 로그인 없이 실행하면 "로그인 필요" 예외가 난다 (행이 생기지 않음).
- 같은 SQL 파일을 한 번 더 적용해도 오류가 없다 (자동 세팅 다시 실행).

## 이 단계에서 만들거나 고칠 파일
- 새 `supabase/migrations/0010_data_sync.sql`
- `src-tauri/src/server/migrations.rs`
