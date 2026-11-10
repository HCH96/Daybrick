# 프로젝트·단계 규칙 (req-project, A3·A7·A9·A12)

## A3 주차 계산 (11/2 시작 4주)
- 테스트 내용: 주차형 프로젝트(시작 2026-11-02, 4주, 이름 ["", "설계", "", ""])의 주차 범위·이름표·현재 주차
- 근거 요구사항: R11, R17
- 수행 방법: features/projects/weeks.ts `weekRange`·`currentWeekIndex`·`stageLabel`, progress.ts `currentStage`를 실행. store.tsx `buildProject`를 읽음 (시작 주를 `startOfWeek`로 맞춤). `startOfWeek("2026-11-04")`도 실행
- 예상 결과: 월요일 기준 4주차 생성, 이름 없으면 "N주차", 11/4→1주차, 시작 전→1주차, 12/1→마지막 주차
- 실제 결과: 11/4 → 시작 주 2026-11-02(월). 1주차 11/02–11/08, 4주차 11/23–11/29, 첫날 요일은 월요일. 이름표 "1주차"와 "2주차 · 설계". 11/4 → 0(1주차), 10/20 → 0, 12/1 → 3(4주차), 11/9 → 1(2주차). `currentStage`(12/1) = 3
- 판정: 통과

## A7 자동 완료·재진행 규칙
- 테스트 내용: 모든 단계가 끝나면 완료, 태스크를 되돌리거나 새로 넣으면 진행 중, 주차형은 기간과 관계없이 태스크로 판단
- 근거 요구사항: R18, R20
- 수행 방법: progress.ts `isProjectDone`·`activeProjects`, plan/reducer.ts `cycle-status`·`add-task`를 실행
- 예상 결과: 모두 끝나면 완료, 되돌리거나 새 태스크면 진행 중, 주차형은 기간 지나도 미완료면 진행 중
- 실제 결과: 모두 완료 → true. `cycle-status`로 done → todo가 되면 false이고 진행 중 목록 1개. 새 todo 태스크를 넣으면 false. 주차형(2026-01-05 시작, 2주, 1개 미완료) → false이고 진행 중에 남음. 모두 완료하면 true
- 판정: 통과

## A9 삭제 규칙
- 테스트 내용: 프로젝트 삭제 / 단계 편집에서 단계 삭제(다른 단계로 옮기기, 함께 지우기)
- 근거 요구사항: R14, R19
- 수행 방법: reducer.ts `delete-project`, `edit-stages`(`applyStageEdit`)를 실행. 결과를 `groupTasksByCategory`로 확인
- 예상 결과: 태스크가 미분류로 / 대상 단계로 / 함께 지워짐
- 실제 결과: 프로젝트를 지우면 그 단계 태스크 3개(a·b·c)가 stageId·categoryId null이 되고 남는다. 미분류 묶음에 a, c(진행) · b(완료)로 보인다. 다른 프로젝트·카테고리 태스크는 그대로이고, 지운 단계의 stageFold 값도 지워짐. 단계 편집에서 s2→s1로 옮기기를 하면 b가 s1로 가고, s3 함께 지우기를 하면 c가 사라짐
- 판정: 통과

## A12 종류 변경 불가·빠른 입력에 프로젝트 없음 (코드 확인)
- 테스트 내용: 만든 뒤 종류를 바꾸는 동작이 없는지, 플랜 빠른 입력 목록에 프로젝트가 없는지
- 근거 요구사항: R10, R51
- 수행 방법: reducer.ts `ProjectPatch`(name·color만)와 `update-project`·`applyStageEdit`(kind는 그대로 둠)를 읽음. pages/projects/edit/EditStagesDialog.tsx 종류 칸, pages/plan/list/QuickAdd.tsx 목록을 읽음. `kind` 대입을 grep으로 찾음
- 예상 결과: 종류 바꾸는 동작 없음, 빠른 입력 목록에 프로젝트 없음
- 실제 결과: kind를 바꾸는 동작·patch가 없다. 단계 편집 창의 종류 칸은 고정 표시(`proj-kind--fixed`)이고 "만든 뒤에는 종류를 바꿀 수 없어요." 안내가 있다. QuickAdd는 `state.data.categories`만 보여주고 projects는 쓰지 않음
- 판정: 통과
