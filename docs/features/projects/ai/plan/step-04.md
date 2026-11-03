# 프로젝트 4단계: 단계 칸·태스크 줄

- 요구사항: R29–R34
- 목업: `detail.html` detail-stages 구역, `detail-weekly.html` weekly-stages 구역 (CSS: detail.css에서 클래스 검색)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D2

## 할 일
- 단계 칸 배치 (R29): `StageBoard` — 단계형은 칸을 같은 너비로 나누고, 주차형은 272px 고정 칸을 가로로 넘긴다. 처음 열면 이번 주 칸이 맨 앞에 오도록 스크롤. 현재 단계 칸은 프로젝트 색 테두리 + `현재`/`이번 주` 칩.
- 칸 머리 (R30): `StageColumn` — 이름(주차형은 `N주차 · 이름`, 말줄임) · 기간(주차형 `11/3–11/9`) · `완료/전체`(모두 끝나면 초록) · `+`.
- 태스크 줄 (R31, R33): `StageTaskRow` — 플랜 `StatusDot`(누르면 `cycleStatus`) · 제목 · 기간 또는 흐린 `날짜 없음` · 체크리스트 `2/4`. 휴지통은 마우스를 올린 줄만, 누르면 플랜과 같은 확인 창 → `deleteTask`. 완료 태스크는 `완료 N` 구분선 아래 흐린 제목. 줄을 누르면 플랜 `TaskDetailModal`(Notes를 개발일지로).
- 새 태스크 (R32): `+` → 칸 맨 아래 보라 테두리 입력 줄(플랜 `InlineTaskInput`), Enter로 `addStageTask` 후 입력 줄 유지, Esc·빈칸 떠나기로 닫음.
- 빈 칸: 가운데 `아직 태스크가 없어요` / `+ 를 눌러 추가`.
- 끌어 옮기기 (R34): `useStageTaskDrag` — 누름 → 4px 넘게 움직이면 끄는 중, 플랜 `DragGhost`와 같은 기울어진 모습, 놓을 칸(`data-drop-stage`) 테두리. 다른 칸에 놓으면 `updateTask(id, { stageId })`. 같은 칸·칸 밖이면 그대로.

## 확인할 결과
- `npm run build` 성공.
- `+`로 태스크 3개를 연달아 입력할 수 있고, 새 태스크는 `날짜 없음`·시작 전.
- 상태 표시를 누르면 시작 전 → 진행 중 → 완료, 완료는 `완료 N` 아래로 내려가고 머리 `완료/전체`가 바뀐다. 한 단계를 모두 완료하면 머리가 초록, 위 깃발이 끝난 깃발로, 캐릭터가 달려간다.
- 줄을 누르면 플랜 상세 팝업이 열리고, 고친 제목·기간이 줄에 바로 보인다.
- 태스크를 다른 칸으로 끌어 놓으면 옮겨지고, 다시 켜도 그 단계에 있다.
- 주차형은 이번 주 칸이 맨 앞에 보이고 가로로 넘길 수 있다.
- 프로젝트를 지우면(2단계 메뉴) 그 태스크가 플랜 미분류에 보인다.

## 이 단계에서 만들거나 고칠 파일
- 새 `pages/projects/detail/StageBoard.tsx`, `StageColumn.tsx`, `StageTaskRow.tsx`, `useStageTaskDrag.ts`
- `pages/projects/detail/ProjectDetail.tsx`, `Detail.css`
