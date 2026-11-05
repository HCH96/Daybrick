# 칸반 (req-kanban)

## A6 칸반 대상·열 나누기
- 테스트 내용: 오늘이 기간 안인 태스크만, 날짜 없음·기간 밖 제외, 완료는 언제 끝냈든 표시
- 근거 요구사항: R8, R9
- 수행 방법: pages/today/kanban/Kanban.tsx(`tasksOnDate` 뒤 상태별 필터, 완료 열 `sortByCompleted`), plan/selectors.ts `tasksOnDate`. 스크립트로 오늘 11/3, 태스크 7개 열 나누기
- 예상 결과: 규칙대로
- 실제 결과: 시작 전 [todo], 진행 중 [doing], 완료 [doneOld(10/20에 완료, 기간 11/1~11/4)]. 날짜 없음·끝난 기간(~11/2)·앞으로 기간(11/4~)·기간 밖 완료는 빠짐
- 판정: 통과

## A7 D-N 칩
- 테스트 내용: 11/3~11/5 태스크의 남은 기간 칩
- 근거 요구사항: R10
- 수행 방법: features/today/format.ts `formatDday` 스크립트 실행
- 예상 결과: 11/3 "D-2", 11/5 "오늘 마감", 하루짜리 칩 없음
- 실제 결과: 11/3 `{text:"D-2"}`, 11/5 `{text:"오늘 마감", dueToday:true}`, 하루짜리 null, 날짜 없음 null
- 판정: 통과

## A8 시작 버튼 규칙
- 테스트 내용: 완료 카드 버튼 없음, 다른 타이머 중 자물쇠, 한 번에 하나
- 근거 요구사항: R11, R12, R17
- 수행 방법: KanbanCard.tsx(`!done && !live`일 때만 StartButton, `blockedBy={running ? 제목 : null}`), StartButton.tsx, store.tsx `requestStart`(startingRef·canStart 두 번 확인), reducer `start`. 스크립트로 start 두 번
- 예상 결과: 규칙대로
- 실제 결과: 완료 카드·도는 카드 자신에는 버튼 없음. 다른 타이머(일시정지 포함)가 있으면 자물쇠로 바뀌고 누르면 이유 말풍선만 뜸. reducer는 running이 있으면 두 번째 start를 무시(같은 상태 반환, running t1 유지). requestStart는 시작 흐름 도중 두 번째 요청도 막고 흐름 뒤 다시 확인
- 판정: 통과

## A9 끌기·상세 팝업 상태 변경 시 타이머 처리
- 테스트 내용: 완료로=타이머 완료, 시작 전으로=중단, 태스크 지우기=그때까지 기록 후 끄기, ▶·자물쇠 위 끌기 안 됨, 열 밖에 놓으면 제자리
- 근거 요구사항: R13, D10
- 수행 방법: Kanban.tsx 놓기 처리, useKanbanDrag.ts(`onCardPointerDown`·`onUp`·`findDropStatus`), features/today/useTimerGuard.ts, store.tsx(감시 콜백·finish) 읽기
- 예상 결과: 규칙대로
- 실제 결과:
  - 끌기: 도는 카드를 완료 열로 → `complete()`(기록 + 완료), 시작 전 열로 → `stop()`(기록 + 시작 전). 다른 카드는 `updateTask(status)`만, 진행 중 열로 옮겨도 타이머 시작 안 함
  - 상세 팝업 등 다른 화면: useTimerGuard가 "진행 중이었다가 바뀐 때" 감지해 finish(기록 + running 비움). 상태는 이미 바뀌어 있으므로 기록만 함
  - 지우기: 태스크가 플랜에서 사라지면 즉시 finish → 그때까지 기록하고 끔
  - 누른 대상이 `button` 안이거나 카드 밖(말풍선 포털)이면 끌기를 시작하지 않음
  - 놓은 곳이 열이 아니면(`findDropStatus` null) 또는 같은 열이면 onDrop을 부르지 않아 제자리. Esc·창 blur도 취소
- 판정: 통과 (코드 읽기 판정)
