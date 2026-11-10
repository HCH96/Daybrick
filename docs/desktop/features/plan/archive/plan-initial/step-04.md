# 플랜 4단계: 상세 팝업 기본

- 요구사항: R20, R35–R36, R40–R41
- 목업: `popup.html` popup-head·popup-props·popup-memo·popup-foot·popup-bare 구역, `part-confirm.html` confirm-task 구역 (CSS: popup.css·parts.css·common.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D2, D10, D17

## 할 일
- reducer·store: `update-task`(id, patch: 제목·카테고리·상태·기간·메모, `updatedAt` 갱신, 상태가 완료로/완료에서 바뀌면 `completedAt` 처리), `delete-task`.
- `detail/TaskDetailModal`: `Modal` 안. 머리 "태스크" 종류 글자, 휴지통·닫기. 큰 제목(`TitleInput` 재사용), 속성 줄, 메모, 아래 "자동 저장됨"(`SaveStateLabel` 재사용, R41). 태스크가 사라지면 닫는다.
- `detail/PropRows`:
  - 카테고리: `Popover` 목록(색 점 + 이름, 미분류 포함).
  - 상태: 세 가지 중 고르기 (`StatusDot` + 글자).
  - 지원 카드 줄 자리는 9단계에서.
- `detail/PeriodField` (R35, D17): [시작일] ~ [끝일] 버튼 → `Popover` + `MiniCalendar`. 일수 표시("3일"), "날짜 없음으로" 버튼. 날짜 없는 태스크에서 시작일을 고르면 끝일도 같은 날. 시작일을 끝일 뒤로 고르면 끝일 = 시작일, 끝일을 시작일 앞으로 고르면 시작일 = 끝일.
- 메모 (R36): `MarkdownBody` 재사용 (`key`를 태스크 id로).
- 삭제 (R40): `ConfirmDialog` "'STL 복습' 태스크를 지울까요?", "체크리스트·메모도 함께 지워집니다".
- `PlanPage`에 `openTaskId` state. `TaskRow` 클릭 → 팝업 (R20).

## 확인할 결과
- `npm run build` 성공.
- 목록 줄을 누르면 팝업이 열리고, 제목·카테고리·상태를 고치면 뒤의 목록에 바로 반영된다 (카테고리를 바꾸면 다른 묶음으로 옮겨감).
- 기간을 정하면 줄에 "11/3–11/5", "날짜 없음으로"를 누르면 "날짜 없음". 시작일을 끝일 뒤로 고르면 하루짜리가 된다.
- 메모에 `# 제목`, `- 목록`을 쓰면 서식이 바로 바뀌고, 다시 열어도 남아 있다.
- 머리 표시가 "저장 중" → "자동 저장됨"으로 바뀐다. 삭제는 확인 창을 거친다.

## 이 단계에서 만들거나 고칠 파일
- `apps/desktop/src/features/plan/reducer.ts`, `store.tsx`, `format.ts`(일수)
- 새 `pages/plan/detail/TaskDetailModal.tsx`·`TaskDetailModal.css`, `PropRows.tsx`, `PeriodField.tsx`
- `pages/plan/PlanPage.tsx`, `list/TaskRow.tsx`, `list/TaskListPanel.tsx`
