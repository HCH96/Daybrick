# 구직 관리 2단계: 서버 구조 3번과 자동 생성 비밀값

- 요구사항: data.md 전체, R79(기본 단가), R3(공개 정책 없음)
- 목업: 없음
- 경로 기준: 저장소 `supabase/`, `apps/desktop/src-tauri/src/`, `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정 D14, D19

## 할 일
- 시작 전에 확인: 관리 API로 비밀값 이름 목록을 받을 수 있는지, Storage 버킷·정책을 SQL로 만들 수 있는지.
- `supabase/migrations/0003_job_search.sql`: [structure.md](structure.md) 2절의 테이블 전부.
  - RLS는 본인 행만. `js_gmail_tokens`에는 정책을 두지 않는다 (서비스 역할만 접근).
  - 앱이 읽는 `js_gmail_status` 보기 (연결 여부·이메일·마지막 확인만).
  - 비공개 버킷 `job-search`, 본인 폴더(`<user_id>/…`)만 허용하는 Storage 정책.
  - 다시 실행해도 안전하게 (`if not exists`, `create or replace`).
- 기본 설정 행: `js_settings`가 없으면 만드는 RPC `js_ensure_settings()`. 기본 단가는 Opus 5.5 $4/$20, Haiku 5.5 $0.10/$0.50 (100만 토큰당), 캐시 읽기·쓰기 칸 포함.
- Rust `migrations.rs`: 3번 추가, 자동 생성 비밀값 목록 `GENERATED_SECRETS = ["DAYBRICK_CRON_SECRET", "GMAIL_TOKEN_KEY"]`.
- Rust `management.rs`: 이미 있는 비밀값 이름을 읽고, 없는 것만 무작위 값(32바이트)으로 만든다. `DAYBRICK_CRON_SECRET`은 같은 호출 안에서 SQL로 vault(`daybrick_cron_secret`)에도 넣는다 (15단계 예약 작업이 읽음). 값은 앱에 남기지 않는다.
- `serverUpdate.ts`·`setupRunner.ts`·`rerunSetup.ts`: 서버 업데이트·자동 세팅의 비밀값 단계에서 위 동작을 부른다.
- `features/job-search/types.ts`(2절 타입), `api.ts`(설정 읽기만 먼저).

## 확인할 결과
- 2번까지 적용된 테스트 서버로 앱을 켜면 서버 업데이트 안내가 나오고, 진행하면 "서버 구조 3번"이 적용된다.
- Supabase 대시보드: `js_` 테이블들(RLS 켜짐), 비공개 버킷 `job-search`, 비밀값 2개가 새로 보인다. 기존 비밀값 3개는 그대로.
- 서버 업데이트를 한 번 더 해도 오류가 없고 비밀값 값이 바뀌지 않는다 (대시보드의 비밀값 요약값으로 비교).
- `npm run build`, `cargo check` 성공.

## 이 단계에서 만들거나 고칠 파일
- `supabase/migrations/0003_job_search.sql`
- `src-tauri/src/server/migrations.rs`, `server/management.rs`, `lib.rs`
- `features/server/serverUpdate.ts`, `setupRunner.ts`, `rerunSetup.ts`, `management.ts`
- `features/job-search/types.ts`, `api.ts`
