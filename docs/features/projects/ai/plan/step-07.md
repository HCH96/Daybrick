# 프로젝트 7단계: 최근 활동 잔디

- 요구사항: R2 (윗줄 왼쪽 60%), R54–R59
- 목업: `projects.html` projects-top-heat 구역, `part-heat-states.html` heat-by-bubble·heat-by-cell·heat-risk (CSS: projects.css에서 클래스 검색) · 값: [../spec/visual.md](../spec/visual.md) 잔디 표
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D4, D9

## 할 일
- 계산 (R54–R57): `heat.ts` — 이번 주 포함 16주(월요일 위) 칸, 날마다 프로젝트 태스크 시간 합계와 진하기(0 / <60 / <120 / <240 / 240분 이상), 앞으로 올 날 비움. `streak`(오늘 기록이 있으면 오늘까지, 없으면 어제까지), `longestStreak`, `recentDays`(최근 28일 중 작업한 날). `projectId`를 주면 그 프로젝트 시간만. 투데이 스트릭(하루 목표)과는 다른 값이다 (D4).
- 잔디 (R54, R56): `HeatGrid` 칸 16px·간격 4px·모서리 4px, 강조색 28/52/78/100%. 오늘 칸 흰 테두리 2px. 타이머가 프로젝트 태스크로 running이면 2.4초 숨쉬기. 오늘 진하기가 오르면 1.5배 → 0.9 → 1.06 → 1 튀기(약 0.7초).
- 숫자 (R55, R57): `HeatStats` — 모닥불(`fireByStreak`, 1.8초 일렁임) + `연속 작업 N일째 · 최장 N일`, `최근 4주 작업한 날 N / 28일`, `오늘 N시간 M분 ● 진행 중`(실행 중 포함). 오늘 기록이 없고 어제까지 연속이면 불이 1.1초 주기로 약하게 깜빡이고 `오늘 하면 N+1일째`.
- 서로 강조 (R58–R59): `useTopHighlight` — 목록 윗줄이 들고 있는 `{ projectId | null, dayKey | null }`.
  - 버블 원·범례에 마우스 → 잔디를 그 프로젝트 색·시간으로 다시 칠하고, 숫자는 그 프로젝트의 작업한 날·16주 합계·마지막 작업. 다른 원·범례 투명도 0.3, 고른 원 흰 테두리. 떼면 돌아옴.
  - 잔디 칸에 마우스 → `HeatTooltip`(날짜(요일)·합계, 프로젝트별 색 점·이름·시간·비율 막대), 그날 작업한 프로젝트 원의 테두리가 1.4초 주기로 반짝임.
- 6단계 `BubblePanel`·`BubbleLegend`에 마우스 이벤트와 흐림·반짝임 표시를 더한다.

## 확인할 결과
- `npm run build` 성공.
- 16주 × 7일 칸이 보이고, 기록이 있는 날은 시간에 따라 진하기가 다르다. 오늘 칸에 흰 테두리, 이번 주 남은 날은 비어 있다.
- 오늘·어제 기록이 있으면 `연속 작업 2일째`, 오늘 기록이 없고 어제만 있으면 불이 깜빡이며 `오늘 하면 2일째`. 타이머를 시작해 1분이 지나면 `연속 작업 2일째`로 바뀐다.
- 타이머 중 오늘 칸이 숨 쉬고, 오늘 합계가 1시간을 넘는 순간 칸이 튀며 진해진다.
- 버블 원에 마우스를 올리면 잔디가 그 프로젝트 색으로 바뀌고 숫자가 그 프로젝트 값이 된다. 칸에 올리면 말풍선과 원 반짝임.
- Node로 `heat.ts` 예시 실행: 월요일·일요일 경계, 59/60/119/120/239/240분 진하기, 연속 계산.

## 이 단계에서 만들거나 고칠 파일
- 새 `features/projects/heat.ts`
- 새 `pages/projects/top/HeatPanel.tsx`, `HeatGrid.tsx`, `HeatStats.tsx`, `HeatTooltip.tsx`, `Heat.css`, `useTopHighlight.ts`
- `pages/projects/top/BubblePanel.tsx`, `BubbleLegend.tsx`, `Bubble.css`, `ProjectsPage.tsx`
