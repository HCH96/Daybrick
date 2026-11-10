# 메인 페이지 수정1 3단계: 상단 빠른 추가·요약 줄

- 요구사항: R10–R13, R22–R26, R28
- 목업: `dash.html` dash-head·dash-summary 구역, `part-empty.html` empty-head 구역 (CSS: dash.css에서 `.head`, `.quick`, `.kpis`, `.kpi` 검색)
- 경로 기준: [index.md](index.md) 맨 위

## 할 일
- `HomePage`: `useTodayKey()`로 오늘 날짜를 받아 머리·요약 줄·카드에 넘긴다. 자정이 지나면 키가 바뀌어 다시 그린다 (R28).
- `HomeHeader` (R10–R11): todayKey로 "2026년 11월 7일 (토)" + "좋은 하루예요".
- `QuickAdd` (R12, R22, D5): disabled를 풀고 Enter에 `usePlan().addTask(title.trim(), null, { start: today, end: today })`.
  - 공백만 있으면 무시, 만든 뒤 입력칸을 비우고 포커스 유지, 이동하지 않는다.
  - 입력 중 보라 테두리, 아래에 "플랜에 오늘 할 일로 추가돼요 (미분류)" 안내.
  - 플랜 데이터가 준비 전이라 `addTask`가 null을 돌려주면 입력을 지우지 않는다.
- 새 `features/home/summary.ts`:
  - `todayDone(plan, todayKey)`: `tasksOnDate`(칸반과 같은 대상)의 완료 수 / 전체 수 (R24)
  - `nextEvent(upcoming, now)`: 2단계 결과에서 개인·지원만, 지금 이후 가장 가까운 것. 시각 없는 항목은 그날 하루 내내 "앞으로" (R25)
  - `nearestDeadline(applications, todayKey)`: 서류 마감·과제 마감, 오늘 이후(오늘 포함) 가장 가까운 것, 기간 제한 없음. 오늘이면 `D-day` (R26, D7)
  - `shortDayLabel(dateKey, todayKey)`: "오늘 / 내일 / 11/12 (수)"
- `SummaryStrip` (R13, R23): 4칸 값 연결. 오늘 집중 = `dayTotal(today, todayKey, now)` / 하루 목표 + 가는 막대, 타이머가 도는 동안 `useNow`로 갱신.
  - 강조색은 다음 일정 날짜·시각, D-n에만 쓴다. 빈 값은 회색 문장 (표의 "비었을 때").
  - 칸 오른쪽 위에 이동할 곳을 흐리게 적고, 누르면 투데이·투데이·캘린더·지원 관리로 이동.

## 확인할 결과
- `npm run build` 성공.
- 빠른 추가: "테스트 할 일" + Enter → 플랜 미분류에 오늘 하루짜리·시작 전 태스크, 입력칸 비고 포커스 유지, 홈 그대로. "   " + Enter → 아무 일 없음. 투데이 칸반에도 바로 보이고, 오늘 완료가 `0 / 1`.
- Node로 `nextEvent`: 지금 15:00, 오늘 14:00 면접·오늘 시각 없는 개인·내일 10:00 → 오늘 시각 없는 개인. `nearestDeadline`: 오늘 과제 마감 → "D-day", 20일 뒤 서류 마감만 → "D-20".
- 타이머를 켜면 오늘 집중 값과 막대가 1초마다 오른다. 데이터가 없으면 `0:00 / 6:00`, "오늘 태스크 없음", "7일 안에 일정 없음", "남은 마감 없음".
- 4칸을 누르면 각 메뉴로 이동.
- PC 시계를 23:59로 맞춰 두고 자정이 지나면 날짜와 7일이 새로 그려지는지 본다 (8단계에서도 다시 확인).

## 이 단계에서 만들거나 고칠 파일
- 새 `features/home/summary.ts`
- `pages/home/HomePage.tsx`, `HomeHeader.tsx`, `QuickAdd.tsx`·`.css`, `SummaryStrip.tsx`·`.css`
