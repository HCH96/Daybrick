# 캘린더 4단계: +N 목록·칩 누르기

- 요구사항: R5, R19
- 목업: `part-more.html` (CSS: parts.css에서 more 목록 클래스 검색)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D2

## 할 일
- +N (R5): `MoreButton`은 4번째 줄 자리의 "+N" 글자. 누르면 `MoreList`가 공용 `Popover`(bottom-start, 너비 250px)로 칸 아래에 열린다.
- `MoreList`: 머리에 날짜("11월 5일 (목)"), 그날 전체 항목을 칸과 같은 순서로. 여러 날 태스크·개인 일정은 오른쪽에 기간("11/3–11/6"). 같은 칩 컴포넌트를 목록 너비로 그린다.
- 칩 누르기 (R19): `CalendarPage`가 `openTaskId`·`openApplicationId`를 들고 플랜 `TaskDetailModal`(onOpenApplication 연결)·`ApplicationDetailModal`을 연다. 깃발은 `navigate("projects", projectId)`. 개인 일정은 5단계에서 편집 팝오버로 연결(지금은 아무 동작 없음).
- 목록 안 칩을 누르면 목록을 닫고 같은 동작.

## 확인할 결과
- `npm run build` 성공.
- 일정 5개인 날 "+2"를 누르면 목록이 칸 아래 열리고 5개가 칸과 같은 순서. 3일 태스크에는 기간이 붙는다. 바깥을 누르거나 Esc로 닫힌다.
- 태스크 칩 → 플랜 상세 팝업, 제목을 고치면 칩에 바로 반영. 팝업 안 연결 카드 → 지원 상세 팝업.
- 지원 칩 → 지원 상세 팝업. 깃발 → 그 프로젝트 상세 화면, 앱 뒤로가기로 캘린더에 돌아온다.

## 이 단계에서 만들거나 고칠 파일
- 새 `pages/calendar/more/MoreButton.tsx`, `MoreList.tsx`
- `pages/calendar/CalendarPage.tsx`, `grid/WeekRow.tsx`, `chips/CalChip.tsx`, `Grid.css`
