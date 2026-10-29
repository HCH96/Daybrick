# 구직 관리 수정1 1단계: 서버 구조 7번 (칸·stage·백업·SQL 함수)

- 요구사항: data.md(수집 사이트·공고 줄), R85, R87, R90, R93
- 목업: 없음 (화면 변화 없음)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D14, D19, D44, D54, D56, D57

## 할 일
- 새 `supabase/migrations/0007_job_search_dedupe.sql` ([structure.md](structure.md) 2절 그대로):
  - 백업 표 `js_postings_backup_0007`을 **칸을 바꾸기 전에** 만든다. 표가 없을 때만 만들고 그때 공고 전체(id·user_id·stage·norm_key)를 복사한다. RLS 본인 읽기만.
  - `js_sites.own_site` 추가 뒤 기본 넥슨 사이트(`builtin` 어댑터 이름 `nexon`을 쓰는 사이트)를 true로.
  - `js_postings.dup_of`·`unbundled`·색인, stage 검사에 `duplicate` 추가 (0006 방식).
  - `js_settings.dedupe_version`.
  - `js_switch_rep`(서비스 역할만 실행), `js_unbundle`(authenticated, `auth.uid()` 본인 공고만, 없으면 예외).
  - `js_ensure_defaults()` 다시 만들기: 0005 내용 + 넥슨 사이트를 넣을 때 `own_site = true` (D44: 0003·0005는 고치지 않음).
  - `js_cron_continue()` 다시 만들기: 0004 내용 + 원문 받기 조건에 `p.stage <> 'duplicate'`.
  - 여러 번 실행해도 안전하게 (`if not exists`, `create or replace`).
- `server/migrations.rs`의 `MIGRATIONS`에 0007 추가.
- `features/job-search/types.ts`: `Site.ownSite: boolean`, `PostingStage`에 `"duplicate"`, `Posting.dupOf: string | null`·`unbundled: boolean`. 타입이 늘어 생기는 `switch`·표시 이름 오류(`toStage` 등)를 고친다 (duplicate는 화면에 나오지 않으므로 표시 이름만).

## 확인할 결과
- `cargo check`, `npx tsc --noEmit`, `npm run build` 성공.
- 앱 [서버 업데이트]가 성공하고 다시 눌러도 성공 (두 번 실행 안전).
- SQL 편집기: `select s.name, s.own_site from js_sites s` → 넥슨 true, 게임잡 false.
- `select count(*) from js_postings_backup_0007` = `select count(*) from js_postings` (업데이트 전 공고 수), 서버 업데이트를 한 번 더 해도 수가 그대로.
- `select dedupe_version from js_settings` = 0, 기존 공고의 `dup_of`는 모두 null·`unbundled` false.
- 앱 화면은 전과 같다 (추천·수집 사이트 탭 정상).

## 이 단계에서 만들거나 고칠 파일
- 새 `supabase/migrations/0007_job_search_dedupe.sql`
- `apps/desktop/src-tauri/src/server/migrations.rs`
- `features/job-search/types.ts` (+ 타입 오류가 난 파일만)
