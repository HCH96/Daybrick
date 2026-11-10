# 투데이 6단계: 오늘 요약

- 요구사항: R27–R31, R33 (R32 삭제)
- 목업: `part-summary.html` summary-focus·-goal·-done·-category·-streak·-timeline·-streak-mid, `today.html` today-summary·today-streak (CSS: today.css·parts.css에서 클래스 검색)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D3, D4

## 할 일
- 계산 (`stats.ts`):
  - `categoryTotals(day, tasks, categories)`: 카테고리별 합, 큰 순. 지운 태스크·미분류는 회색 "미분류".
  - `timelineBars(day, now)`: 08–24시 축 위 left%·width%, 실행 중 구간은 `live`. 08시 전 구간은 08시부터 잘라 그린다.
  - `streak(today, goalMinutes)`: 오늘 ≥ 목표면 오늘부터, 아니면 어제부터 거꾸로 연속 일수.
  - `monthLights(today, goalMinutes)`: 1~말일 `{ day, lit, today, future }`.
- 타일 (R27, R28, R30):
  - `FocusTile`: `3:20 / 6:00` + 보라 막대 + 연필. 연필 → `GoalEditor`(그 자리에서 `[6]시간 [00]분` + 저장·취소, Enter 저장·Esc 취소, 1분~24시간). reducer `set-goal` 추가. 목표를 고치는 곳은 여기뿐 (D4).
  - `DoneTile`: 오늘 칸반의 완료 / 전체 (`2 / 7`).
  - `StreakTile`: `🔥 N일` 숫자만. 마우스를 올린 동안만 아래에 `StreakCalendar`(요일·월 이름 없이 숫자 7개씩, 채운 날 주황 빛, 못 채운 날 꺼짐, 오늘 테두리, 남은 날 흐린 숫자).
- 카테고리별 (R29): `CategoryBars` — 쌓인 가로 막대 + 범례(색 점·이름·시간).
- 타임라인 (R31): `Timeline` — 카테고리 색 막대, 실행 중 구간 빗금, 빨간 지금 선, 아래 시각 눈금.
- 요약 갱신: 실행 중이면 `Timeline`·`FocusTile`만 1분마다 다시 그린다.

## 확인할 결과
- `npm run build` 성공.
- 타이머를 돌린 뒤 요약에 `H:MM / 6:00`과 막대, 완료 `N / M`, 카테고리별 막대·범례가 보이고, 타임라인에 그 시각 막대(실행 중이면 빗금)와 빨간 지금 선이 있다.
- 연필 → 목표를 `0시간 30분`으로 저장하면 집중 타일·트랙 진행률·스트릭이 같이 바뀌고, 다시 켜도 남는다. 취소하면 그대로.
- 스트릭 타일에 마우스를 올린 동안만 달력이 뜨고, 오늘은 테두리, 내일 이후는 흐리다.
- Node로 `streak` 실행: 목표 60분, 11/1 70분·11/2 60분·11/3 30분 → 오늘(11/3) 2일. 11/3이 90분이면 3일. `timelineBars` 07:30–08:30 → 08시부터 30분.

## 이 단계에서 만들거나 고칠 파일
- `features/today/stats.ts`, `reducer.ts`, `store.tsx`
- 새 `pages/today/summary/TodaySummary.tsx`, `FocusTile.tsx`, `GoalEditor.tsx`, `DoneTile.tsx`, `StreakTile.tsx`, `StreakCalendar.tsx`, `CategoryBars.tsx`, `Timeline.tsx`, `Summary.css`
- `pages/today/TodayPage.tsx`, `components/icons/TodayIcons.tsx`
