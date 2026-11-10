# 타이머·기록·트랙 (req-timer)

## A10 splitByDay
- 테스트 내용: 자정을 넘는 구간 나누기, 0초 구간 버림
- 근거 요구사항: R22
- 수행 방법: features/today/stats.ts `splitByDay` 스크립트 실행 (11/3 23:50~11/4 00:20 + 11/3 12:00~12:00)
- 예상 결과: 11/3 10분, 11/4 20분
- 실제 결과: `[["2026-11-03",10],["2026-11-04",20]]`, 0초 구간은 어느 날에도 안 들어감
- 판정: 통과

## A11 formatClock·formatDuration 경계
- 테스트 내용: 59초, 59분, 60분, 정각, 1분 미만 문구
- 근거 요구사항: R40, R41, R46
- 수행 방법: format.ts 두 함수 실행, TimerCard.tsx `TimerSubText`, TimerEmpty.tsx 문구 조건 읽기
- 예상 결과: H:MM 초 없음, 정각 "1시간 0분", 1분 미만 "막 출발했어요", 빈 상태 누적 1분 미만 "오늘 아직 출발 전이에요"
- 실제 결과: formatClock 59초 "0:00", 59분 "0:59", 60분 "1:00", 61분59초 "1:01"(초 없음). formatDuration 59초 "0분", 59분 "59분", 60분 "1시간 0분", 125분 "2시간 5분". 타이머 카드 누적 < 60000ms → "막 출발했어요", 빈 상태 오늘 합 < 60000ms → "오늘 아직 출발 전이에요"
- 판정: 통과

## A12 일시정지
- 테스트 내용: 구간 닫힘, 재개 시 새 구간, 세션 시간에서 쉰 시간 제외
- 근거 요구사항: R18, R40
- 수행 방법: reducer `pause`·`resume`·`finish`, stats `sessionElapsed` 실행 (10:00 시작, 10:10 일시정지, 10:30 재개, 10:45 기준)
- 예상 결과: 쉰 시간 기록 안 됨
- 실제 결과: 일시정지 뒤 구간 1개 닫힘, 재개 뒤 구간 2개, 세션 25분, 완료 기록 [10분, 15분] (쉰 20분 없음)
- 판정: 통과

## A13 완료·중단 처리
- 테스트 내용: 기록, 상태, 완료일 지금, 진행 중→진행 중이면 아무 일 없음
- 근거 요구사항: R19, R20
- 수행 방법: store.tsx `finish("done"|"todo")`, reducer `finish`, plan reducer `update-task`(applyTaskPatch) 실행
- 예상 결과: 규칙대로
- 실제 결과: finish 뒤 running null·구간이 records로 옮겨짐, 0초 구간 버림. 완료 → status done, completedAt = 넘긴 now. 중단 → todo, completedAt null. doing 태스크에 doing 패치 → 같은 객체 그대로(변화 없음), 감시도 상태가 doing으로 남아 끝내지 않음
- 판정: 통과

## A14 복구·마지막 확인 시각
- 테스트 내용: 복구 함수, 창 닫을 때 lastSeenAt 기록, 1분마다 저장, 복구 전에는 확인·감시 안 함
- 근거 요구사항: R24, R25, D9
- 수행 방법: reducer `recover`·`touchRunning` 실행, useAutoSave.ts(onCloseRequested), useHeartbeat.ts, store.tsx(recovered 상태) 읽기
- 예상 결과: 7분 기록, running 비움
- 실제 결과: 구간 시작 10:00·lastSeenAt 10:07 → 기록 [7분], running null. lastSeenAt 뒤에 연 구간은 버림. 창 닫기: `stampOnClose`(=recovered)일 때 touchRunning으로 lastSeenAt을 지금으로 적고 바로 저장. 1분 확인: setInterval 60000ms로 touch → 자동 저장. heartbeat·감시·닫기 기록 모두 `recovered`가 true일 때만 켜짐. 복구는 플랜 읽기가 끝난 뒤 한 번, 태스크가 있고 완료가 아니면 시작 전으로
- 판정: 통과 (함수는 실행, 훅 흐름은 코드 읽기)

## A15 시작 경로 하나
- 테스트 내용: 타이머 시작이 한 곳의 시작 흐름을 거치는가
- 근거 요구사항: R26
- 수행 방법: `grep -rn 'requestStart|runStartFlow|type: "start"'`, startFlow.ts 읽기
- 예상 결과: 시작 경로 하나
- 실제 결과: `type: "start"` dispatch는 store.tsx `requestStart` 안 runStartFlow 콜백 한 곳뿐. requestStart를 부르는 곳은 StartButton 하나. runStartFlow → beforeStart(지금은 true) → start
- 판정: 통과

## A16 트랙 진행률·골인·툴팁
- 테스트 내용: 진행률 = 오늘 전체 기록/목표, 100% 이상 골인, 툴팁 "H:MM / H:MM", 0%면 left 0, 넘으면 깃발 앞, 빈 상태에서 넘었으면 골인 장면 없이 끝에 섬
- 근거 요구사항: R42, R43, R45
- 수행 방법: RunTrack.tsx, TrackScene.tsx(위치 계산) 읽기, dayTotal + formatClock 툴팁 실행
- 예상 결과: 규칙대로
- 실제 결과: ratio = dayTotal(오늘, 지금 세션 포함)/목표, `ratio >= 1`이면 goal(일시정지면 goal-paused). 툴팁 예: 3시간 20분 기록·목표 360분 → "3:20 / 6:00", 넘으면 넘은 합계 그대로 표시. 위치: ratio 0 → charLeft max(0, 0−21) = 0. 골인 → GOAL_LEFT 92(깃발 앞). 빈 상태(running null)는 mode idle이라 골인 장면 없고, ratio를 1로 자른 끝 위치(min(100, 142−21) = 100)에 섬
- 판정: 통과

## A17 애니메이션 줄이기
- 테스트 내용: prefers-reduced-motion에서 반복 움직임 전부 멈춤
- 근거 요구사항: R47
- 수행 방법: track.css·TimerCard.css의 animation·@media grep, pages/today 전체 `infinite` grep
- 예상 결과: 달리기·점프·색종이·z·구름·콜론 깜빡임 모두 포함
- 실제 결과: track.css `@media (prefers-reduced-motion: reduce) { .track-scene * { animation: none !important } }` → 구름·몸 흔들림·달리기 프레임·먼지·숨쉬기·z·점프·그림자·깃발·색종이 모두 track-scene 안이라 멈춤. 2번째 달리기 프레임·먼지·z·색종이는 opacity 0으로 숨김. 콜론 깜빡임은 TimerCard.css 같은 media에서 animation none. pages/today 안 다른 infinite 애니메이션 없음
- 판정: 통과
