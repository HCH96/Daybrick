# 투데이 2단계: 이번 주 진행 바·칸반 보기

- 요구사항: R2, R5–R10, R12, R14, R15 (R7은 버튼 숫자만, 팝업은 8단계)
- 목업: `today.html` today-week·today-kanban 구역, `today-idle.html` idle-week·idle-kanban 구역 (CSS: today.css·common.css에서 클래스 검색)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D2

## 할 일
- 공용 함수 (R2, R5): `features/plan/selectors.ts`에 `tasksInRange(data, start, end)` — 기간이 하루라도 겹치는 태스크(날짜 없는 것 제외). 플랜 쪽 기존 함수는 고치지 않는다.
- 이번 주 진행 바 (R5–R7): `WeekProgress` — `startOfWeek(today)`~`+6일`. `이번 주 11/2 – 11/8` + 초록 막대 + `완료 N / M`(여러 날 태스크도 1개, R6). 오른쪽 끝 빨간 `미완료 N` 버튼은 숫자만 계산(끝일 < 오늘, 완료 아님)해 보이고 0이면 숨긴다. 누르는 동작은 8단계.
- 칸반 (R8–R10, R12, R15):
  - `Kanban`: `tasksOnDate(data, today)`를 상태별 세 열로. 열 머리 = `StatusDot` + 이름(시작 전/진행 중/완료) + 개수 칩.
  - 열 안 순서: 플랜 목록 순서(카테고리 순서 → 태스크 배열 순서)를 따른다. 완료 열은 완료한 때 최근 순.
  - `KanbanCard`: 왼쪽 카테고리 색 띠(`--cat`) + 제목 + 색 점·카테고리 이름. 여러 날이면 `D-N` 칩, 끝일이 오늘이면 주황 `오늘 마감` (`format.ts`의 `formatDday`).
  - 완료 카드: 투명 바탕, 제목 흐리게(취소선 없음), `오늘 11:32 완료` / `11/2 완료`. ▶ 없음 (R12).
  - 시작 전·진행 중 카드의 ▶ 자리는 이 단계에서 모양만 두고 누르면 아무것도 하지 않는다 (3단계).
  - `ColumnEmpty`: 점선 상자 + 열마다 한두 줄 문구 (목업 문구 그대로).
- 상세 팝업 (R14): 카드를 누르면 플랜 `TaskDetailModal`, 그 안에서 지원 카드를 누르면 `ApplicationDetailModal` (PlanPage와 같은 방식). 고친 것은 플랜 저장소로 바로 반영 (R2).
- 아이콘: 새 `components/icons/TodayIcons.tsx`에 재생 아이콘부터.

## 확인할 결과
- `npm run build` 성공.
- 플랜에서 오늘이 기간 안인 태스크가 상태별 세 열에 나오고, 날짜 없는 태스크·오늘이 기간 밖인 태스크는 안 보인다.
- 11/3~11/5 태스크는 오늘(11/3) `D-2`, 11/5에는 `오늘 마감`. 하루짜리는 칩 없음.
- 완료 카드는 흐린 제목 + 끝낸 때, ▶ 없음. 빈 열은 점선 문구.
- 카드를 눌러 상세 팝업에서 상태를 바꾸면 칸반 열이 바로 바뀌고, 플랜 화면에서도 같은 상태다.
- 진행 바 `완료 N / M`이 플랜 이번 주 달력에 걸린 태스크 수와 맞는다. 끝일이 지난 미완료 태스크가 있으면 `미완료 N`이 보이고 없으면 숨는다.

## 이 단계에서 만들거나 고칠 파일
- `features/plan/selectors.ts`
- 새 `features/today/format.ts`
- 새 `pages/today/WeekProgress.tsx`, `kanban/Kanban.tsx`, `KanbanColumn.tsx`, `KanbanCard.tsx`, `ColumnEmpty.tsx`, `Kanban.css`
- 새 `components/icons/TodayIcons.tsx`
- `pages/today/TodayPage.tsx`·`.css`
