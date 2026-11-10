# 투데이 5단계: 달리기 트랙·애니메이션

- 요구사항: R42–R47 (R46 트랙 부분)
- 목업: `part-timer.html` timer-running·timer-paused·timer-empty, `part-timer-goal.html` timer-goal·timer-goal-paused, `today-idle.html` idle-timer (CSS: timer.css, 캐릭터: sprites.js)
- 모양 값: [../spec/timer-visual.md](../spec/timer-visual.md)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D4, D5, D6, D7

## 할 일
- 캐릭터 (timer-visual.md): `sprites.ts`에 목업 sprites.js의 run1·run2·sit·cheer·stand 좌표를 `{x,y,w,h,fill}` 배열로 옮긴다(상의는 `fill: "var(--c)"`). `Sprite.tsx`는 `viewBox="0 0 14 16"` SVG + `shape-rendering: crispEdges`, 42×48.
- 트랙 (R42, R43): `RunTrack` 160×130
  - 진행률 = 오늘 전체 기록(`dayTotal`, 지금 세션 포함) / 목표(`settings.dailyGoalMinutes`).
  - 바닥선 y=113.5, 0~142, 지나온 길 `--c` 실선, 남은 길 `--border-2` 점선(4 4), 눈금 9개, 끝 깃발, 구름 2개.
  - 캐릭터 left = 진행률×142 − 21 (0~100으로 자름), 골인이면 92.
  - 툴팁: 마우스 올림·포커스(`tabIndex=0`) 때만 `3:20 / 6:00` (`--text` 배경, `--mono` 12px). 넘으면 `6:10 / 6:00` 그대로.
- 장면 (`TrackScene`, R44–R46):
  | 상태 | 캐릭터 | 움직임 |
  |---|---|---|
  | 달리는 중 | run1·run2 | dbRunA·dbRunB·dbBob·dbDust·dbCloud |
  | 일시정지 | sit | dbBreath, z z Z(dbZ), 구름 멈춤, 길 60% |
  | 골인 (진행률 ≥ 100%) | cheer | dbJump·dbShadow, 깃발 dbWave, 색종이 8개 dbConf, 트랙·눈금·깃발 `--c`, 꼭지 금색 |
  | 골인 + 일시정지 | 깃발 앞 sit | 일시정지와 같음, 깃발 멈춤, 색종이 없음 |
  | 빈 상태 | stand | 움직임 없음, 길 60%, `--c` = `--accent` (D7) |
  - 달리는 중에 100%를 넘으면 다시 그릴 때 바로 골인 장면 (R45, 하루 종일 반복 D6).
  - keyframes·크기는 목업 timer.css를 `track.css`로 옮긴다 (색은 앱 토큰, D5).
- 애니메이션 줄이기 (R47): `@media (prefers-reduced-motion: reduce)`로 반복 움직임(달리기·점프·색종이·z·구름·콜론 깜빡임) 끄고 상태별 자세만. 목업의 `.reduce-motion` 클래스는 옮기지 않는다.
- `TimerCard`·`TimerEmpty`에 `RunTrack`을 붙이고 `--c`를 카테고리 색으로 넘긴다.

## 확인할 결과
- `npm run build` 성공.
- 타이머를 돌리면 오른쪽 트랙에서 캐릭터가 오늘 진행률 위치에서 달리고, 상의·지나온 길이 카테고리 색이다. 숫자는 안 보이고 마우스를 올리거나 Tab으로 포커스하면 `H:MM / H:MM` 툴팁.
- 일시정지 → 앉아서 졸고 z z Z, 구름 멈춤, 길 흐려짐.
- `today.json` 목표를 짧게(예: 1분) 바꾸고 다시 열어(6단계 전) 타이머를 돌리면 골인 장면: 깃발·트랙이 카테고리 색, 점프·색종이가 계속 반복. 골인 중 일시정지하면 깃발 앞에서 졸고 색종이 없음.
- 타이머가 없으면 캐릭터가 보라색으로 오늘 진행 위치에 서 있다.
- Windows 설정 → 접근성 → 시각 효과 → 애니메이션 효과 끄기 → 모든 장면이 멈춘 자세만 보인다.

## 이 단계에서 만들거나 고칠 파일
- 새 `pages/today/timer/RunTrack.tsx`, `TrackScene.tsx`, `Sprite.tsx`, `sprites.ts`, `track.css`
- `pages/today/timer/TimerCard.tsx`, `TimerEmpty.tsx`, `TimerCard.css`
