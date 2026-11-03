# 프로젝트 5단계: 단계 편집·골인

- 요구사항: R13, R14, R18, R25
- 목업: `part-create.html` create-stage·create-weekly 구역의 편집 칸 모양을 다시 쓴다 (확인 창·골인 연출은 목업에 없음, [index.md](index.md) 작은 규칙대로)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D3, D5

## 할 일
- reducer·store (R13, R14): `editStages(projectId, StageEdit)` — 단계 목록·이름·순서를 바꾸고, 주차형은 `startWeek`도. `removed`의 태스크는 `moveTo` 단계로 옮기거나 함께 지운다. 한 번의 변경으로 처리한다(D5). `setGoalSeen(projectId, at | null)`.
- 편집 창 (R13): `EditStagesDialog` — 만들기 창의 `StageListEditor`/`WeeklyEditor`를 그대로 쓰고 종류 칸은 보여주기만 한다. 단계형: 추가·삭제·이름·끌어서 순서. 주차형: 시작 주·주 수·주차 이름. 상세 머리 `단계 편집`/`주차 편집`, 카드 `…` 메뉴 `단계 편집`에 연결.
- 확인 창 (R14): `저장`을 누를 때, 사라지는 단계(삭제·주 수 줄이기) 중 태스크가 있는 것마다 `RemoveStageConfirm` — "'<단계>'에 태스크 N개가 있어요" + 대상 단계 선택(남는 단계만) + `옮기기` / `함께 지우기` / `취소`. 취소하면 편집 창으로 돌아간다. 태스크가 없는 단계는 묻지 않는다.
- 골인 (R25): `GoalCelebration` — 상세를 보는 중 `isProjectDone`이 거짓 → 참이 되거나, 완료 프로젝트를 열었는데 `goalSeenAt`이 비어 있으면 한 번 재생. 캐릭터가 결승에 닿으면 결승 깃발 펄럭 + 색종이 1.6초 + "골인!" 배지, 끝나면 `setGoalSeen(id, 지금)`.
- `useGoalReset` (R18): `App`의 Provider 안에서 완료가 아닌데 `goalSeenAt`이 있는 프로젝트를 찾아 비운다. 그래서 되돌렸다 다시 완료하면 연출이 또 나온다.

## 확인할 결과
- `npm run build` 성공.
- 단계형: 단계 추가·이름 바꾸기·순서 바꾸기가 깃발과 칸에 바로 반영된다.
- 태스크가 있는 단계를 지우면 확인 창이 뜨고, `옮기기`는 고른 단계로, `함께 지우기`는 태스크도 사라진다. `취소`하면 아무것도 바뀌지 않는다.
- 주차형: 주 수를 6 → 4로 줄이면 5·6주차 중 태스크가 있는 주차만 묻는다. 시작 주를 바꾸면 깃발 아래 날짜와 칸 기간이 바뀐다.
- 마지막 미완료 태스크를 상세에서 완료하면 골인 연출이 한 번 나오고, 목록에서는 카드가 `완료 N개` 묶음으로 간다. 다시 열면 연출이 나오지 않는다.
- 플랜에서 완료한 경우: 상세를 처음 열 때 연출이 한 번 나온다.
- 태스크를 되돌리면 진행 중으로 돌아오고, 다시 완료하면 연출이 또 나온다.

## 이 단계에서 만들거나 고칠 파일
- `features/plan/reducer.ts`, `store.tsx`
- 새 `features/projects/useGoalReset.ts`, `App.tsx`
- 새 `pages/projects/edit/EditStagesDialog.tsx`, `RemoveStageConfirm.tsx`
- 새 `pages/projects/detail/GoalCelebration.tsx`
- `pages/projects/detail/DetailHead.tsx`, `ProgressPanel.tsx`, `Detail.css`, `list/CardMenu.tsx`, `create/StageListEditor.tsx`, `WeeklyEditor.tsx`
