# 메인 페이지 수정1 6단계: 프로젝트 진행·지원 현황

- 요구사항: R40–R42
- 목업: `dash.html` dash-projects·dash-apps 구역, `part-empty.html` empty-projects 구역 (CSS: dash.css에서 `.proj-`, `.apps-`, `.tile` 검색)
- 경로 기준: [index.md](index.md) 맨 위

## 할 일
- 새 `features/home/projectRows.ts`: `projectRows(plan, today, todayKey, now): ProjectRowView[]`.
  - 대상: `activeProjects(plan)` (프로젝트 화면 순서).
  - 현재 자리: 주차형은 `currentWeekIndex` → "3주차 / 8", 단계형은 `currentStage` → "2단계 · 단계 이름"(`projectStageName`).
  - 진행: `runnerPosition(project, tasks)` / 단계 수 (프로젝트 R23과 같은 계산).
  - 누적 시간: `projectTotal(projectSlices(plan, today, now).get(id))`.
- `projects/ProjectProgressCard.tsx`, `ProjectRow.tsx` (R40–R41):
  - 한 프로젝트 두 줄(색 점·이름·누적 시간 / 현재 자리·프로젝트 색 진행 막대). 최대 4개, 넘으면 "외 N개".
  - 줄을 누르면 `navigate("projects")`.
  - 없으면 CardState empty(+ [프로젝트로 가기]).
- `ApplicationsSummaryCard` (R42): 내용(`summarizeApplications`, 종료 제외 상태별·세부 단계 개수)은 그대로, 4칸 폭에 맞게 2×2 타일로. 세부 단계 문장이 길면 말줄임.

## 확인할 결과
- `npm run build` 성공.
- Node로 `projectRows`: 8주짜리 주차형 시작 후 15일째 → "3주차 / 8". 단계 4개 중 1단계 끝 + 2단계 태스크 4개 중 2개 완료 → "2단계 · 이름", 진행 = (1 + 0.5) / 4.
- 화면: 진행 막대 길이가 프로젝트 화면 캐릭터 위치와 같고, 누적 시간이 프로젝트 카드 값과 같다. 진행 중 5개 → 4개 + "외 1개".
- 지원 현황 숫자가 지원 관리 화면과 같고, 2×2 타일 안에서 넘침 없이 말줄임.
- 진행 중 프로젝트가 없으면 빈 상태와 [프로젝트로 가기].

## 이 단계에서 만들거나 고칠 파일
- 새 `features/home/projectRows.ts`
- 새 `pages/home/projects/ProjectProgressCard.tsx`, `ProjectRow.tsx`, `Projects.css`
- `pages/home/ApplicationsSummaryCard.tsx`·`.css`, `pages/home/dashboardCards.tsx` (프로젝트 진행 body)
