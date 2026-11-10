# r2 지금 하는 것·지원 현황 (R35, R42, R23, R27)

읽은 파일: `pages/home/now/NowTimer.tsx`·`NowCard.tsx`·`Now.css`, `pages/home/SummaryStrip.tsx`(FocusItem), `features/today/useNow.ts`·`format.ts`(formatClock)·`store.tsx`(동작 목록)·`reducer.ts`(set-goal), `pages/home/ApplicationsSummaryCard.*`

## A12. 타이머 색·일시정지
- 근거 요구사항: R35, D18
- 예상 결과: 색 = `taskGroupInfo().color`(미분류 `--muted`), 일시정지면 띠·시계 바탕·초 색이 빠짐
- 실제 결과: `color = info ? info.color : "var(--muted)"`를 `--tc`로 넘김. 위 3px 띠(`::before`)·시계 바탕(color-mix 8%)·오늘 집중 숫자는 `.now-timer--run`에서만, 초·막대는 `--now-color`(실행 `--tc`, 일시정지 `--neutral`). 일시정지면 시계·초 `--muted`
- 판정: 통과

## A13. 오늘 집중 = 요약 줄 계산
- 근거 요구사항: R35, R23
- 예상 결과: 같은 함수·같은 값
- 실제 결과: 둘 다 `dayTotal(today, todayKey, now)`와 `settings.dailyGoalMinutes * 60000`. todayKey는 둘 다 `useTodayKey()`에서 옴(NowCard → NowTimer, HomePage → SummaryStrip prop)
- 판정: 통과

## A14. 막대 비율 잘림
- 근거 요구사항: R35, L54
- 예상 결과: 0~100%로 잘림 (NaN·Infinity 아님)
- 실제 결과: `goalMs = Math.max(1, dailyGoalMinutes) * 60000`, `ratio = Math.min(1, total / goalMs)`. 나누는 값이 0이 될 수 없고 위는 1에서 멈춤. total은 0 이상이라 0~100%. 목표는 reducer에서 1~1440으로 잘려 0분은 정상 경로로 생기지 않으며, 0이 와도 1분 기준이라 집중 1분 이상이면 꽉 참
- 판정: 통과 (참고: 0분일 때 1분 미만 집중이면 꽉 차지 않음)

## A15. H:MM:SS, 1초 갱신
- 근거 요구사항: R35, D15
- 예상 결과: 맞음
- 실제 결과: `formatClock`("H:MM") + `formatSeconds`(":SS", 두 자리). `LiveTimes`의 `useNow(!paused)`가 기본 1000ms 간격. 일시정지면 멈춤
- 판정: 통과

## A16. [중단] 툴팁·읽기 이름
- 근거 요구사항: R35, L54
- 실제 결과: `<button … onClick={stop} title="중단" aria-label="중단">` 아이콘만 있음
- 판정: 통과

## A17. 공용 타이머 저장소 사용
- 근거 요구사항: R35, R27
- 실제 결과: `useToday()`의 `pause`·`resume`·`complete`·`stop`을 그대로 연결. `pages/home/now/`에 invoke·storage·save 없음
- 판정: 통과

## A18. 지원 현황 계산 유지·칸 모양
- 근거 요구사항: R42
- 수행 방법: `git diff 23da8fd~1 HEAD -- ApplicationsSummaryCard.css ApplicationsSummaryCard.tsx`, 수정2 전체 diff 파일 목록
- 예상 결과: 계산 변경 없음, `--surface-2` 칸 + 왼쪽 3px 상태색 띠 + 상태색 숫자
- 실제 결과: `features/applications/summary.ts`는 수정2 변경 파일에 없음. tsx는 style을 `{"--tc": item.color}`로 바꾼 것뿐(stages 문자열 그대로). CSS는 `background: var(--surface-2)`, `box-shadow: inset 3px 0 0 var(--tc)`, 숫자 `color: var(--tc)`, 세부 단계 `--muted`
- 판정: 통과

## A19. 시계 글자 크기
- 근거 요구사항: R35, L55
- 예상 결과: 960 폭 창에서 34, 그 외 56 규칙 있음
- 실제 결과: `.now-timer__clock`이 `container-type: inline-size`, 숫자 기본 `--fs-56`, `@container (max-width: 271px)`에서 `--fs-34`. L55 기록상 960 창 카드 안쪽 약 240이라 34가 됨. 실제 화면 폭은 띄우지 않아 확인하지 않음(사용자 테스트)
- 판정: 통과
