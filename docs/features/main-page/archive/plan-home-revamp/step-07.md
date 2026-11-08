# 메인 페이지 수정1 7단계: 새 추천 공고

- 요구사항: R43–R47, R27
- 목업: `dash.html` dash-jobs 구역, `part-empty.html` empty-jobs-zero·empty-jobs-off 구역 (CSS: dash.css·common.css에서 `.jobs-`, `.score`, `.dday`, `.badge` 검색)
- 경로 기준: [index.md](index.md) 맨 위

## 할 일
- `pages/job-search/recommend/useOpenedAt.ts`에 `readOpenedAt(): Promise<string | null>` 추가 (D10).
  - 같은 실행 안 캐시(`cachedOpenedAt`)가 있으면 그것, 없으면 `loadJobSearchLocal()`로 읽기만 한다. 저장하지 않는다 (R47, D8).
  - 기존 `useOpenedAt` 동작은 그대로.
- 새 `features/home/newPostings.ts`: `newPostings(postings, openedAt, now)`.
  - 새 공고 = `openedAt`이 있고 `collectedAt > openedAt` (구직 관리 PostingGrid와 같은 기준). `openedAt`이 없으면 0개 (D10).
  - 마감 지난 공고는 뺀다(`daysLeft < 0`, 구직 관리 R5). 점수 높은 순 상위 3개 + 전체 새 공고 수.
- `jobs/useHomeRecommend.ts` (R43, D9):
  - `useServer()`의 연결·로그인 상태가 아니면 `off`.
  - 연결돼 있으면 홈에 들어올 때 한 번 `loadRecommend(session)` + `readOpenedAt()`. 실패하면 `error`.
  - 홈에 머무는 동안 다시 읽지 않는다. 세션이 바뀌면 다시 읽는다.
- `jobs/NewPostingsCard.tsx`, `PostingRow.tsx` (R45–R46):
  - "새 공고 N개", 줄마다 이니셜 배지·회사·제목·D-n·점수. 점수 80 이상 보라, 미만 회색. D-7 이하 주황. 아래에 마지막 수집 시각(`relativeTime`).
  - 공고를 누르면 `useOpenTarget()({ page: "job-search", tab: "recommend" })`.
  - 0개면 "새 추천 공고가 없어요" + 마지막 수집 시각. off면 "서버를 연결하면 추천 공고가 보여요" + [구직 관리로 가기].

## 확인할 결과
- `npm run build` 성공.
- Node로 `newPostings`: openedAt = 11/6 12:00, 공고 4개(11/6 13:00 87점, 11/7 09:00 72점, 11/5 90점, 11/7 마감 지남 95점) → 새 공고 2개, 87 → 72 순서. openedAt 없음 → 0개.
- 서버 연결 끈 상태: 연결 안내 + [구직 관리로 가기].
- 연결된 상태: 개수·상위 3개가 구직 관리 추천 탭의 new 표시 공고와 같다. 공고를 누르면 추천 탭이 열린다.
- R47: 홈을 열었다 닫기 전후로 `job-search.json`의 `recommendOpenedAt` 값이 같다. 홈만 오가면 구직 관리 new 표시가 그대로 남는다.

## 이 단계에서 만들거나 고칠 파일
- `pages/job-search/recommend/useOpenedAt.ts`
- 새 `features/home/newPostings.ts`
- 새 `pages/home/jobs/NewPostingsCard.tsx`, `PostingRow.tsx`, `useHomeRecommend.ts`, `Jobs.css`
- `pages/home/dashboardCards.tsx` (새 추천 공고 body)
