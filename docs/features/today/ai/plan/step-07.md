# 투데이 7단계: 칸반 끌기

- 요구사항: R13
- 목업: `part-drag.html` drag-kanban 구역 (CSS: today.css에서 drag 관련 클래스 검색)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D2, D10, 플랜 D12(4px 넘게 움직이면 끌기, 아니면 클릭)

## 할 일
- `useKanbanDrag`: 포인터 이벤트로 직접(플랜 끌기와 같은 방식, 코드는 따로). 대기 → 누름 → 4px 넘으면 끄는 중 → 놓음. 4px 안이면 클릭(상세 팝업, R14). ▶·자물쇠 버튼 위에서 누르면 끌기를 시작하지 않는다.
- 놓을 곳 찾기: 열 요소의 `data-drop-status`로 `elementFromPoint`. 놓을 열 전체를 보라 점선 + 옅은 보라 바탕, 원래 자리는 점선 자리표시.
- `DragCardGhost`: 기울어져 따라오는 카드. 끄는 카드가 실행 중이고 완료/시작 전 열 위면 "놓으면 타이머 완료" / "놓으면 타이머 중단" 말풍선.
- 놓기:
  - 같은 열이면 아무것도 안 함.
  - 실행 중 카드 → 완료 열: 타이머 `complete()` (R19). → 시작 전 열: `stop()` (R20).
  - 그 밖: `updateTask(id, { status })`. 진행 중 열로 옮기는 것만으로는 타이머를 시작하지 않는다.
- Esc를 누르면 끌기 취소.

## 확인할 결과
- `npm run build` 성공.
- 시작 전 카드를 진행 중 열로 끌면 열이 바뀌고 플랜에서도 진행 중. 끄는 동안 카드가 기울어 따라오고 놓을 열이 보라 점선.
- 실행 중 카드를 완료 열 위로 가져가면 "놓으면 타이머 완료" 말풍선, 놓으면 기록이 남고 완료 열로, 타이머 빈 상태.
- 실행 중 카드를 시작 전 열로 놓으면 중단과 같다.
- 카드를 살짝 누르기만 하면 상세 팝업이 열리고, 끌다가 Esc면 제자리.

## 이 단계에서 만들거나 고칠 파일
- 새 `pages/today/kanban/useKanbanDrag.ts`, `DragCardGhost.tsx`
- `pages/today/kanban/Kanban.tsx`, `KanbanColumn.tsx`, `KanbanCard.tsx`, `Kanban.css`
