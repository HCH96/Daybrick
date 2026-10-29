# 구직 관리 수정2: 파일 목록과 데이터 모양
전체 구조가 필요할 때만 읽는다. 경로 기준은 [index.md](index.md) 맨 위. 수정1의 묶기 구조는 [../../archive/plan-dedupe/structure.md](../../archive/plan-dedupe/structure.md), 처음 계획의 전체 파일·테이블은 [../../archive/plan-initial/structure.md](../../archive/plan-initial/structure.md).

## 1. 파일 목록 (새 파일은 "새")
### 서버 (저장소 `supabase/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| 새 `migrations/0008_job_search_batch.sql` | 2절 표·칸, 필터 종류 검사, 기본 필터 줄, 백업 표, `js_cron_continue`·`js_refilter` 다시 만들기 | 1 |
| `functions/_shared/prompts.ts` | `EXTRACT_SCHEMA`에 `family`, 직군 기준(D65), `FAMILY_SCHEMA`(7), `PAIR_SCHEMA`(9) | 3, 7, 9 |
| `functions/_shared/filters.ts` | `title-nondev`(1차), `dev-only`(2차), `ExtractionForFilter.family` | 3 |
| `functions/_shared/ai.ts` | 요청 본문 `messageParams(input)` 분리, `recordBatchCall`, `monthlyRoom`, `BATCH_DISCOUNT` | 4 |
| 새 `functions/_shared/batch.ts` | Anthropic 일괄 API: `createBatch`·`getBatch`·`readResults`(JSONL 한 줄씩) | 4 |
| 새 `functions/js-process/batch.ts` | 대상 고르기·1차 필터·재사용(D73)·예상 비용·맡기기 | 4 |
| 새 `functions/js-process/batchResult.ts` | 결과 저장 → 중복 확인·2차 필터 → 채점 대상, 실패·만료는 대기로 | 5 |
| `functions/js-process/steps.ts` | 추출·채점을 "요청 만들기"와 "결과 저장"으로 나눔 (바로 호출과 일괄이 같이 씀) | 4, 5 |
| `functions/js-process/index.ts` | `mode: "batch"`, force 점수 재사용 | 4, 7 |
| 새 `functions/js-process/familyBackfill.ts` | 직군 채우기 일괄, 결과 뒤 비개발 채점 공고 옮기기 | 7 |
| `functions/js-collect/index.ts` | `saveNew`에 재등록 묶기 | 8 |
| `functions/_shared/dedupe.ts` | `pairKind(a, b)` same / ambiguous / different, `isSameJob`(같은 사이트 재등록 판정 `isRelisted`) | 8, 9 |
| `functions/js-process/dedupe.ts` | 애매한 쌍 → Haiku 바로, `js_pair_checks` | 9 |

### Rust (`apps/desktop/src-tauri/src/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `server/migrations.rs` | `MIGRATIONS`에 0008, 새 상수 `BATCH`(`_shared/batch.ts`), js-process `files`에 새 파일 | 1, 4, 5, 7 |

### 앱 (`apps/desktop/src/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `features/job-search/types.ts` | `FilterKind` 2개, `AiCall.batch`, `BatchState` | 1 |
| `features/job-search/api.ts`·`filterRules.ts`, `pages/job-search/filters/FlowLine.tsx` | 흐름 줄 단계 목록·묶음 수 | 2 |
| `pages/job-search/recommend/PostingCard.tsx`·`.css`·`FilteredList.tsx`·`ArchivedList.tsx`·`.css`, `features/job-search/recommendApi.ts`·`postingApi.ts`, `SourceNames.tsx` 삭제 | 출처 줄 빼기, "new" | 2 |
| `features/job-search/filterRules.ts`·`api.ts`(`loadFilters`)·`postingParse.ts`·`postingFormat.ts`, `pages/job-search/filters/FilterPanel.tsx`·`FilterAddRow.tsx`, `pages/job-search/popup/FieldTable.tsx` | 직군 필터·직군 표시 | 3 |
| `features/job-search/processApi.ts`·`processRun.ts`·`useProcessRunner.ts`·`processMessages.ts`·`usage.ts`·`recommendApi.ts`, `pages/job-search/process/ProcessStatusLine.tsx` | 일괄 상태·[지금 평가]·하루 수 | 6 |
| `pages/job-search/popup/PopupSources.tsx`·`PopupHead.tsx`·`PostingPopup.css`, `features/job-search/bundleApi.ts` | 출처 칩 + ⋯ 메뉴 | 10 |

## 2. 데이터 모양 (0008이 더하는 것)
- `js_batches(id uuid, user_id, anthropic_id text, kind text check (extract|score|family), posting_ids uuid[], status text check (submitted|ended|saved|failed), submitted_at, ended_at, est_cost_usd numeric, counts jsonb)` — RLS 본인 읽기만, 쓰기는 서비스 역할
- `js_postings.batch_id uuid null references js_batches(id) on delete set null` — 맡긴 중인 공고. 대기열·맡기기 대상에서 빠짐
- `js_ai_calls.batch bool not null default false`
- `js_pair_checks(user_id, a uuid, b uuid, result text check (same|different|unknown), at)` — `a < b`, `unique (user_id, a, b)`
- `js_settings.family_version int not null default 0` — 1이면 직군 채우기·옮기기 끝
- `js_postings_backup_0008(id, user_id, stage, filtered_by, backed_up_at)` — 표가 없을 때만 만들고 그때 한 번 채움. RLS 본인 읽기만
- `js_filters.kind`에 `title-nondev`·`dev-only` (검사 지우고 다시). 기존 사용자마다 기본 줄을 없을 때만 넣음
- 추출 `fields.family`: `dev | art | design | qa | business | other | unknown` (개발 / 아트 / 기획 / QA / 사업·운영 / 기타 / 판단 불가)

```
공고 상태: new ─(1차)→ filtered1
              └ [batch_id: 추출 일괄] → 결과: suspect | failed | duplicate | filtered2 | extracted
extracted ─ [batch_id: 채점 일괄] → scored   (실패·만료·한도 → batch_id 비우고 waiting/new 그대로)
```

## 3. 컴포넌트 구조 (바뀌는 곳만)
```
RecommendTab ─ ProcessStatusLine (+ 일괄 상태, [지금 평가] 끄기)
             ├ PostingGrid ─ PostingCard ("new", 출처 줄 없음)
             ├ FilteredList / ArchivedList (출처 줄 없음, "직군: 아트" 칩)
             └ PostingPopup ─ PopupHead ─ PopupSources (칩 줄 + ⋯ 메뉴 [따로 보기])
                            └ FieldTable (+ 직군)
FiltersTab ─ FlowLine (+ 묶음 N개) · FilterPanel (+ 비개발 낱말, 개발 직군만)
SourcesTab ─ ProcessStatusLine
```

## C++ 비유
- 일괄 처리는 `std::async`로 띄운 future다. `js_batches` 행이 future 핸들이고, 예약 실행이 15분마다 `wait_for(0)`로 끝났는지만 본다. 끝났으면 `get()`(결과 읽기) 후 다음 future(채점 일괄)를 띄운다.
- `batch_id`는 "처리 중" 잠금 표시다. 결과 저장이 끝나면 비우므로, 결과 읽기가 중간에 끊겨 다시 읽어도 이미 저장한 공고는 건너뛴다 (멱등).
- 바로 호출과 일괄은 같은 "요청 만들기" 함수를 쓰고 보내는 쪽만 다르다. 전략 패턴에서 전송 객체만 바꾼 꼴이다.
