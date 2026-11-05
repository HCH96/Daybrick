# 캘린더 1단계: 메뉴 교체·개인 일정 저장소

- 요구사항: R1, R7, R21–R22, R25–R26 (데이터만)
- 목업: `calendar.html` 사이드바 (Calendar 메뉴, 아이콘 `i-cal`) (CSS: common.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D1, D6, D7

## 할 일
- 메뉴 (R1, D1): `PageId`의 `scheduler`를 `calendar`로 바꾼다. `PAGE_LABELS.calendar = "캘린더"`, `NAV_LABELS.calendar = "Calendar"`. `SchedulerIcon`을 목업 `i-cal` 모양의 달력 아이콘으로 바꾼다(이름이 겹치면 `CalendarNavIcon`). 자리는 Projects 다음 그대로.
- 홈 (R7, D6): `dashboardCards.tsx`의 `linkTo="scheduler"` 두 곳을 `"calendar"`로. 문구는 그대로 둔다.
- 저장 (D7): Rust `calendar.rs`(`load_calendar`·`save_calendar`, plan.rs 복사 방식), `lib.rs`에 등록.
- 데이터 (R21, R25–R26): `features/calendar/types.ts`(structure.md 2절), `storage.ts`(없으면 빈 데이터, 깨졌거나 모르는 버전이면 예외 + 저장 막기, Tauri 밖에서는 저장 안 함), `useAutoSave.ts`.
- 저장소: `reducer.ts`·`store.tsx` — `addEvent(title, start, end, time?)`(제목 공백이면 null, 기간 일정이면 time을 null로), `updateEvent(id, patch)`, `moveEvent(id, days)`, `deleteEvent(id)`. 상태는 loading / ready / error.
- `App.tsx`: `<CalendarProvider>`를 `PlanProvider` 안, `TodayProvider` 바깥에.
- 화면: 새 `CalendarPage`는 제목 "캘린더"와 로딩·오류 안내만. `pages.ts`의 placeholder를 이 화면으로 바꾼다.

## 확인할 결과
- `npm run build`, `cargo check` 성공.
- 사이드바 Projects 아래에 `Calendar`(달력 아이콘)가 있고, 누르면 "캘린더" 제목.
- 홈 "오늘 일정" 카드 버튼이 "캘린더로 가기"이고 누르면 캘린더로 간다.
- 개발자 도구에서 `addEvent`를 한 번 부르면 앱 데이터 폴더에 calendar.json이 생기고, 앱을 다시 켜도 남는다.
- 코드에 `scheduler`가 남아 있지 않다(grep).

## 이 단계에서 만들거나 고칠 파일
- `app/types.ts`, `app/pageLabels.ts`, `app/pages.ts`, `components/icons/NavIcons.tsx`, `pages/home/dashboardCards.tsx`, `App.tsx`
- 새 `features/calendar/types.ts`, `storage.ts`, `reducer.ts`, `store.tsx`, `useAutoSave.ts`
- 새 `pages/calendar/CalendarPage.tsx`·`.css`
- 새 `src-tauri/src/calendar.rs`, `src-tauri/src/lib.rs`
