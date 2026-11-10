# 캘린더 6단계: 드래그로 옮기기

- 요구사항: R35–R40
- 목업: `part-drag.html` drag-move·drag-bounce·drag-locked (CSS: parts.css에서 drag·bounce·shake 클래스 검색)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D2, D10

## 할 일
- `useCalendarDrag` (D10): 칩에서 누른 채 4px 넘게 움직이면 드래그. 포인터 아래 칸은 `data-day` 속성으로 찾는다. 4px 이하로 놓으면 원래 누르기 동작(4단계·5단계).
- 끄는 중 (R35): 원래 칩 28%, `DragGhost`는 -1.5° 기울어 포인터를 따라간다. 놓일 칸(여러 날이면 기간 전체)은 옅은 보라 바탕 + 테두리, 칩 자리는 보라 점선.
- 놓기 (R35, R39–R40): 이동 일수 = 놓은 날 − 잡은 날(막대 안 어느 칸을 잡았는지 포함). 태스크는 플랜 `moveBy` → `updateTask({start, end})`(완료 태스크도), 개인 일정은 `moveEvent`. 다른 달로 보이는 앞뒤 칸에도 놓을 수 있다. 그리드 밖이나 Esc → 취소.
- 튀어오름 (R37): 놓은 칩에 280ms 애니메이션(위로 3px·1.06배 → 1px 눌림 → 제자리). 새로 그린 칩을 key로 찾아 한 번만.
- 잠긴 칩 (R36): 지원·깃발 칩을 끌면 옮겨지지 않고 제자리에서 작게 좌우로 흔들린다.
- 막대 길이는 바꾸지 않는다(R38): 끝 손잡이를 만들지 않는다.
- 드래그 중에는 +N 목록·입력칸을 닫는다.

## 확인할 결과
- `npm run build` 성공.
- 3일 태스크(11/10–11/12)의 가운데를 잡고 11/18에 놓으면 11/17–11/19가 되고 튀어오른다. 플랜 주간 달력에서도 같은 날짜.
- 완료 태스크도 옮겨지고 흐린 모양 그대로.
- 개인 일정 "예비군"도 같은 방식으로 옮겨지고, 다시 켜도 새 날짜.
- 11월 화면의 12/3 칸에 놓을 수 있다.
- 지원 칩·깃발을 끌면 흔들리기만 한다. 칩을 살짝(4px 이하) 움직였다 놓으면 팝업이 열린다.
- 그리드 밖에 놓거나 끄는 중 Esc → 원래 자리.

## 이 단계에서 만들거나 고칠 파일
- 새 `pages/calendar/drag/useCalendarDrag.ts`, `DragGhost.tsx`, `Drag.css`
- `pages/calendar/CalendarPage.tsx`, `grid/MonthGrid.tsx`, `grid/WeekRow.tsx`, `chips/CalChip.tsx`, `Chips.css`
