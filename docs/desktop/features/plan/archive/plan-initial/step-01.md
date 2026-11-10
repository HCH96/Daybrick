# 플랜 1단계: 페이지·주 이동·저장소

- 요구사항: R1–R5
- 목업: `plan.html` plan-head·plan-calbar 구역, 전체 배치는 plan 구역 (CSS: plan.css·common.css에서 클래스 검색)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D1, D4, D6, D10, D11

## 할 일
- 메뉴 (R1, D1, D11):
  - `app/types.ts`의 PageId `calendar`를 `plan`으로 바꾸고, `pageLabels.ts`에 "플랜"/`Plan`.
  - `NavIcons.tsx`의 `CalendarIcon`을 `PlanIcon`으로 바꾼다 (목업 `icons.js`의 `i-plan` 모양). 쓰는 곳은 grep으로 찾는다.
  - `pages.ts`의 placeholder를 `PlanPage`로 바꾼다. `dashboardCards.tsx`의 `linkTo`·`EmptyState linkTo`를 `"plan"`으로 (글자는 그대로).
- 저장소 (R5, D4, D10):
  - Rust `plan.rs`: `load_plan`(없으면 None), `save_plan`(임시 파일 후 바꿔치기). `lib.rs`에 등록.
  - `features/plan/types.ts`·`storage.ts`·`useAutoSave.ts`·`reducer.ts`·`store.tsx`: 지원관리 `storage.ts`·`useAutoSave.ts`·`store.tsx`와 같은 흐름 (loading → ready / failed, 실패하면 저장 안 함). 이 단계 reducer는 `loaded`·`load-failed`만.
  - `App.tsx`: `ApplicationsProvider` 안쪽에 `PlanProvider`.
- 주 계산 (R3, D6): `utils/date.ts`에 `startOfWeek(date)`, `addDays(key|date, n)`, `diffDays(a, b)`. `getWeekDays`와 같은 월요일 기준.
- 화면 (R2–R4):
  - `PlanPage`: 머리 "플랜", 왼쪽 320px 목록 영역(`TaskListPanel` 빈 틀) + 오른쪽 달력 영역(이 단계는 `WeekNav`만).
  - `WeekNav`: 기간 글자(`format.ts`의 `formatWeekPeriod`), `‹ 이전 주` `이번 주` `다음 주 ›`. 주 시작일은 `PlanPage`의 state.
  - 기간 글자: 같은 달 "2026년 11월 2일 – 8일", 달이 다르면 "2026년 11월 30일 – 12월 6일", 해가 다르면 "2026년 12월 28일 – 2027년 1월 3일".
  - 읽기 실패면 목록·달력 자리에 오류 문구 (지원관리 화면의 실패 표시와 같은 방식).

## 확인할 결과
- `npm run build`, `cargo check` 성공.
- 사이드바 Calendar 자리에 `Plan`, 누르면 제목 "플랜", 왼쪽·오른쪽 두 영역.
- 처음 열면 오늘이 든 주 기간이 보이고, 버튼 셋으로 주가 바뀐다. 다른 메뉴에 갔다 오면 이번 주로 돌아온다.
- 홈 "오늘 할 일" 카드의 이동 버튼이 플랜으로 간다.
- Node로 `startOfWeek`·`formatWeekPeriod` 실행: 2026-11-02(월)·11-08(일) → 11-02, 세 가지 기간 글자 모양.

## 이 단계에서 만들거나 고칠 파일
- `apps/desktop/src-tauri/src/plan.rs`(새), `lib.rs`
- `apps/desktop/src/app/types.ts`, `pageLabels.ts`, `pages.ts`, `App.tsx`, `components/icons/NavIcons.tsx`, `pages/home/dashboardCards.tsx`, `utils/date.ts`
- 새 `features/plan/types.ts`, `storage.ts`, `useAutoSave.ts`, `reducer.ts`, `store.tsx`, `format.ts`, `selectors.ts`(빈 틀)
- 새 `pages/plan/PlanPage.tsx`·`PlanPage.css`, `WeekNav.tsx`, `list/TaskListPanel.tsx`
