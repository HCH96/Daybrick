# r1 홈 카드 (req-home-cards)

순수 함수 항목은 upcoming.md와 같은 방법(rolldown으로 묶어 node 실행)으로 확인했다. 오늘 = 2026-11-07 (토).

## A9 지금 하는 것 목록·칸반 순서 함수
- 근거: R36–R37, D11
- 수행 방법: `pages/home/now/NowTaskList.tsx`의 `openTasksToday`와 같은 식을 `sortLikePlanList`·`tasksOnDate`로 실행. `grep sortLikePlanList`, `git show 83c1982 -- pages/today/kanban/Kanban.tsx`
- 예상 결과: 진행 중 1 + 시작 전 2, "외 1개 · 투데이에서 보기", 투데이 칸반도 같은 함수(동작 같음)
- 실제 결과: 오늘 태스크 5개(진행 중 1, 시작 전 3, 완료 1) → 보이는 줄 doing1, todo2(카테고리 있음), todo1. 남은 1개 → "외 1개 · 투데이에서 보기"(투데이로 이동). `features/today/kanbanOrder.ts`의 함수 본문이 칸반에서 지운 옛 함수와 같고, `Kanban.tsx`가 이 함수를 import해서 씀.
- 판정: 통과

## A10 실행 중 카드
- 근거: R35
- 수행 방법: `pages/home/now/NowTimer.tsx`, `NowCard.tsx` 읽음. `sessionElapsed`·`taskTotalOn` 실행
- 예상 결과: 모두 맞음
- 실제 결과: `useToday()`(투데이 공용 저장소)의 `running`과 pause·resume·complete·stop 사용. 경과는 `formatClock` + 초 → 15:00 시작, 15:42:15에 "0:42:15". 보조 줄 "<묶음> · 오늘 이 태스크 1:42". 태스크가 없으면 제목 "지금 도는 태스크", 묶음 "미분류". 일시정지면 갱신 멈춤.
- 판정: 통과

## A11 weekFocus
- 근거: R38–R39
- 수행 방법: `features/home/weekFocus.ts` 실행, `pages/home/week/WeekFocusCard.tsx`의 `durationLabel`과 같은 식 실행
- 예상 결과: 예시대로
- 실제 결과: 첫날 2026-11-02 "월", "11/2 (월)". 상태 past×5, 11/7 today, 11/8 future. 11/5 09:00~13:00 → 4시간, 합계 4시간. 11/5 23:00~11/6 01:00 → 1시간씩. 11/8 기록이 있어도 future는 0. 글자 "6시간", "4시간", "1시간 30분", "40분".
- 판정: 통과

## A12 projectRows
- 근거: R40–R41
- 수행 방법: `features/home/projectRows.ts` 실행, `pages/home/projects/ProjectProgressCard.tsx`·`ProjectRow.tsx` 읽음
- 예상 결과: 모두 맞음
- 실제 결과: 8주 주차형(시작 10/26, 오늘 11/9 = 15일째) "3주차 / 8". 단계 4개 중 1단계 끝, 2단계 4개 중 2개 완료 → "2단계 · 구현", 진행 0.375. 단계 없음 → "단계 없음", 0. 누적 12시간 40분 → "12:40". 진행 중 5개 → 카드는 `MAX_ROWS` 4줄 + "외 1개".
- 판정: 통과

## A13 newPostings
- 근거: R44, D10
- 수행 방법: `features/home/newPostings.ts` 실행 (지금 11/7 15:00)
- 예상 결과: 새 공고 2개 87→72 / 0개
- 실제 결과: openedAt 11/6 12:00 → count 2, 점수 [87, 72] (11/5 90점은 오래됨, 11/6 마감 95점은 빠짐). openedAt null → `{count: 0, top: []}`.
- 판정: 통과

## A14 추천 공고 읽기·표시
- 근거: R43, R45–R47, D9
- 수행 방법: `pages/home/jobs/useHomeRecommend.ts`, `NewPostingsCard.tsx`, `PostingRow.tsx`, `Jobs.css`, `pages/job-search/recommend/useOpenedAt.ts`의 `readOpenedAt`, `utils/relativeTime.ts`, `styles/theme.css` 읽음. `recommendOpenedAt`·`markRecommendOpened` grep
- 예상 결과: 모두 맞음
- 실제 결과
  - `serverSession`이 있고 `status === "connected"`일 때만 `loadRecommend` + `readOpenedAt` 호출. effect가 `[session]`에만 걸려 머무는 동안 다시 읽지 않고, 끊겼다(null) 다시 이어지면 다시 읽음.
  - `readOpenedAt`은 캐시나 파일을 읽기만 함. `pages/home`에 `markRecommendOpened`·`recommendOpenedAt` 쓰기 없음.
  - 수집 줄 "마지막 수집 N시간 전"(오늘이면 `formatRelativeTime`), 없으면 "아직 수집 안 함".
  - 마감 없음 "상시", D-7 이하 `--amber`(#f0b860 주황), 점수 80 이상 `--accent`(#a68cff 보라), 미만 회색.
  - 연결 안 됨 → "서버를 연결하면 추천 공고가 보여요" + "구직 관리로 가기". 0개 → "새 추천 공고가 없어요"(버튼 없음, 수집 줄).
  - 줄을 누르면 `openTarget({ page: "job-search", tab: "recommend" })`.
- 판정: 통과
