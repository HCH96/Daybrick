# 태스크 목록 (req-task-list)

## A5 묶음 안 정렬
- 테스트 내용: `sortGroupTasks` 실행
- 근거 요구사항: R13
- 수행 방법: Node 실행 — 날짜 없음 2개 + 11/5, 11/3 시작 태스크를 섞어 넣음 (features/plan/selectors.ts)
- 예상 결과: 날짜 없음, 11/3, 11/5 순서
- 실제 결과: `n1, n2, d3, d5` (날짜 없음 둘은 만든 순). 받은 배열은 바뀌지 않음
- 판정: 통과

## A8 상태 순환과 완료일
- 테스트 내용: 상태 순환, 완료일 기록·지우기, 새 태스크 기본 상태
- 근거 요구사항: R18, R19, D13
- 수행 방법:
  - Node 실행: reducer `cycle-status` 3번, `update-task`로 상태 done → doing
  - 코드 읽기: features/plan/store.tsx `add-task` 부분
- 예상 결과: 시작 전→진행 중→완료→시작 전, 완료 시 완료일 기록, 풀면 지움, 새 태스크 시작 전
- 실제 결과:
  - `doing(null) → done(N1) → todo(null)`
  - 팝업 쪽 `update-task`도 done이면 완료일을 적고 doing으로 바꾸면 null
  - store의 새 태스크는 `status: "todo"`
- 판정: 통과

## A17 한글 조합 중 Enter
- 테스트 내용: 조합 중 Enter로 태스크가 두 번 생기지 않게 막는지
- 근거 요구사항: R16, L06
- 수행 방법: `grep isComposing pages/plan`
- 예상 결과: 조합 중 검사 코드가 있음
- 실제 결과: 태스크를 만드는 두 입력 모두 검사함 — list/InlineTaskInput.tsx(`isComposing`이면 return, 묶음 안·달력 바로 만들기 칸이 같이 씀), list/QuickAdd.tsx(`Enter && !isComposing`). 체크리스트 항목(ChecklistItemRow), 카드 고르기(CardPickDialog)도 같은 검사가 있음
- 판정: 통과
