# 화면·이번 주 진행 (req-page)

## A2 메뉴 id·제목·홈 카드 이동 대상
- 테스트 내용: 메뉴 id가 `timer`→`today`, 제목 "투데이", 홈 "오늘 집중 시간"·"이번 주 집중" 카드가 today로 이동
- 근거 요구사항: R1, D11
- 수행 방법: `grep -rn '"timer"|timer:'`(today 폴더 밖), app/types.ts PageId, app/pages.ts, app/pageLabels.ts, pages/home/dashboardCards.tsx grep
- 예상 결과: 바뀐 곳 모두 today, timer 잔여 참조 없음
- 실제 결과: PageId에 `"today"`만 있고 `"timer"` 없음. pages.ts `id: "today"`, PAGE_LABELS.today "투데이"(화면 머리도 PAGE_LABELS.today). 홈 두 카드 `linkTo: "today"`, 빈 상태 `EmptyState linkTo="today"`. 페이지 id로서의 `timer` 문자열 참조 0건 (남은 "타이머"는 주석·안내 문구뿐)
- 판정: 통과

## A3 플랜 태스크 저장소만 사용
- 테스트 내용: 투데이가 별도 태스크 데이터 없이 플랜 저장소를 읽고 쓰는가
- 근거 요구사항: R2
- 수행 방법: features/today/types.ts, store.tsx, pages/today 아래 `updateTask`·`usePlan` 사용처, `localStorage|tasks:` grep
- 예상 결과: 별도 태스크 데이터 없음
- 실제 결과: TodayData에는 records·running·settings만 있고 태스크 칸 없음. 화면은 `usePlan().state`의 tasks를 읽고, 상태·기간 변경은 모두 플랜 `updateTask`로 함 (Kanban, store finish/requestStart, OverduePopup). localStorage 등 다른 저장소 없음
- 판정: 통과

## A4 useTodayKey 자정 계산
- 테스트 내용: 자정까지 남은 시간, 자정 뒤 새 날짜 키
- 근거 요구사항: R4
- 수행 방법: features/today/useTodayKey.ts 읽기, `msUntilMidnight` 스크립트 실행
- 예상 결과: 23:59:30 → 30초, 자정 뒤 새 날짜
- 실제 결과: 11/3 23:59:30 → 30000ms. 그 시각+남은 시간+50ms의 날짜 키 "2026-11-04". 10/31 23:00 → 3600000ms(월말). 훅은 다음 자정+50ms에 setTimeout으로 다시 계산하고 key가 바뀌면 타이머를 다시 걸며, focus·visibilitychange 때도 다시 계산
- 판정: 통과

## A5 이번 주 진행 바
- 테스트 내용: 월~일 주, 플랜과 같은 주 계산, 여러 날 태스크 1개로 세기
- 근거 요구사항: R5, R6
- 수행 방법: pages/today/WeekProgress.tsx, utils/date.ts `startOfWeek`(플랜 PlanPage도 사용), plan/selectors.ts `tasksInRange` 읽기. 스크립트로 오늘 11/3, 태스크 5개(10/30~11/5 완료, 11/4, 11/8~11/10 완료, 11/1 하루, 날짜 없음)
- 예상 결과: 완료/전체 개수가 규칙대로
- 실제 결과: 주 11/2~11/8 (일요일 11/8의 주 시작도 11/2). 걸린 태스크 multi·in·sun 3개(전 주 11/1·날짜 없음 제외, 여러 날 태스크 1개), 완료 2 / 전체 3
- 판정: 통과
