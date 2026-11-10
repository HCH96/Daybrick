# 플랜 5단계: 주간 달력 표시

- 요구사항: R21, R23–R24, R28–R30
- 목업: `plan.html` plan-week·plan-bars 구역, `part-calendar.html` cal-new 구역, `plan-empty.html` plan-empty-cal 구역 (CSS: plan.css·parts.css·common.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D2, D3, D6

## 할 일
- `weekLayout.ts`: `layoutWeekBars(tasks, weekStart)` → 이번 주에 걸린 태스크만 `{ taskId, col, span, lane, cutLeft, cutRight }`. 시작일(주 안으로 자른 값) 순 → 긴 것 먼저 → 만든 순으로 놓고, 겹치지 않는 가장 위 줄에 넣는다 (R29).
- `calendar/WeekCalendar`: 위에 `WeekNav`, 요일 머리, 그 아래 7칸 세로줄 배경 + 막대 층. 몸통은 세로 스크롤 (R29). 지원 일정 층 자리는 7단계에서.
- `calendar/DayHeader` (R21): "월 2" 모양, 오늘은 날짜 숫자 보라 원 + 칸 전체 아주 옅은 보라, 토 파랑·일 빨강 글자.
- `calendar/BarLayer`·`TaskBar` (R23–R24): 격자 위치(`grid-column: col+1 / span`, 줄 = lane). 카테고리 색 옅은 바탕 + 왼쪽 굵은 선(`--cat` + `color-mix`), 앞에 상태 표시, 제목 말줄임, 완료는 흐리게. 잘린 쪽은 모서리 각지게 + ‹ / ›. 누르면 팝업 (R30). 진행도 자리는 8단계에서.
- 더블클릭 (R28): 막대 없는 빈 곳을 더블클릭하면 그 날짜 칸 아래쪽에 `InlineTaskInput`(Enter 뒤 닫힘). 미분류, 그날 하루짜리.
- `calendar/WeekEmptyHint`: 이번 주 막대가 하나도 없으면 아래쪽 옅은 안내 한 줄 (목업 제안).

## 확인할 결과
- `npm run build` 성공.
- 오늘 칸이 강조되고 토·일 글자색이 다르다. 팝업에서 기간을 정한 태스크가 그 날짜들에 막대 하나로 보인다.
- 이번 주 일요일을 넘는 태스크는 오른쪽이 각지고 ›, 다음 주로 가면 왼쪽이 각지고 ‹.
- 같은 날 걸린 막대가 겹치지 않게 줄이 나뉘고, 많아지면 달력이 세로로 스크롤된다. 완료 막대는 흐리게 남는다.
- 빈 곳 더블클릭 → 제목 입력 → Enter → 그날 막대 + 목록 미분류 묶음에 생긴다.
- 막대를 누르면 상세 팝업. 막대 없는 주에는 안내 한 줄.
- Node로 `layoutWeekBars`: 11/2–11/4, 11/3–11/5, 11/6 → 줄 0, 1, 0. 10/30–11/3 → col 0, cutLeft.

## 이 단계에서 만들거나 고칠 파일
- 새 `apps/desktop/src/features/plan/weekLayout.ts`
- 새 `pages/plan/calendar/WeekCalendar.tsx`·`WeekCalendar.css`, `DayHeader.tsx`, `BarLayer.tsx`, `TaskBar.tsx`, `WeekEmptyHint.tsx`
- `pages/plan/PlanPage.tsx`, `list/InlineTaskInput.tsx`(필요하면)
