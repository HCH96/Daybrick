# 메인 페이지 수정1 4단계: 지금 하는 것

- 요구사항: R35–R37
- 목업: `part-now.html` now-running·now-paused·now-tasks·now-empty 구역, `dash.html` dash-now 구역 (CSS: dash.css·common.css에서 `.now-`, `.pill`, `.clock` 검색)
- 경로 기준: [index.md](index.md) 맨 위

## 할 일
- 새 `features/today/kanbanOrder.ts`: `pages/today/kanban/Kanban.tsx` 안의 `sortLikePlanList`를 그대로 옮겨 export하고, `Kanban.tsx`는 import해서 쓴다 (D11, 동작 그대로).
- `now/NowCard.tsx`: `useToday().state`의 실행 중 타이머가 있으면 `NowTimer`, 없으면 `NowTaskList`.
- `NowTimer` (R35): 태스크 제목, 카테고리·프로젝트 색 점(`taskGroupInfo`), 이번 세션 경과(`sessionElapsed` + `useNow`, `formatClock`, 고정폭 큰 숫자), 상태 알약(진행 중 초록, 일시정지 주황).
  - 버튼 [일시정지/재개]·[완료]·[중단] = `pause`·`resume`·`complete`·`stop`. 실행 중엔 [완료], 일시정지엔 [재개]를 강조. 트랙 그림 없음.
- `NowTaskList` (R36–R37): `tasksOnDate(plan, todayKey)`에서 미완료만 → 칸반 순서(진행 중 → 시작 전, `sortLikePlanList`) → 최대 3개.
  - 줄마다 상태 + [▶ 시작](`requestStart`, 시작 흐름 거침). 첫 줄만 강조.
  - 3개를 넘으면 "외 N개 · 투데이에서 보기" (누르면 투데이).
  - 0개면 CardState empty("오늘 할 태스크가 없어요" + [투데이로 가기]).

## 확인할 결과
- `npm run build` 성공.
- 투데이 칸반의 카드 순서가 바뀌기 전과 같다 (진행 중·시작 전 열, 같은 데이터로 비교).
- 오늘 태스크 5개(진행 중 1, 시작 전 3, 완료 1) → 진행 중 1 + 시작 전 2, "외 1개 · 투데이에서 보기".
- [▶ 시작] → 카드가 실행 중으로 바뀌고 경과가 1초마다 오른다. 투데이 화면 타이머와 같은 태스크·시간.
- [일시정지] → 주황 알약, [재개] 강조. [완료] → 투데이에 기록이 남고 태스크 완료, 카드는 목록으로. [중단] → 기록 남고 시작 전.
- 오늘 태스크가 없으면 빈 상태와 [투데이로 가기].

## 이 단계에서 만들거나 고칠 파일
- 새 `features/today/kanbanOrder.ts`, `pages/today/kanban/Kanban.tsx`
- 새 `pages/home/now/NowCard.tsx`, `NowTimer.tsx`, `NowTaskList.tsx`, `Now.css`
- `pages/home/dashboardCards.tsx` (지금 하는 것 body)
