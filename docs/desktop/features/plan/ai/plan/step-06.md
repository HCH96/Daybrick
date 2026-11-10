# 플랜 수정1 6단계: 목록 안 카테고리 옮기기

- 요구사항: R45 (영향: R13, R22, R27)
- 목업: `part-row-actions.html` row-move-cat 구역 (CSS: parts.css·plan.css·common.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D12, D19, D22(L17에서 변경), D31

## 할 일
- `drag/usePlanDrag.ts`: `DropTarget`에 `{ kind: "group"; categoryId: string | null }` 추가 (미분류는 `null`, 묶음 키는 `NONE_GROUP_KEY`).
- `CategoryGroup`(카테고리·미분류 묶음 전체)에 `data-drop-group="<id|none>"`. `PlanDragProvider`가 `list-task` 끌기일 때만 묶음을 놓을 곳으로 본다. `bar-move`는 예전처럼 목록 전체 = 날짜 지우기(R27), 카테고리는 바꾸지 않는다(D31).
- 놓으면 `updateTask(id, { categoryId })`. 같은 묶음이면 아무것도 하지 않는다. 묶음 안 위치는 `sortGroupTasks` 순서(R13)를 따르므로 따로 순서를 저장하지 않는다.
- 모습: 끄는 줄은 살짝 기울어 마우스를 따라옴(`DragGhost`), 원래 자리 점선, 놓을 묶음 전체 보라 테두리 + 머리 오른쪽 "여기로 옮기기" 알약. 줄 사이 선은 없음. 접힌 묶음에도 놓을 수 있다.
- 달력 위로 가면 예전처럼 날짜 칸이 놓을 곳이다(R22).

## 확인할 결과
- `npm run build` 성공.
- C++ 공부 묶음의 줄을 TrialGround 묶음에 끌면 그 묶음 전체에 보라 테두리 + "여기로 옮기기"가 보이고, 놓으면 TrialGround로 옮겨져 R13 순서 자리에 들어간다. 묶음 머리 개수가 둘 다 바뀌고, 달력 막대 색도 바뀐다.
- 미분류 묶음에 놓으면 미분류가 되고, 미분류 줄을 카테고리 묶음에 놓으면 그 카테고리가 된다. 같은 묶음에 놓으면 변화 없음.
- 목록 줄을 달력 칸에 놓기(R22)와 달력 막대를 목록에 놓아 날짜 지우기(R27)는 그대로 된다. 막대를 다른 묶음 위에 놓아도 카테고리는 그대로다.
- 미분류 묶음 머리에 `…` 메뉴가 없다 (r1 2번에서 확인하지 못한 항목, L15).

## 이 단계에서 고칠 파일
- `apps/desktop/src/pages/plan/drag/usePlanDrag.ts`, `PlanDragProvider.tsx`, `DragGhost.tsx`, `drag.css`
- `pages/plan/list/CategoryGroup.tsx`, `GroupHead.tsx`, `list/TaskList.css`
