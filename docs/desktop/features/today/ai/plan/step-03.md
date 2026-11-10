# 투데이 3단계: 타이머 동작·카드 글자

- 요구사항: R11, R16–R23, R26, R40, R41, R46(글자·버튼 숨김만), R48
- 목업: `part-timer.html` timer-running·timer-paused·timer-empty 구역(트랙 자리는 비워 둠), `today.html` today-timer·today-blocked 구역 (CSS: timer.css·today.css에서 클래스 검색)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D2, D3, D5, D8

## 할 일
- 저장소 동작 (R16–R20, R22, D3):
  - reducer: `start`(running 만들고 구간 열기), `pause`(구간 닫기), `resume`(새 구간), `finish`(구간 → records, 0초 구간 버림, running 비움). 시각은 동작에 `now`로 넘긴다.
  - store: `requestStart(taskId)`, `pause()`, `resume()`, `complete()`, `stop()`.
    - 시작하면 플랜 `updateTask(id, { status: "doing" })` (R16).
    - 완료: `finish` + `updateTask(status "done")` — 완료한 날은 플랜 reducer가 맞춘다 (R19, D2).
    - 중단: `finish` + `updateTask(status "todo")` (R20).
  - 한 번에 하나 (R17): running이 있으면 `requestStart`는 무시.
- 시작 흐름 (R26): `startFlow.ts` — `requestStart` → `beforeStart` 단계(지금은 바로 통과하는 빈 함수, 나중에 연동 팝업) → `start`.
- 계산 (R22, R40, R41): `stats.ts`
  - `splitByDay(slices)`: 구간을 자정마다 잘라 날짜별로. records + running 구간(열린 구간은 now까지)을 함께 넣는다.
  - `dayTotal(day)`, `taskTotalOn(taskId, day)`, 이번 세션 흐른 시간 = running 구간 합.
- 글자 (`format.ts`): `formatClock(ms)` → `0:42`, `1:05` (초 없음). `formatDuration(ms)` → 1시간 미만 `N분`, 이상 `N시간 M분`.
- 타이머 카드 (R16, R18, R21, R40, R41, R46):
  - `TimerCard`: 카테고리 색 점·이름·기간(`formatShortRange`) → 제목(한 줄 말줄임) → `ElapsedClock`(56px `--mono`, 콜론만 `dbBlink` 2s, 일시정지면 회색 정지) → 보조 문구 `{누적} 달리는 중` / `{누적} 달리고 쉬는 중` / 1분 미만 `막 출발했어요`.
  - `TimerButtons`: 일시정지↔재개(보라)·완료(초록)·중단(회색), 높이 44.
  - `TimerEmpty`: "돌고 있는 타이머 없음 / 칸반 카드에서 시작하세요 / 오늘 N 달렸어요"(0이면 "오늘 아직 출발 전이에요"), 버튼 대신 안내 한 줄.
  - 오른쪽 트랙 자리(160×130)는 비워 두고 5단계에서 채운다.
  - 시계 갱신: `ElapsedClock`·보조 문구 안에서만 1초 `setInterval`.
- 칸반 (R11, R48):
  - `StartButton`: ▶ 누르면 `requestStart`. 다른 태스크가 돌면 자물쇠로 바뀌고, 누르면 `Popover`로 "다른 태스크 타이머가 돌고 있어요" 말풍선(목업 문구).
  - 실행 중 카드: 보라 테두리 + 아래 보라 점과 `H:MM`.
- 다른 메뉴에서도 흐름 (R23): 상태는 `TodayProvider`에 있으므로 따로 할 일 없음. 확인만.
- 토큰: `styles/theme.css`에 `--mono` (목업 common.css 값).

## 확인할 결과
- `npm run build` 성공.
- 시작 전 카드 ▶ → 카드가 진행 중 열로, 타이머 카드에 카테고리·기간·제목·`0:00`, "막 출발했어요". 1분 뒤 `0:01`·"1분 달리는 중". 콜론만 깜빡인다.
- 다른 카드 ▶는 자물쇠, 누르면 이유 말풍선.
- 일시정지 → 숫자 회색 정지, "재개", "… 달리고 쉬는 중". 2분 쉬고 재개해도 숫자가 쉰 만큼 늘지 않는다.
- 완료 → 완료 열로, 플랜에서도 완료. 중단 → 시작 전 열로. 둘 다 빈 상태 카드 "오늘 N분 달렸어요".
- 다른 메뉴에 2분 있다 돌아와도 시간이 이어진다.
- `today.json` records에 `{ id, taskId, start, end }`가 쌓이고 일시정지 구간은 빠져 있다.
- Node로 `splitByDay` 실행: 11/3 23:50 ~ 11/4 00:20 구간 → 11/3 10분, 11/4 20분. `formatClock`·`formatDuration` 경계(59초, 59분, 60분).

## 이 단계에서 만들거나 고칠 파일
- `features/today/reducer.ts`, `store.tsx`, `format.ts`
- 새 `features/today/startFlow.ts`, `stats.ts`
- 새 `pages/today/timer/TimerCard.tsx`, `TimerEmpty.tsx`, `TimerButtons.tsx`, `ElapsedClock.tsx`, `TimerCard.css`
- 새 `pages/today/kanban/StartButton.tsx`, `kanban/KanbanCard.tsx`, `Kanban.css`
- `pages/today/TodayPage.tsx`, `styles/theme.css`, `components/icons/TodayIcons.tsx`
