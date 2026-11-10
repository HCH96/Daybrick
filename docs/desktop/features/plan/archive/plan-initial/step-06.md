# 플랜 6단계: 끌어 놓기

- 요구사항: R22, R25–R27
- 목업: `part-calendar.html` cal-drag·cal-move·cal-resize 구역, `part-list.html` list-drop 구역 (CSS: parts.css·plan.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D2, D12

## 할 일
- `dragMath.ts` (순수 함수):
  - `placeOnDay(task, day)`: 날짜 없으면 하루짜리, 있으면 길이 유지하고 시작일만 옮김 (R22).
  - `moveBy(task, days)`: 길이 유지 (R25).
  - `resizeStart(task, day)`·`resizeEnd(task, day)`: 끝일보다 뒤로(시작일보다 앞으로) 갈 수 없게 막음 (R26).
- `drag/PlanDragProvider`·`usePlanDrag` (D12):
  - 끌 것 종류: 목록 태스크(`list-task`), 막대 옮기기(`bar-move`, 누른 날과 막대 시작일의 차이 기억), 막대 끝(`bar-start`·`bar-end`).
  - 포인터를 누르고 4px 넘게 움직이면 끌기 시작, 아니면 그대로 클릭(팝업). `setPointerCapture`, Esc로 취소.
  - 놓을 곳 찾기: 달력 칸은 `data-day` 열의 위치로 날짜를 계산, 왼쪽 목록 영역은 `data-drop="list"`.
  - 놓으면 `update-task`로 기간만 바꾼다. 목록에 놓으면 날짜 지우기 (R27, 이미 날짜 없음이면 아무것도 안 함).
- `drag/DragGhost`·`drag.css`: 포인터를 따라가는 끄는 모습, 놓일 칸 보라 테두리 + 옅은 보라 바탕, 아래에 놓일 날짜 알약("11/4 (수)" 또는 "11/4–11/6"), 옮기는 막대는 원래 자리에 흐린 점선 막대. 목록 위면 목록 영역 테두리 + "날짜 지우기".
- `TaskBar`: 마우스를 올렸을 때만 양 끝 세로 손잡이 (잘린 쪽 끝에는 손잡이 없음).
- 끄는 동안 글자 선택이 생기지 않게 한다.

## 확인할 결과
- `npm run build` 성공.
- 날짜 없는 태스크를 수요일 칸에 놓으면 하루짜리, 3일짜리 태스크를 놓으면 3일 길이로 그날부터.
- 막대를 끌어 옮기면 길이가 그대로이고, 양 끝을 끌면 시작일·끝일이 바뀐다. 끝을 반대쪽 끝 너머로 끌어도 하루보다 짧아지지 않는다.
- 막대를 왼쪽 목록에 놓으면 막대가 사라지고 목록 줄이 "날짜 없음".
- 끄는 동안 놓일 칸·날짜 알약·점선 막대가 보이고, Esc를 누르면 원래대로.
- 막대·목록 줄을 살짝 누르기만 하면 팝업이 열린다 (끌기로 잘못 잡히지 않음).
- Node로 `dragMath` 실행: 11/3–11/5를 `moveBy(+2)` → 11/5–11/7, `resizeEnd(11/2)` → 11/3–11/3.

## 이 단계에서 만들거나 고칠 파일
- 새 `apps/desktop/src/features/plan/dragMath.ts`
- 새 `pages/plan/drag/PlanDragProvider.tsx`, `usePlanDrag.ts`, `DragGhost.tsx`, `drag.css`
- `pages/plan/PlanPage.tsx`, `calendar/WeekCalendar.tsx`, `calendar/BarLayer.tsx`, `calendar/TaskBar.tsx`, `list/TaskRow.tsx`, `list/TaskListPanel.tsx`
