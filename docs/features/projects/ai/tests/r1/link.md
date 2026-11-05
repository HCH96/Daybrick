# 플랜·투데이 연동 (req-link, A10·A13·A14)

## A10 태스크 소속 규칙
- 테스트 내용: 태스크는 카테고리나 단계 하나에만 속하는지, 없는 단계를 가리키는 태스크가 미분류로 보이는지
- 근거 요구사항: R15, R50, R52, D10
- 수행 방법: plan/reducer.ts `update-task`(`normalizeGroupPatch`), plan/selectors.ts `groupTasksByCategory`·`knownStageIds`, projects/group.ts `taskGroupInfo`를 실행
- 예상 결과: 프로젝트 태스크는 카테고리 없음, 카테고리로 옮기면 stageId 해제, 없는 단계는 미분류로 보임(D10)
- 실제 결과: 단계 태스크에 categoryId를 넣으면 stageId null, categoryId "cat". 카테고리 태스크에 stageId를 넣으면 categoryId null. 둘 다 넣으면 단계가 이김. 그룹 결과는 [cat: b], [none: g]다. 있는 단계의 태스크(a)는 카테고리 트리에서 빠지고, 없는 단계를 가리키는 g는 미분류에 들어감. `taskGroupInfo(g)`.kind = "none"
- 판정: 통과

## A13 플랜 트리 순서·단계 기본 펼침 (코드 확인)
- 테스트 내용: 트리 순서, 완료 프로젝트 숨김, 단계 기본 펼침
- 근거 요구사항: R45, R47
- 수행 방법: pages/plan/list/TaskListPanel.tsx 전체, ProjectGroup.tsx의 `currentStage`·`open` 부분, StageGroup.tsx의 `toggleStageFold` 부분을 읽음
- 예상 결과: 카테고리 → 프로젝트(R7 순서) → 미분류, 완료 프로젝트 숨김, 현재 단계만 기본 펼침
- 실제 결과: 그리는 순서는 categories.map → `activeProjects(data)`.map → `UncategorizedGroup`이다. `activeProjects`는 저장 순서를 그대로 쓰고 완료 프로젝트를 걸러낸다. 단계 펼침은 `stageFold[stage.id] ?? index === current`라서, 직접 바꾼 값이 있으면 그 값을 쓰고 없으면 현재 단계만 펼친다. 머리를 누르면 `toggleStageFold`로 저장된다
- 판정: 통과

## A14 투데이 묶음 이름·색 결정 (코드 확인)
- 테스트 내용: 투데이 칸반·타이머·미완료 팝업·오늘 요약이 프로젝트 태스크에 프로젝트 이름·색을 쓰는지
- 근거 요구사항: R53
- 수행 방법: projects/group.ts `taskCardGroup`·`taskGroupInfo`를 실행. pages/today(KanbanColumn·Kanban·OverduePopup·TodayPage·Timeline) 사용처와 today/stats.ts `categoryTotals`를 grep과 읽기로 확인
- 예상 결과: 프로젝트 태스크는 프로젝트 이름·색, 카테고리 태스크는 예전과 같음
- 실제 결과: 프로젝트 태스크는 {name: "Daybrick", color: 프로젝트 색}, 카테고리 태스크는 {name: "공부", color: 카테고리 색}, 미분류와 없는 단계는 null. 칸반 카드·끄는 모습·미완료 팝업·타이머(TodayPage)는 `taskCardGroup`, 타임라인은 `taskGroupInfo().color`를 쓴다. 오늘 요약 막대(`categoryTotals`)는 단계 태스크를 `project:<id>` 묶음으로 프로젝트 이름·색으로 더하고, 카테고리·미분류는 예전 규칙 그대로다
- 판정: 통과
