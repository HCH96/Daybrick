# 구직 관리 수정2 2단계: 흐름 줄·카드 표시

- 요구사항: R94–R95, R8 (L44에서 변경), R91 (L44에서 변경) (영향: R4 카드, R9 목록)
- 목업: `filters.html` filters-flow 구역, `recommend.html` recommend-cards 구역, `filtered.html` filtered-rows, `archived.html` archived-rows (CSS: manage.css·recommend.css·common.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D35, D38, D39, D58, D62

## 할 일
- 흐름 줄 (R94–R95):
  - `api.ts`의 `POSTING_STAGES`(흐름용 단계 목록)에 `failed`·`duplicate`를 더한다. 원인: 이 목록에 없는 단계가 하나라도 있으면 `loadFlowPostings`가 전체를 실패로 돌려줬다 (L44). 모르는 단계가 와도 그 행만 건너뛰고 전체를 실패로 보지 않게 바꾼다.
  - `filterRules.ts`: `FlowCounts`에 `bundled`(duplicate 수)를 더하고 `summarizeFlow`가 센다. failed는 기존처럼 걸러진 쪽 수에 넣는다.
  - `FlowLine.tsx`: 단계 줄 오른쪽(또는 아래)에 "중복으로 묶음 N개"를 회색 칩으로. 0개면 숨긴다.
- 카드·목록 (R8, R91):
  - `PostingCard.tsx`: 새 공고 칩 글자를 "new"로, 출처 줄(`SourceNames`)을 뺀다. 사이트 이름(오른쪽 흐리게)도 출처 표시이므로 뺀다.
  - `FilteredList.tsx`·`ArchivedList.tsx`: 출처 줄을 뺀다.
  - `recommendApi.ts`·`postingApi.ts`: 목록용 `loadBundleSources` 호출과 `sources` 칸을 없앤다 (`RecommendPosting`·`ListPosting`). 팝업용(`loadPostingDetail`)은 그대로 둔다.
  - `SourceNames.tsx`를 지우고 관련 CSS(`PostingCard.css`·`ArchivedList.css`의 출처 줄 클래스)를 지운다 (계획 승인 범위).

## 목업과 다른 점
- 목업 카드는 "새" 빨간 칩과 오른쪽 사이트 이름이 있다. 이번에는 "new" 칩(같은 색)이고 사이트 이름이 없다.
- 목업 흐름 줄에는 묶음 칸이 없다. 묶음 수는 단계 줄 밖의 회색 칩이다.

## 확인할 결과
- `npm run build` 성공.
- 필터 탭 흐름 줄이 "읽지 못함" 없이 이번 주 단계별 개수를 보이고, 묶인 공고가 있으면 "중복으로 묶음 N개"가 보인다 (r2에서 실패하던 화면).
- 추천 카드·걸러진 공고·보관함 어디에도 출처 줄이 없고, 새 공고 카드는 "new" 칩.
- `grep -rn "SourceNames" apps/desktop/src` 결과 없음.

## 이 단계에서 만들거나 고칠 파일
- `apps/desktop/src/features/job-search/api.ts`, `filterRules.ts`, `recommendApi.ts`, `postingApi.ts`
- `apps/desktop/src/pages/job-search/filters/FlowLine.tsx`
- `apps/desktop/src/pages/job-search/recommend/PostingCard.tsx`·`PostingCard.css`·`FilteredList.tsx`·`ArchivedList.tsx`·`ArchivedList.css`
- 삭제 `apps/desktop/src/pages/job-search/recommend/SourceNames.tsx`
