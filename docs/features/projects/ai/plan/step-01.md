# 프로젝트 1단계: 데이터·공용 계산·메뉴

- 요구사항: R1, R9–R12, R15–R18, R20, R23, R26 (이 단계는 저장·계산만, 화면은 2단계부터)
- 목업: `projects.html` 제목 줄만 (CSS: common.css 앱 틀)
- 경로 기준: [index.md](index.md) 맨 위 · 데이터 모양: [structure.md](structure.md) 2절
- 공통 규칙: D2, D3, D5, D6

## 할 일
- 데이터 모양 (D5): `features/plan/types.ts`에 `Project`, `Stage`, `Task.stageId`, `PlanView.stageFold`·`projectsDoneOpen`, `PlanData.projects`.
- 읽기 (D6): `storage.ts`에서 version 1 확인 뒤 없는 값을 채운다 (`projects: []`, 태스크마다 `stageId: null`, `stageFold: {}`, `projectsDoneOpen: false`). 빈 데이터에도 같은 값. 파일 옮기기·백업 없음.
- reducer·store (R9–R12, R15, R19): 
  - `addProject({ name, color, kind, startWeek, stageNames | weekCount, weekNames })` → id. 순서는 목록 맨 끝. 주차형은 `startWeek`를 `startOfWeek`로 맞춘다.
  - `updateProject(id, { name, color })`, `moveProject(from, to)` (`moveItem` 재사용).
  - `deleteProject(id)`: 그 단계의 태스크를 `stageId: null`, `categoryId: null`(미분류)로.
  - `addStageTask(title, stageId)` → id (날짜 없음·시작 전, R32).
  - `updateTask` 패치에 `stageId` 추가: 값을 넣으면 `categoryId = null`, `categoryId`를 넣으면 `stageId = null` (D2).
  - `toggleStageFold(stageId, open)`, `setProjectsDoneOpen(open)`.
- 선택자: `groupTasksByCategory`의 미분류 묶음에서 `stageId`가 있는 태스크를 뺀다 (플랜 화면이 예전처럼 보이게).
- 공용 계산 (`features/projects/`, 순수 함수):
  - `progress.ts`: `stageTasks`, `isStageDone`(태스크 1개 이상 + 모두 완료, R16), `currentStage`(단계형: 끝나지 않은 첫 단계, 주차형: 오늘이 속한 주차·시작 전 1주차·지나면 마지막, R17), `runnerPosition`(이어서 끝난 단계 수 + 다음 단계 완료 비율, R23), `isProjectDone`(R18, R20), `activeProjects`·`doneProjects`.
  - `weeks.ts`: `weekRange(project, i)` → `{ start, end }`, `currentWeekIndex`, `stageLabel`("N주차 · 이름" / "N주차").
  - `time.ts`: 태스크 id → 프로젝트로 묶어 `projectTotal`, `weekTotalsByProject`, `dayTotalsByProject`, `lastWorkDay`(1분 이상인 마지막 날, D4).
  - `campfire.ts`: `fireByLastDay`(visual.md 6단계), `fireByStreak`(R57 4단계), `formatLastWork`("오늘/어제/N일 전/아직 없음", R26).
- 메뉴 (R1): `PageId`에 `projects`, 라벨 `Projects` / 제목 "프로젝트", `NavIcons`에 `ProjectsIcon`(목업 icons.js), `pages.ts`에서 plan 바로 아래. `ProjectsPage`는 제목 + `진행 중 0개` + 빈 안내만.

## 확인할 결과
- `npm run build` 성공.
- 사이드바 Plan 바로 아래 `Projects`, 누르면 "프로젝트" 제목의 빈 화면.
- 기존 `plan.json`이 그대로 열리고 플랜 화면(카테고리·미분류·달력)이 예전과 같다. 아무것이나 고쳐 저장하면 파일에 `projects: []`, `stageId: null`이 생긴다.
- Node로 순수 함수 예시 실행: 단계 3개(5/5, 2/6, 0/0) → 현재 단계 2번째, 캐릭터 위치 1.33. 주차형 11/2 시작 4주 → 11/4는 1주차, 12/1은 마지막 주차. 모닥불: 오늘 blaze, 2일 전 small, 기록 없음 wood.

## 이 단계에서 만들거나 고칠 파일
- `features/plan/types.ts`, `storage.ts`, `reducer.ts`, `store.tsx`, `selectors.ts`
- 새 `features/projects/progress.ts`, `weeks.ts`, `time.ts`, `campfire.ts`
- `app/types.ts`, `pageLabels.ts`, `pages.ts`, `components/icons/NavIcons.tsx`
- 새 `pages/projects/ProjectsPage.tsx`·`.css`
