# 플랜: 파일 목록·데이터 모양·컴포넌트 구조
전체 구조가 필요할 때만 읽는다. 경로 기준은 [index.md](index.md) 맨 위.

## 1. 파일 목록 (새 파일은 "새")
### Rust (`apps/desktop/src-tauri/src/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| 새 `plan.rs` | `plan.json` 읽기·쓰기 (`notifications.rs`와 같은 방식, 임시 파일 후 바꿔치기) | 1 |
| `lib.rs` | `plan::load_plan`, `plan::save_plan` 등록 | 1 |

### 공용 데이터 (`features/plan/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| 새 `types.ts` | 2절 모양 | 1 |
| 새 `storage.ts` | `loadPlanData`·`savePlanData`, 빈 데이터, 버전 확인 (깨진 파일이면 저장 막기) | 1 |
| 새 `reducer.ts` | 카테고리·태스크·체크리스트·화면 설정 동작, `createTask` | 1–9 |
| 새 `store.tsx` | `PlanProvider`·`usePlan` (상태, 저장 표시, 동작 함수) | 1–9 |
| 새 `useAutoSave.ts` | 0.5초 뒤 저장, 창 닫을 때 바로 저장 | 1 |
| 새 `format.ts` | 주 기간 글자 "2026년 11월 2일 – 8일", 짧은 기간 "11/3–11/5", 일수 | 1, 3 |
| 새 `selectors.ts` | `groupTasksByCategory`, `tasksOnDate`, `sortGroupTasks`, `countOpen` (다른 기능이 쓰는 공용 함수) | 1, 3 |
| 새 `color.ts` | hex ↔ hsv 바꾸기, hex 확인 | 2 |
| 새 `weekLayout.ts` | `layoutWeekBars(tasks, weekStart)` → 칸·길이·줄·잘림 | 5 |
| 새 `dragMath.ts` | `placeOnDay`, `moveBy`, `resizeStart`, `resizeEnd` | 6 |
| 새 `applicationEvents.ts` | 지원 일정 → 알약 목록 (종류·회사·시간) | 7 |
| 새 `useLinkCleanup.ts` | 없어진 지원 카드 연결 지우기 (D14) | 9 |

### 화면 (`pages/plan/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| 새 `PlanPage.tsx`·`.css` | 머리, 왼쪽·오른쪽 두 영역, 팝업 상태 | 1, 4, 7 |
| 새 `WeekNav.tsx` | 기간 글자, 이전·이번·다음 주, 스위치 자리 | 1, 7 |
| 새 `StatusDot.tsx` | 상태 표시 ○◐● (목록·막대·팝업 공용) | 3 |
| 새 `useReorder.ts` | 세로 목록 끌어 순서 바꾸기 (카테고리·체크리스트) | 2 |
| 새 `list/TaskListPanel.tsx`·`TaskList.css` | 왼쪽 영역 전체 | 1–3 |
| 새 `list/CategoryGroup.tsx`, `GroupHead.tsx`, `CategoryMenu.tsx` | 묶음, 머리(색·이름·수·`…`·`+`), `…` 메뉴 | 2, 3 |
| 새 `list/CategoryForm.tsx`, `ColorPicker.tsx`·`.css` | 카테고리 만들기·고치기, 색 선택기 | 2 |
| 새 `list/TaskRow.tsx`, `DoneFold.tsx`, `QuickAdd.tsx`, `InlineTaskInput.tsx`, `ListEmpty.tsx` | 태스크 줄, 완료 접힘, 빠른 입력, 바로 적기, 빈 목록 | 3 |
| 새 `detail/TaskDetailModal.tsx`·`.css`, `PropRows.tsx`, `PeriodField.tsx` | 상세 팝업, 카테고리·상태 고르기, 기간 | 4 |
| 새 `detail/Checklist.tsx`, `ChecklistItemRow.tsx` | 체크리스트 | 8 |
| 새 `detail/LinkedCardRow.tsx`, `CardPickDialog.tsx`·`.css` | 지원 카드 연결 줄, 고르기 창 | 9 |
| 새 `calendar/WeekCalendar.tsx`·`.css`, `DayHeader.tsx`, `BarLayer.tsx`, `TaskBar.tsx`, `WeekEmptyHint.tsx` | 주간 달력 | 5 |
| 새 `calendar/SchedLayer.tsx`, `SchedPill.tsx`, `SchedTooltip.tsx`, `ScheduleSwitch.tsx` | 지원 일정 | 7 |
| 새 `drag/PlanDragProvider.tsx`, `usePlanDrag.ts`, `DragGhost.tsx`, `drag.css` | 끌기 상태·놓을 곳 찾기·끄는 모습 | 6 |

### 고칠 파일
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `app/types.ts`, `app/pageLabels.ts`, `app/pages.ts` | `calendar` → `plan`, "플랜"/`Plan`, `PlanPage` 연결 | 1 |
| `components/icons/NavIcons.tsx` | `CalendarIcon` 자리에 `PlanIcon` (목업 `i-plan`) | 1 |
| `App.tsx` | `ApplicationsProvider` 안쪽에 `PlanProvider` | 1 |
| `pages/home/dashboardCards.tsx` | `linkTo: "plan"` | 1 |
| `utils/date.ts` | `startOfWeek`, `addDays`, `diffDays` (월요일 시작, D6) | 1 |
| `features/applications/calendarEntries.ts` | `CalendarEntry`에 `kind: EventKind` 추가 (기존 화면은 그대로) | 7 |
| 새 `components/icons/PlanIcons.tsx` | 깃발·문서·코드·사람·더하기 등 목업 아이콘 | 3, 7 |

다시 쓰는 것: `components/common/` `Modal`·`Popover`·`ConfirmDialog`·`MiniCalendar`, `pages/applications/detail/` `MarkdownBody`·`TitleInput`·`SaveStateLabel`·`ApplicationDetailModal`, `features/applications/schedule.ts` `isActive`·`sortByNextDate`.

## 2. 데이터 모양 (`plan.json`)
```ts
interface PlanData { version: 1; categories: Category[]; tasks: Task[]; view: PlanView }
interface Category { id: string; name: string; color: string }        // "#RRGGBB", 순서 = 배열 순서 (D15)
type TaskStatus = "todo" | "doing" | "done";
interface Task {
  id: string;                      // crypto.randomUUID()
  title: string;
  categoryId: string | null;       // null = 미분류
  status: TaskStatus;
  start: string | null;            // "YYYY-MM-DD", start·end는 둘 다 있거나 둘 다 null
  end: string | null;
  memo: string;                    // 마크다운
  checklist: ChecklistItem[] | null; // null = 체크리스트 없음 (R37)
  applicationId: string | null;
  createdAt: string; updatedAt: string; completedAt: string | null; // ISO 시각
}
interface ChecklistItem { id: string; text: string; checked: boolean }
interface PlanView {
  collapsed: string[];             // 접힌 카테고리 id, 미분류는 "none"
  showApplicationEvents: boolean;  // 기본 true
  recentColors: string[];          // 최근 쓴 색, 최대 8개
}
```
막대 배치 결과(저장 안 함): `{ taskId, col: 0–6, span, lane, cutLeft, cutRight }`.

## 3. 컴포넌트 구조
```
App → ApplicationsProvider → PlanProvider (+ useLinkCleanup)
PlanPage
├ PlanDragProvider (목록·달력을 함께 감쌈) + DragGhost
│ ├ TaskListPanel ─ QuickAdd · ListEmpty
│ │   · CategoryGroup[ GroupHead(CategoryMenu) · InlineTaskInput · TaskRow(StatusDot) · DoneFold ]
│ │   · [+ 카테고리 추가] → CategoryForm(ColorPicker)
│ └ WeekCalendar ─ WeekNav(ScheduleSwitch) · DayHeader · SchedLayer(SchedPill, SchedTooltip)
│     · BarLayer(TaskBar) · InlineTaskInput(더블클릭) · WeekEmptyHint
├ TaskDetailModal ─ TitleInput · PropRows · PeriodField · LinkedCardRow(CardPickDialog) · Checklist · MarkdownBody
└ ApplicationDetailModal (지원 일정·연결 카드를 눌렀을 때, D16)
```

## 4. C++ 비유
- `PlanProvider`는 프로그램 전체가 공유하는 싱글턴 저장소 객체, `reducer`는 그 객체의 상태를 바꾸는 유일한 멤버 함수(`apply(Action)`)다. 화면은 저장소를 직접 고치지 않고 동작(명령 객체)만 보낸다.
- `selectors.ts`·`weekLayout.ts`·`dragMath.ts`는 상태를 받아 결과만 돌려주는 순수 함수(`const` 자유 함수)라 따로 실행해 확인할 수 있다.
- `useAutoSave`는 바뀐 내용을 모아 두었다가 0.5초 조용하면 디스크에 쓰는 지연 쓰기 버퍼다.
- `PlanDragProvider`는 마우스 캡처를 잡은 동안의 상태 기계(대기 → 누름 → 끄는 중 → 놓음)다.
