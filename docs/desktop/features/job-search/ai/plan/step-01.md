# 구직 관리 수정2 1단계: 서버 구조 8번 (표·칸·필터 종류·백업·예약)

- 요구사항: data.md(일괄 작업·애매한 쌍 판정·AI 호출 기록의 일괄 여부), R96, R98(필터 종류), R102–R110(저장 자리), R115
- 목업: 없음
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D14, D19, D35, D43, D44, D56, D70, D71, D74, D75

## 할 일
- 새 `supabase/migrations/0008_job_search_batch.sql` ([structure.md](structure.md) 2절 모양 그대로):
  - `js_batches`, `js_pair_checks` 표 + RLS(본인 읽기만, 쓰기는 서비스 역할). `js_postings.batch_id`·색인 `(user_id, batch_id)`, `js_ai_calls.batch`, `js_settings.family_version`.
  - 백업 표 `js_postings_backup_0008`: 표가 없을 때만 만들고 그때 한 번 `insert … select id, user_id, stage, filtered_by` (D75). 0007처럼 다시 실행해도 덮어쓰지 않는다.
  - `js_filters.kind` 검사를 지우고 `title-nondev`·`dev-only`를 더해 다시 만든다.
  - 기본 필터 줄: `js_settings`가 있는 사용자마다 같은 kind 줄이 없을 때만 넣는다. `title-nondev` 값 `{ "words": ["모델러","원화","애니메이터","이펙트","테크니컬 아티스트","테크니컬 디자이너","기획"] }`(stage 1, 켜짐), `dev-only` 값 `{}`(stage 2, 켜짐).
  - `js_refilter()` 다시 만들기: 기존처럼 `new·filtered1·extracted·filtered2`를 `new`로(단 `batch_id`가 있는 공고는 건드리지 않음). 더해서 `dev-only`가 켜져 있으면 `scored`이고 `fields->>'family'`가 `dev`·`unknown`·null이 아닌 공고를 `filtered2`(`filtered_by = [{id, kind:"dev-only", matched:[family]}]`)로 옮긴다 (R47 예외, R99). 점수 행은 그대로.
  - `js_cron_continue()` 다시 만들기 (D71): 최근 7일 원문 없는 공고가 있으면 `js-collect bodies`만 부르고 끝. 아니면 `status = 'submitted'`인 `js_batches`가 있거나, 맡길 공고(`batch_id` null, 숨기지 않음, 원문 있음, stage `new`, 또는 프로필이 있고 stage `waiting`·`extracted`)가 있거나, `family_version < 1`이면 `js-process {"mode":"batch"}`. 둘 다 없으면 부르지 않는다 (R104).
- `server/migrations.rs`: `MIGRATIONS`에 0008.
- `features/job-search/types.ts`: `FilterKind`에 `title-nondev`·`dev-only`, `AiCall.batch: boolean`, `BatchState { kind: "extract" | "score" | "family"; count: number; submittedAt: string }`. 쓰는 곳은 뒤 단계지만 `npm run build`가 통과하게 둔다 (`AiCall` 읽기에서 `batch`를 `false` 기본으로 채움).

## 확인할 결과
- `cargo check`·`npm run build` 성공, 앱 [서버 업데이트] 성공.
- SQL 편집기: `js_batches`·`js_pair_checks`·`js_postings_backup_0008` 표가 있고, `select count(*) from js_postings_backup_0008` = 업데이트 때 공고 수. [서버 업데이트]를 한 번 더 해도 백업 행 수가 그대로.
- `select kind, stage, enabled from js_filters where kind in ('title-nondev','dev-only')` → 2줄, 둘 다 켜짐. 필터 탭은 3단계 전이라 이 두 줄을 이름 없이(또는 숨김으로) 보여도 된다.
- `select public.js_cron_continue()`가 오류 없이 돈다 (js-process batch 모드는 4단계에 생기므로 지금은 호출만 확인).

## 이 단계에서 만들거나 고칠 파일
- 새 `supabase/migrations/0008_job_search_batch.sql`
- `apps/desktop/src-tauri/src/server/migrations.rs`
- `apps/desktop/src/features/job-search/types.ts` (+ `AiCall` 읽는 `api.ts`의 `loadAiCallsSince`)
