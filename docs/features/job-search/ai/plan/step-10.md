# 구직 관리 10단계: 추천 공고 탭

- 요구사항: R4–R8, R23, R75 (3단계 사용액 줄 위치 확정)
- 목업: recommend.html (recommend-status, recommend-toolbar, recommend-cards)
- 경로 기준: `apps/desktop/src/` (Rust는 `apps/desktop/src-tauri/src/`)
- 공통 규칙: [index.md](index.md)의 결정 D21, 목업 mockup.md "점수 색"·"마감 표시"

## 할 일
- `RecommendTab`: `UsageLine`(1줄) + `CollectStatusLine`(2줄: 마지막 수집 시각, 빨간 칩 "수집 실패 N곳", 주황 칩 "채점 대기 N개") + `RecommendToolbar` + `PostingGrid` (R6–R7).
- `sortPostings.ts`: `scored` 공고 중 숨김·지원 아닌 것, 마감 지난 것 빼기, 적합도순(기본)·마감 임박순 (R4–R5, R16).
- `dday.ts`: D-n, 마감 없으면 "상시", D-5 이하 빨간 칩. `grade.ts`: 등급 이름·색.
- `PostingCard`: 회사(굵게)·"새" 칩·수집 사이트 / 제목 / 경력·고용 형태·근무지 / D-n · 점수 26px + 등급. 새 공고는 보라 테두리.
- "새" 표시 (R8): `localState.ts`의 `recommendOpenedAt` 이후 수집된 공고. 탭을 떠날 때 지금 시각을 저장한다 (연 동안에는 표시 유지).
- Rust `job_search.rs`: `job-search.json` 읽기·쓰기 명령 (지원 관리 저장과 같은 임시 파일 바꿔치기).
- 이전 프로필 기준 (R23): 채점의 `profile_version`이 지금 버전보다 낮으면 카드에 "이전 프로필 기준", 도구 줄에 주황 안내 "N개가 이전 프로필 기준이에요 [다시 채점]" → `js-process rescore`.
- 도구 줄: 정렬 고르기, "추천 N개", 오른쪽 [지원 안 함 보관함 N] [걸러진 공고 N] (목록은 11단계).
- 카드를 누르면 열 팝업 자리는 11단계에서 붙인다.

## 확인할 결과
- 9단계에서 채점된 공고가 3열 카드로 보이고, 점수 색이 등급과 맞는다 (80↑ 초록, 60–79 보라, 40–59 주황, 40↓ 회색).
- 정렬을 마감 임박순으로 바꾸면 D-n 작은 순, 상시는 맨 뒤. 마감 지난 공고는 안 보인다.
- [지금 수집] 뒤 탭에 처음 오면 새 공고에 "새" 칩과 보라 테두리. 다른 탭에 갔다 오면 사라진다.
- 프로필을 고쳐 v2로 저장하면 카드에 "이전 프로필 기준"과 도구 줄 안내가 보이고, [다시 채점] 뒤 사라진다.
- 하루 한도로 미뤄진 공고가 있으면 "채점 대기 N개"가 보인다.
- `npm run build`, `cargo check` 성공.

## 이 단계에서 만들거나 고칠 파일
- `src-tauri/src/job_search.rs`, `lib.rs`
- `features/job-search/sortPostings.ts`, `dday.ts`, `grade.ts`, `localState.ts`, `api.ts`
- `pages/job-search/recommend/RecommendTab.tsx`(+css), `CollectStatusLine.tsx`, `RecommendToolbar.tsx`, `PostingGrid.tsx`, `PostingCard.tsx`(+css)
- 수정: `pages/job-search/recommend/UsageLine.tsx`, `JobSearchTabs.tsx`
