# 프로젝트 8단계: 플랜 트리·달력 연동

- 요구사항: R45–R52
- 목업: 프로젝트 목업에는 없음. 플랜 목업의 카테고리 묶음 모양을 그대로 쓴다 (플랜 `human/mockups/index.html`에서 목록 화면만 확인)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D2, D5

## 할 일
- 공용 묶음 함수: 새 `features/projects/group.ts` `taskGroupInfo(data, task)` → 카테고리면 `{ kind: "category", name, color }`, 프로젝트 단계면 `{ kind: "stage", name: "<프로젝트> › <단계>", projectName, color: 프로젝트 색 }`, 없으면 미분류 회색.
- 트리 (R45–R47): `TaskListPanel`에서 카테고리 묶음 다음, 미분류 앞에 진행 중 프로젝트를 프로젝트 순서대로. 
  - `ProjectGroup`: 카테고리 `GroupHead`와 같은 모양(색·이름·끝나지 않은 개수·접기, 접기 키 `project:<id>`). 프로젝트 순서 끌기는 이곳에 두지 않는다(목록 화면에서, R7).
  - `StageGroup`: 한 층 들여서 이름(주차형은 기간도) · 끝나지 않은 개수 · `+`(→ `InlineTaskInput` → `addStageTask`). 펼침은 `stageFold[stageId]`가 있으면 그 값, 없으면 현재 단계만 펼침. 누르면 `toggleStageFold`.
- 단계 안 태스크 (R48): 플랜 `GroupTasks`·`TaskRow`·`DoneFold`를 그대로 써서 R13–R15 규칙(배치한 태스크 기간 표시 포함).
- 달력 (R49): 단계 태스크 줄도 `data-task-row`로 끌면 달력에 배치된다. `BarLayer`·`DragGhost`의 색을 `taskGroupInfo`로.
- 묶음으로 옮기기 (R50): `DropTarget`에 `{ kind: "stage"; stageId }`. `StageGroup`에 `data-drop-stage`. 단계에 놓으면 `updateTask(id, { stageId })`(카테고리 없어짐), 카테고리·미분류 묶음에 놓으면 `{ categoryId }`(프로젝트에서 빠짐). 놓을 묶음 테두리 + "여기로 옮기기" 알약은 카테고리와 같게.
- 빠른 입력 (R51): `QuickAdd` 선택 목록은 카테고리만(지금 그대로인지 확인만).
- 상세 팝업 (R52): `PropRows` 카테고리 선택에 구분선 아래 "프로젝트 › 단계" 항목(진행 중 프로젝트만). 고르면 `{ stageId }`, 카테고리를 고르면 `{ categoryId }`. 지금 값이 단계면 칩에 프로젝트 색·"프로젝트 › 단계".

## 확인할 결과
- `npm run build` 성공.
- 플랜 왼쪽에 카테고리들 → 프로젝트들 → 미분류 순서. 프로젝트 순서는 프로젝트 목록 순서와 같다. 완료된 프로젝트는 보이지 않는다.
- 처음에는 현재 단계만 펼쳐져 있다. 다른 단계를 펴고 앱을 다시 켜도 펼친 채다.
- 단계 `+`로 만든 태스크가 프로젝트 상세의 그 단계 칸에도 보인다.
- 단계 태스크를 달력에 끌면 프로젝트 색 막대로 배치되고, 늘이기·옮기기가 플랜과 같다.
- 단계 태스크를 카테고리 묶음에 놓으면 그 카테고리로, 카테고리 태스크를 단계에 놓으면 그 단계로 옮겨진다(상세 칸에서도 확인).
- 빠른 입력 선택 목록에 프로젝트가 없다. 상세 팝업에서 "프로젝트 › 단계"를 고르면 트리 자리가 바뀐다.

## 이 단계에서 만들거나 고칠 파일
- 새 `features/projects/group.ts`
- `pages/plan/list/TaskListPanel.tsx`, 새 `ProjectGroup.tsx`, `StageGroup.tsx`, `TaskList.css`
- `pages/plan/drag/usePlanDrag.ts`, `PlanDragProvider.tsx`, `DragGhost.tsx`
- `pages/plan/detail/PropRows.tsx`, `calendar/BarLayer.tsx`
