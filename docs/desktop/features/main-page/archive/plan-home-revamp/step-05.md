# 메인 페이지 수정1 5단계: 이번 주 집중

- 요구사항: R38–R39
- 목업: `dash.html` dash-week 구역 (CSS: dash.css에서 `.week-`, `.bar`, `.goal-line`, `.tip` 검색)
- 경로 기준: [index.md](index.md) 맨 위

## 할 일
- 새 `features/home/weekFocus.ts`: `weekFocus(today: TodayData, todayKey, now): WeekFocusDay[]`.
  - 주 = `startOfWeek(todayKey)`부터 7일(월~일, 플랜과 같은 계산).
  - 하루 합계 = `dayTotals(today, now)` (실행 중 타이머 포함). 상태 = 지난 요일 past / 오늘 today / 안 온 요일 future.
  - 합계 함수 `weekTotal`도 같이 둔다.
- `week/WeekFocusCard.tsx` (R38–R39):
  - 카드 위쪽에 "이번 주 18시간 40분"(`formatDuration`).
  - 막대 높이 기준 = max(하루 목표, 가장 긴 날). 하루 목표 높이에 점선 + "목표 6시간".
  - 색: 지난 요일 어두운 보라, 오늘만 강조색, 안 온 요일은 납작한 회색.
  - 마우스를 올리면 막대 위에 "11/5 (목) 4시간" 말풍선.
  - 타이머가 도는 동안 `useNow`로 갱신. 투데이 데이터가 불러오는 중·못 읽음이면 CardState.

## 확인할 결과
- `npm run build` 성공.
- Node로 `weekFocus` (오늘 = 2026-11-07 토): 첫 날 11/2(월), 11/7만 today, 11/8 future. 11/5에 4시간 기록 → 그날 4시간. 자정을 넘는 기록(11/5 23:00~11/6 01:00) → 11/5·11/6에 1시간씩.
- 화면: 오늘 막대만 강조, 일요일은 납작한 회색, 목표선 위치가 하루 목표(투데이 설정)와 맞다. 투데이 화면의 주간 합계와 같은 값.
- 타이머를 켜면 오늘 막대와 주 합계가 오른다.

## 이 단계에서 만들거나 고칠 파일
- 새 `features/home/weekFocus.ts`
- 새 `pages/home/week/WeekFocusCard.tsx`, `WeekFocus.css`
- `pages/home/dashboardCards.tsx` (이번 주 집중 body)
