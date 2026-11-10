# r3 AI 테스트: 빌드·서버 구조 (A1–A2)

## A1. 빌드·타입 검사·Rust 컴파일·서버 TS 검사
- 테스트 내용: 수정2 1–10단계 뒤 PC 앱 프론트엔드·Rust가 빌드되는지, 서버 함수 TS에 새 타입 오류가 없는지
- 근거 요구사항: 수정2 전체
- 수행 방법 (실제 실행):
  - `apps/desktop`에서 `npm run build`, `npx tsc --noEmit`
  - `apps/desktop/src-tauri`에서 `cargo check`
  - 서버: 임시 폴더에 tsconfig(strict, `moduleResolution: Bundler`, `allowImportingTsExtensions`, include `supabase/functions/**/*.ts`)를 만들고 `npx tsc -p <임시 tsconfig>` 실행
- 예상 결과: 모두 성공. 서버는 외부 모듈 미해결로 생기는 기존 오류만
- 실제 결과:
  - vite 빌드 성공(289ms). 경고는 기존의 "500 kB 넘는 청크" 하나뿐. tsc 출력 없음(종료 0). cargo check `Finished dev profile`
  - 서버 tsc 오류는 모두 외부 모듈 미해결 때문이다:
    - `Cannot find name 'Deno'` 22건, `jsr:` 모듈 못 찾음(TS2307) 8건
    - 그 연쇄 오류 17건: 암시적 any(TS7006) 13건(`Deno.serve` 콜백 req 6건, Supabase 응답 콜백 7건), `js-collect/index.ts` 172행 `'{}'→boolean`(TS2322) 1건, `adapter.ts` deno-dom `child` unknown(TS18046) 3건
  - 새 파일(`_shared/batch.ts`·`js-process/batch.ts`·`batchResult.ts`·`familyBackfill.ts`)에서 나온 것은 `batch.ts` 55·73·75행 TS7006뿐이다. 모두 `rows.data` 콜백이라 같은 연쇄 오류다
- 판정: **통과**

## A2. 0008 SQL·필터 종류
- 테스트 내용: 새 표·칸, 백업 표를 한 번만 만드는지, 기본 필터, 앱 `FILTER_KINDS`
- 근거 요구사항: R96, R98, data.md (L46)
- 수행 방법: `supabase/migrations/0008_job_search_batch.sql` 전체를 읽었다. `migrations.rs`에 0008이 들어 있는지 grep했다. `api.ts`의 `FILTER_KINDS`·`DEFAULT_FILTERS`·`loadFilters`·`parseFilter`, `filterRules.ts`의 `TITLE_NONDEV_DEFAULT_WORDS`를 읽었다. DB에 실제로 적용하지는 않았다(코드 판정)
- 예상 결과: 다시 실행해도 백업 행 수가 그대로이고, 필터 목록이 bad-response가 되지 않음
- 실제 결과:
  | 확인 | 결과 |
  |---|---|
  | `js_batches` | kind extract·score·family, status submitted·ended·saved·failed 검사. `anthropic_id` null 허용, `posting_ids uuid[]`, `est_cost_usd`. `create table if not exists`, 색인 `if not exists` |
  | `js_postings.batch_id` | `add column if not exists`. `js_batches` 참조이고 on delete set null, 색인 있음 |
  | `js_ai_calls.batch` | `boolean not null default false`, `if not exists` |
  | `js_pair_checks` | `check (a < b)`, `unique (user_id, a, b)`, result same·different·unknown, 공고 삭제 시 cascade |
  | `js_settings.family_version` | `int not null default 0`, `if not exists` |
  | 백업 `js_postings_backup_0008` | `to_regclass`가 null일 때만 표를 만들고, 그때 한 번 id·user_id·stage·filtered_by를 복사한다 → 다시 실행해도 행 수가 그대로다. RLS를 켜고 본인 읽기만 허용 |
  | RLS | `js_batches`·`js_pair_checks`는 본인 읽기만, 쓰기는 서비스 역할 |
  | 필터 kind 검사 | kind가 들어간 check를 모두 지우고 `title-nondev`·`dev-only`를 더해 다시 만든다(다시 실행 안전) |
  | 기본 줄 | js_settings가 있는 사용자마다 같은 kind 줄이 없을 때만 넣는다. title-nondev(stage 1, 낱말 7개)·dev-only(stage 2, `{}`), 둘 다 `enabled true` |
  | 앱 기본값 | `DEFAULT_FILTERS`의 낱말이 SQL 7개와 같다(모델러·원화·애니메이터·이펙트·테크니컬 아티스트·테크니컬 디자이너·기획). `loadFilters`가 빠진 종류를 켜서 넣는다 → 0008 뒤에 생긴 사용자도 받는다 |
  | `FILTER_KINDS` | 10종에 `title-nondev`·`dev-only`가 있다 → `parseFilter`가 null을 돌려주지 않아 bad-response가 되지 않는다. 서버 `filters.ts`의 `FilterKind`와 같다 |
  | `migrations.rs` | 0008이 `include_str!`로 들어 있다(46행) |
  | `js_refilter`·`js_cron_continue` | `create or replace` (내용은 A10·A13) |
- 판정: **통과**
