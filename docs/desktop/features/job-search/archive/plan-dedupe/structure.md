# 구직 관리 수정1: 파일 목록과 데이터 모양
전체 구조가 필요할 때만 읽는다. 경로 기준은 [index.md](index.md) 맨 위. 처음 계획의 전체 파일 목록·테이블·어댑터 규칙 형식 v1은 [../plan-initial/structure.md](../plan-initial/structure.md).

## 1. 파일 목록 (새 파일은 "새")
### 서버 (저장소 `supabase/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| 새 `migrations/0007_job_search_dedupe.sql` | 2절 칸·stage 검사·백업 표·`js_switch_rep`·`js_unbundle`·`js_ensure_defaults`·`js_cron_continue` | 1 |
| `functions/_shared/dedupe.ts` | `cleanTitle`·`normKey`(R35), `companyMatch`·`sameDeadline`·`titleSimilar`·`isSameJob`(R84), `pickRep`(R86) — 순수 함수 | 3 |
| `functions/js-collect/index.ts` | `saveNew`: 다른 사이트 일치 → duplicate 저장·대표 바꾸기, `fetchBodies`·`bodiesOnly`: duplicate 건너뜀 | 4 |
| 새 `functions/js-process/dedupe.ts` | 중복 확인(후보 읽기·판정·묶기·묶음 합치기), 소급 적용 `backfillDedupe` | 5 |
| `functions/js-process/index.ts` | `processOne`에 추출 뒤 중복 확인, `runQueue` 시작 때 소급 적용 | 5 |

### Rust (`apps/desktop/src-tauri/src/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `server/migrations.rs` | `MIGRATIONS`에 0007, js-process `files`에 `DEDUPE`와 `js-process/dedupe.ts` | 1, 5 |

### 앱 (`apps/desktop/src/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `features/job-search/types.ts` | `Site.ownSite`, `PostingStage`에 `duplicate`, `Posting.dupOf`·`unbundled` | 1 |
| `features/job-search/api.ts` | `loadSources`가 `own_site` 읽기, 새 `setSiteOwn`, `addSite`에 ownSite | 2 |
| `pages/job-search/sources/SiteTable.tsx`·`AddSiteForm.tsx`·`addSiteRules.ts`·`SourcesTab.css` | 자사 칸 스위치, 추가 창 체크 | 2 |
| 새 `features/job-search/bundleApi.ts` | `loadBundleSources(session, repIds)` → `Map<repId, BundleSource[]>`, `unbundlePosting` | 6, 7 |
| `features/job-search/recommendApi.ts`·`postingApi.ts` | 보관함 목록·수에 duplicate 제외, 목록에 출처 붙이기 | 6 |
| 새 `pages/job-search/recommend/SourceNames.tsx` (+ `PostingCard.tsx`·`FilteredList.tsx`·`ArchivedList.tsx`·css) | "출처: A · B" 한 줄 | 6 |
| 새 `pages/job-search/popup/PopupSources.tsx` (+ `PostingPopup.tsx`·`PopupHead.tsx`·`PostingPopup.css`) | 출처 줄 ×N, ↗ 링크, [따로 보기] | 7 |
| `features/job-search/messages.ts` | 따로 보기 실패·원문 받는 중 문구 | 7 |

## 2. 데이터 모양 (0007이 더하는 것)
- `js_sites.own_site bool not null default false` — 기존 기본 넥슨 사이트는 true
- `js_postings.dup_of uuid null references js_postings(id) on delete set null`, `js_postings.unbundled bool not null default false`, 색인 `(user_id, dup_of)`
- `js_postings.stage`에 `duplicate` 추가 (0006처럼 검사를 지우고 다시)
- `js_settings.dedupe_version int not null default 0` — 1이면 소급 적용 끝
- `js_postings_backup_0007(id, user_id, stage, norm_key, backed_up_at)` — 표가 없을 때만 만들고 그때 한 번 채움. RLS 본인 읽기만
- `js_switch_rep(p_user uuid, p_old uuid, p_new uuid)` (서비스 역할만): 새 대표에 옛 대표의 stage·filtered_by·hidden_at 복사, `js_extractions`·`js_scores` 행 복사(upsert), 옛 대표와 `dup_of = old`인 공고 → `stage duplicate, dup_of = new, hidden_at null`
- `js_unbundle(p_id uuid)` (본인만): 묶인 공고면 `dup_of null, unbundled true, stage new`. 대표면 남은 공고 중 `own_site` 먼저·`collected_at` 빠른 순으로 새 대표 → `js_switch_rep` → 옛 대표 `unbundled true, stage new`
- 앱 타입: `BundleSource { postingId, siteName, url, isRep }`

```
공고 상태: new → filtered1 | (추출) → [중복 확인] → duplicate(dup_of)
                                        └ filtered2 | suspect | extracted → scored
```

## 3. 컴포넌트 구조 (바뀌는 곳만)
```
SourcesTab ─ SiteTable (+ 자사 칸 스위치) · AddSiteDialog ─ AddSiteForm (+ 자사 체크)
RecommendTab ─ PostingGrid ─ PostingCard ─ SourceNames
             ├ FilteredList / ArchivedList ─ 행 ─ SourceNames
             └ PostingPopup ─ PopupHead ─ PopupSources (출처 줄 ×N, ↗, [따로 보기])
```

## C++ 비유
- `dup_of`는 union-find의 부모 포인터다. 다만 깊이는 늘 1(묶인 공고는 바로 대표를 가리킴)이라 묶음을 합칠 때는 자식 전체를 새 대표로 다시 가리킨다.
- `js_switch_rep`는 대표 교체를 한 트랜잭션으로 묶은 원자적 연산이다. 분석 결과는 move가 아니라 copy라서, 옛 대표를 다시 꺼내도 자기 값이 남아 있다.
- 소급 적용은 버전 번호(`dedupe_version`)로 지키는 한 번만 도는 마이그레이션 함수다.
