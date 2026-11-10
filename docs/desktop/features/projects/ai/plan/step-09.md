# 프로젝트 9단계: 투데이 연동

- 요구사항: R53
- 목업: 투데이 목업 그대로 (카테고리 이름·색 자리에 프로젝트 이름·색이 들어갈 뿐)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D2

## 할 일
- 카테고리를 직접 찾던 곳을 8단계 `taskGroupInfo`로 바꾼다. 카드·타이머에 쓰는 이름은 "프로젝트 › 단계"가 아니라 프로젝트 이름(`projectName`), 색은 프로젝트 색.
  - `pages/today/kanban/Kanban.tsx`·`KanbanColumn.tsx`: 카드 색 띠·이름. 열 안 순서는 카테고리 순서 → 프로젝트 순서 → 미분류.
  - `pages/today/TodayPage.tsx`: 타이머 카드 카테고리 줄·트랙 색.
  - `pages/today/overdue/OverduePopup.tsx`: 줄의 색 점·이름.
  - `pages/today/summary/Timeline.tsx`: 막대 색.
- 묶음별 합계: `features/today/stats.ts` `categoryTotals`가 프로젝트 태스크를 프로젝트 하나로 묶어 센다(이름·색은 프로젝트 것). 지운 태스크·미분류 규칙은 그대로.

## 확인할 결과
- `npm run build` 성공.
- 오늘 기간에 걸린 프로젝트 태스크가 칸반에 프로젝트 색 띠·이름으로 보이고, 타이머를 켜면 타이머 카드·트랙이 프로젝트 색이다.
- 오늘 요약의 묶음별 막대에 프로젝트가 한 줄로 나오고, 타임라인 막대가 프로젝트 색이다.
- 끝일이 지난 프로젝트 태스크가 미완료 팝업에 프로젝트 이름으로 보인다.
- 카테고리 태스크는 예전과 똑같이 보인다.

## 이 단계에서 만들거나 고칠 파일
- `pages/today/kanban/Kanban.tsx`, `KanbanColumn.tsx`
- `pages/today/TodayPage.tsx`
- `pages/today/overdue/OverduePopup.tsx`
- `pages/today/summary/Timeline.tsx`
- `features/today/stats.ts`
- `features/projects/group.ts` (필요하면 이름 함수 추가)
