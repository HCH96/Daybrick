# 프로젝트 6단계: 주간 투입 버블

- 요구사항: R2 (윗줄 오른쪽 40%), R35–R44
- 목업: `projects.html` projects-top-bubble 구역, `part-bubble-empty.html` bubble-empty (CSS: projects.css에서 클래스 검색) · 값: [../spec/visual.md](../spec/visual.md) 버블 표
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D8, D9

## 할 일
- 의존성 (D8): `npm install d3-force d3-ease` + `npm install -D @types/d3-force @types/d3-ease`.
- 윗줄 틀 (R2): 목록 위 262px 줄, 왼쪽 60%는 7단계 잔디 자리(빈 판), 오른쪽 40% `BubblePanel`. 머리 `이번 주 투입` + `11/2–11/8 · 합계`, 오른쪽 `● <이름> 진행 중`(실제 타이머가 running일 때만, 빨간 점 1.4초 깜빡임, R44).
- 크기 계산 (R36–R38): `bubbleScale.ts` — 반지름 = √분 × k, k는 400분 = 50 기준이고 원 넓이 합이 판의 32%를 넘으면 줄인다. 글자 = 반지름/2.6 (12~30). 퍼센트 = 이번 주 전체 대비. 범례는 시간 많은 순. 시간 글자 "N시간 M분"/"N시간"/"M분".
- 시뮬레이션 (R39–R41): `useBubbleSim` — d3 `forceSimulation`, alphaDecay 0, 충돌(반지름+4, 세기 0.7, 반복 2), x 45%·y 50% 끌림 0.003, 매 틱 방향 ±0.125 무작위 + 힘 0.06, 최고 속도 0.9, 감속 0.08, 벽 튕김. 끄는 동안 위치 고정(fx/fy), 놓으면 마지막 움직임 방향으로 속도. 범례 칸과 겹치면 투명도를 0.12씩 0.35까지. 화면이 사라지면 `stop()`.
- 원 (R35, R37, R42): 진행 중 프로젝트 중 이번 주 1분 이상만, 프로젝트 색, 안에 흰 퍼센트. 처음 기록이 생기면 0에서 커지며 나타남. 모두 0분이면 점선 원 + `이번 주 기록 없음` + 안내 한 줄.
- 커질 때 (R43, D9): `useProjectClock`의 분 값이 바뀐 원만 700ms easeBackOut(overshoot 2)로 새 반지름까지 키우고 충돌 반지름도 함께 갱신. 퍼센트·범례 시간도 같이 바뀐다.
- 범례 (R38): `BubbleLegend` 오른쪽 아래(여백 6, 줄 간격 20, 점 4, 이름 12px, 시간 11px 숫자 폭 고정), 배경·테두리 없음. 순서가 바뀌면 600ms easeCubicInOut으로 자리 이동.

## 확인할 결과
- `npm run build` 성공.
- 이번 주 기록이 있는 프로젝트마다 원이 떠다니고 벽·다른 원에 튕긴다. 한곳에 모이지 않는다.
- 원을 끌어 던지면 그 방향으로 날아갔다가 다시 떠다닌다. 범례 위를 지날 때 반투명해 글자가 비친다.
- 투데이에서 타이머를 켜면 `● <이름> 진행 중`이 보이고, 1분마다 그 원이 통통 튀며 커지고 옆 원을 밀어낸다. 퍼센트·범례 시간·순서가 같이 바뀐다. 일시정지하면 표시가 숨는다.
- 이번 주 기록이 없는 프로젝트는 원·범례 모두 없고, 모두 0분이면 빈 상태 안내.
- 다른 메뉴로 갔다 와도 오류나 원이 겹쳐 멈추는 일이 없다.

## 이 단계에서 만들거나 고칠 파일
- `package.json`, `package-lock.json`
- 새 `features/projects/bubbleScale.ts`
- 새 `pages/projects/top/BubblePanel.tsx`, `useBubbleSim.ts`, `BubbleLegend.tsx`, `Bubble.css`
- `pages/projects/ProjectsPage.tsx`·`.css`
