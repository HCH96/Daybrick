# 구직 관리 수정1 6단계: 목록·카드에 출처 표시

- 요구사항: R91 (영향: R4 추천 목록, R7 채점 대기 수, R9·R46 걸러진 공고, R15–R16 보관함)
- 목업: `recommend.html` (recommend-cards), `filtered.html` (filtered-rows), `archived.html` (archived-rows) — CSS: recommend.css·common.css에서 클래스 검색
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D38, D39, D47, D54, D57

## 할 일
- 새 `features/job-search/bundleApi.ts`: `loadBundleSources(session, repIds)` — `js_postings`에서 `id in repIds` 또는 `dup_of in repIds`를 `js_sites(name)`과 함께 읽어 대표마다 `BundleSource[]`(대표 먼저, 나머지는 수집 순). 사이트가 지워졌으면 이름 "지운 사이트". 묶인 공고가 없으면 맵에 넣지 않는다. id가 많으면 `api.ts`의 나눠 읽기 방식을 따른다.
- `recommendApi.ts`: `loadRecommend`의 보관함 수에 `stage <> 'duplicate'`. 추천 목록(`scored`)·채점 대기(`waiting`)·걸러진 공고 수는 stage로 이미 빠지므로 그대로. 목록을 읽은 뒤 `loadBundleSources`로 `RecommendPosting.sources`를 채운다.
- `postingApi.ts`: `loadPostingList`의 보관함 조건에 `stage <> 'duplicate'`, 걸러진 공고·보관함 행에도 `sources`.
- 새 `pages/job-search/recommend/SourceNames.tsx`: `sources`가 2개 이상일 때만 "출처: 스마일게이트 채용 · 게임잡" 한 줄(작은 회색 글씨, 넘치면 말줄임).
- `PostingCard.tsx`·`FilteredList.tsx`·`ArchivedList.tsx`(+css): 맨 아래(카드) 또는 회사 줄 아래(행)에 `SourceNames`.

## 목업과 다른 점
- 세 화면 모두 출처 줄이 없다. 카드는 D-n·점수 줄 아래에 회색 한 줄, 걸러진 공고·보관함 행은 회사·제목 아래에 같은 줄 (명세 화면 구성 "카드 아래줄: 출처: …").

## 확인할 결과
- `npx tsc --noEmit`, `npm run build` 성공.
- 추천 공고 탭에서 묶인 공고가 있는 카드에만 "출처: A · B"가 보이고, 같은 공고가 두 장으로 보이지 않음.
- **이전 테스트 r1 7번(실패)** 다시: 카드에 회사·제목·D-n·점수, 점수 색, "마감 임박 순" 정렬(상시는 맨 뒤), 마감 지난 공고 없음, 다른 탭에 갔다 온 뒤 새 공고에 "새" 칩.
- **이전 테스트 r1 9번(빈칸)** 다시: 묶음 대표 카드를 [지원 안 함] → 보관함에 한 행(출처 줄 포함), 되돌리면 추천에 한 장. 걸러진 공고 목록에 묶인 공고가 따로 나오지 않음.
- 채점 대기 N개(R7)·보관함 수가 묶인 공고를 세지 않음 (SQL 수와 비교).

## 이 단계에서 만들거나 고칠 파일
- 새 `features/job-search/bundleApi.ts`
- `features/job-search/recommendApi.ts`, `postingApi.ts`
- 새 `pages/job-search/recommend/SourceNames.tsx`, 수정 `PostingCard.tsx`(+css), `FilteredList.tsx`, `ArchivedList.tsx`(+css)
