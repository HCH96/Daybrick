# 캘린더 2단계: 월 달력 틀·달 넘김

- 요구사항: R2–R4, R6, R41
- 목업: `calendar.html` cal-head·cal-grid 구역, `part-flip.html` (CSS: calendar.css·parts.css·common.css에서 `.month-nav`, `.cal`, `.dow`, `.week`, `.bg`, `.d`, flip 관련 클래스 검색)
- 경로 기준: [index.md](index.md) 맨 위

## 할 일
- 머리 (R3): `MonthHeader` — 제목 "캘린더" 오른쪽에 `[<] 2026년 11월 [>]`, `[오늘]`. D-day 없음.
- 달력 (R2): `MonthGrid`는 `utils/calendarGrid.ts`의 `getMonthGrid(year, month, 1)`(월요일 시작)로 5~6주를 받는다. 요일 머리줄 월~일은 고정.
- `WeekRow`: 7칸 배경 + 날짜 숫자 + (3단계부터) 칩 자리를 CSS grid로 둔다(열 7, 칩 줄 4).
- 칸 모양 (R4): 오늘 = 보라 테두리 + 숫자 보라 원, 지난 날 = 살짝 어두운 바탕, 다른 달 = 더 어두운 바탕. 각 달 1일 칸과 그리드 첫 칸에만 "10월 26"처럼 월을 붙인다.
- 달 넘김 (R41): 넘기는 방향으로 가로 48px + 투명도, 220ms ease-out. 그리드 상자에 `key`(년-월)와 방향 클래스를 붙여 다시 그린다. [오늘]도 방향을 맞추고, 같은 달이면 움직이지 않는다. 연타하면 앞 애니메이션을 버리고 바로 넘어간다.
- 오늘 날짜는 `useTodayKey`(투데이)로 받아 자정이 지나면 바뀐다.
- R6: 통계·합계를 넣지 않는다.

## 확인할 결과
- `npm run build` 성공.
- 2026년 11월: 6줄, 첫 칸 "10월 26", 마지막 칸 "12월 6"(12월 1일 칸에 "12월 1").
- 11/5 보라 테두리, 11/1–11/4 살짝 어둡고, 10월·12월 칸은 더 어둡다.
- [>]를 누르면 왼쪽으로 밀리며 12월, [<]는 반대. 12월에서 [오늘]을 누르면 오른쪽으로 밀리며 11월. 빠르게 다섯 번 눌러도 애니메이션이 쌓이지 않는다.
- 2026년 2월처럼 5줄인 달도 칸 높이가 화면에 맞는다.

## 이 단계에서 만들거나 고칠 파일
- `pages/calendar/CalendarPage.tsx`·`.css`
- 새 `pages/calendar/head/MonthHeader.tsx`
- 새 `pages/calendar/grid/MonthGrid.tsx`, `WeekRow.tsx`, `DayCell.tsx`, `Grid.css`
