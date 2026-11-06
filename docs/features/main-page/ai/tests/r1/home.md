# r1 홈 틀·요약 줄 (req-home)

순수 함수 항목은 upcoming.md와 같은 방법(rolldown으로 묶어 node 실행)으로 확인했다.

## A5 nextEvent
- 근거: R25
- 수행 방법: `features/home/summary.ts`의 `nextEvent`, `shortDayLabel` 실행. 오늘 14:00 넥슨 면접, 오늘 시각 없는 개인, 내일 10:00 개인
- 예상 결과: 지금 15:00이면 오늘 시각 없는 개인 일정. 같은 날 둘 다 앞으로면 시각 있는 것 먼저(L39). "오늘/내일/M/D (요일)"
- 실제 결과: 15:00 → `{오늘, 시각 없음, "오늘 종일"}`. 09:00 → 14:00 "넥슨 면접" 먼저. 14:00 정각도 앞으로 봄. 오늘 것이 없으면 내일 10:00. 표기 "오늘", "내일", "11/11 (수)", "11/12 (목)"(2026-11-12는 목요일). 일정 없으면 null.
- 판정: 통과

## A6 nearestDeadline
- 근거: R26
- 수행 방법: `nearestDeadline`, `ddayLabel` 실행. `applications/calendarEntries.ts`의 `groupEntriesByDate` 읽음
- 예상 결과: "D-day", "D-20", 지난 것·지원 완료 이후 카드는 세지 않음
- 실제 결과: 오늘 18:00 과제 마감 + 20일 뒤 서류 마감 → "D-day", "B사 과제 마감". 20일 뒤 서류 마감만 → "D-20". 어제 과제 마감 + 지원 완료·결과 대기 카드의 지원 마감만 → null. 지원 완료 카드 마감(내일) + 지원 준비 카드 20일 뒤 → "D-20".
- 판정: 통과

## A7 오늘 집중·오늘 완료·빈 값 문구
- 근거: R23–R24, R13
- 수행 방법: `features/today/stats.ts`의 `dayTotal`, `format.ts`의 `formatClock`, `summary.ts`의 `todayDone` 실행. `pages/home/SummaryStrip.tsx` 읽음. 투데이 `pages/today/summary/FocusTile.tsx`도 같은 `dayTotal`·`dailyGoalMinutes`를 쓰는지 grep
- 예상 결과: 투데이와 같은 값, 문구 일치
- 실제 결과: 기록 1시간 + 실행 중 30분 → "1:30", 10분 뒤 "1:40". 일시정지(구간 20분 닫힘) → "1:20", 1시간 뒤에도 "1:20". 빈 값 "0:00 / 6:00"(목표 360분). 오늘 완료는 `tasksOnDate`(칸반과 같은 대상)로 1/3. 문구 "오늘 태스크 없음"(전체 0), "7일 안에 일정 없음", "남은 마감 없음" 코드에 있음. 실행 중일 때만 1초마다 갱신.
- 판정: 통과

## A8 빠른 추가
- 근거: R12, R22
- 수행 방법: `pages/home/QuickAdd.tsx`, `features/plan/store.tsx`의 `addTask`·`newTask` 읽음
- 예상 결과: 모두 맞음
- 실제 결과: 플랜 공용 `addTask(title.trim(), null, {start: 오늘, end: 오늘})` 사용 → 미분류, 시작·끝 오늘, 상태 "todo". Enter(한글 조합 중 제외)에서 공백만이면 return. 만들면 입력값만 비우고 입력칸은 그대로라 포커스 유지. 이동 호출 없음.
- 판정: 통과

## A15 저장 함수 호출 범위
- 근거: R27
- 수행 방법: `pages/home` 전체에서 save·write·update·invoke·dispatch·add·delete·타이머 동작 grep, `features/home/*.ts` 읽음
- 예상 결과: 빠른 추가·타이머 조작 외 저장 없음, 공용 함수 사용
- 실제 결과: 저장을 일으키는 호출은 `addTask`(빠른 추가)와 `requestStart`·`pause`·`resume`·`complete`·`stop`(투데이 공용 저장소)뿐. 계산은 `buildCalItems`, `groupEntriesByDate`, `tasksOnDate`, `dayTotal(s)`, `runnerPosition`·`currentStage`·`projectSlices`, `sortPostings`, `summarizeApplications` 등 각 기능 함수 사용.
- 판정: 통과

## A16 자정 다시 계산
- 근거: R28
- 수행 방법: `features/today/useTodayKey.ts` 읽고 `msUntilMidnight` 실행. 홈 페이지·카드의 사용처 확인
- 예상 결과: 맞음
- 실제 결과: 다음 자정 + 50ms에 키를 다시 계산하고 focus·visibilitychange 때도 확인. 23:59:30 → 30000ms. `HomePage`와 각 카드(다가오는 7일, 지금 하는 것, 이번 주 집중, 프로젝트, 새 추천 공고)가 `useTodayKey()`를 불러 키가 바뀌면 다시 그림.
- 판정: 통과

## A17 카드 정의·그리드
- 근거: R14–R16
- 수행 방법: `pages/home/dashboardCards.tsx`, `DashboardCard.tsx`·`.css`, `HomePage.tsx`·`.css` 읽음. 옛 카드 id·`WeeklyFocusEmpty` grep, `git show 8f63214 --stat`
- 예상 결과: 모두 맞음
- 실제 결과: 카드 6개(다가오는 7일 large, 지금 하는 것·이번 주 집중 narrow, 프로젝트 진행·지원 현황·새 추천 공고 quarter). 오른쪽 위 링크 `{linkLabel} ›`, 지원 현황 "지원 관리 ›". 옛 카드("오늘 할 일", "오늘 일정", "오늘 집중 시간")와 `WeeklyFocusEmpty` 파일이 없어짐. `@media (max-width: 1279px)`에서 모두 span 6. `.home-page` max-width 1280px, 그리드 `grid-auto-rows: minmax(200px, auto)`.
- 판정: 통과

## A18 카드 세 상태
- 근거: R17
- 수행 방법: `pages/home/CardState.tsx`와 각 카드의 호출 읽음
- 예상 결과: 모두 맞음
- 실제 결과: loading = 회색 줄 3개(90/70/80%) + "불러오는 중…". error = 경고 아이콘 + "○○을 불러오지 못했어요" 문장, 이동 버튼 없음. empty = 메뉴 아이콘 + 굵은 안내 + 설명 + "<메뉴>로 가기" 버튼(새 추천 공고 0개만 버튼 숨김).
- 판정: 통과

## A19 요약 줄 4칸 이동
- 근거: R13
- 수행 방법: `SummaryStrip.tsx`의 `SummaryItem` 호출 읽음
- 예상 결과: 맞음
- 실제 결과: 오늘 집중·오늘 완료 → "today", 다음 일정 → "calendar", 가까운 마감 → "applications". 칸 전체가 버튼이고 `openTarget({ page })`로 이동.
- 판정: 통과
