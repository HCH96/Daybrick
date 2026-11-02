# 플랜 수정1: 파일 목록·데이터 모양·컴포넌트 구조
전체 구조가 필요할 때만 읽는다. 경로 기준은 [index.md](index.md) 맨 위. 처음 계획의 전체 파일 목록은 [../../archive/plan-initial/structure.md](../../archive/plan-initial/structure.md).

## 1. 고칠 파일 (새 파일 없음)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `app/pageLabels.ts` | 사이드바·화면 제목 모두 `Plan` (R1) | 1 |
| `utils/date.ts` | `isoWeekNumber(key)` 추가 (D29) | 1 |
| `features/plan/format.ts` | `formatWeekTitle(weekStart)` → `{ title, week }` (`November 2026` / `Oct – Nov 2026` / `Dec 2026 – Jan 2027`, `Week 45`). 쓰지 않게 된 `formatWeekPeriod`는 지운다 | 1 |
| `pages/plan/PlanPage.tsx`·`.css` | 제목 줄 = 제목 + `WeekNav`, 2:5 배치 (D30), 좁은 창 | 1 |
| `pages/plan/WeekNav.tsx` | 기간 글자 + 주 칩, 주 이동 3버튼, 세로 구분선 + `ScheduleSwitch` | 1 |
| `calendar/WeekCalendar.tsx`·`.css`, `ScheduleSwitch.tsx` | 달력 위 줄 없앰. 좁은 창 요일 칸 여백, 알약 시간 숨김 | 1 |
| `list/QuickAdd.tsx`, `list/TaskList.css` | 좁은 창: 카테고리 칩은 색 점만 | 1 |
| `calendar/DayHeader.tsx`, `WeekCalendar.css` | B2 `Mon 2`, 오늘 알약·옅은 보라 칸 | 2 |
| `StatusDot.tsx`·`.css` | 완료 C1 (초록 원 + 가운데 체크 그림) | 2 |
| `list/TaskList.css`, `calendar/WeekCalendar.css`, `detail/Checklist.css` | 취소선 빼기 | 2 |
| `calendar/SchedTooltip.tsx` | 안내 문구 삭제 | 2 |
| `detail/TaskDetailModal.tsx`·`.css` | 지원관리식 틀, `maximized` 상태, Notes 구역, 아래쪽 저장 표시 삭제 | 3 |
| `detail/PropRows.tsx`, `PeriodField.tsx`, `LinkedCardRow.tsx`, `CardPickDialog.css` | 150px 이름 칸, 카테고리 칩, 기간 글자 + 일수, 올렸을 때만 보이는 버튼 | 3 |
| `features/plan/format.ts` | 팝업 기간 글자 `11월 2일 (월)` (`formatChipDay` 재사용 또는 고침) | 3 |
| `detail/Checklist.tsx`, `ChecklistItemRow.tsx`, `Checklist.css` | 체크리스트 속성 줄 + 항목 목록 분리, 들여쓰기, 추가·삭제 자리 | 4 |
| `pages/plan/useReorder.ts` | `follow` 옵션: 잡은 항목 위치(포인터 이동량) 돌려줌 | 4 |
| `list/TaskRow.tsx`, `list/TaskList.css` | 휴지통 버튼 + `ConfirmDialog` (R40 문구) | 5 |
| `drag/usePlanDrag.ts`, `PlanDragProvider.tsx`, `DragGhost.tsx`, `drag.css` | `DropTarget`에 `{ kind: "group"; categoryId: string \| null }`, 기울어진 끄는 모습 | 6 |
| `list/CategoryGroup.tsx`, `GroupHead.tsx`, `list/TaskList.css` | `data-drop-group`, 놓을 묶음 테두리 + "여기로 옮기기" 알약 | 6 |

다시 쓰는 것: `components/common/Modal`(`maximized`), `ConfirmDialog`, `components/icons/DialogIcons`(`MaximizeIcon`·`RestoreIcon`·`TrashIcon`), `pages/applications/detail/` `MarkdownBody`·`TitleInput`·`SaveStateLabel`, store `updateTask`·`deleteTask`.

## 2. 데이터 모양
저장 모양은 바뀌지 않는다 (`plan.json` version 1, `memo` 그대로, D32). 화면용 모양만 더한다.
```ts
// format.ts
interface WeekTitle { title: string; week: string }   // "November 2026", "Week 45"
// usePlanDrag.ts
type DropTarget = { kind: "day"; day: string } | { kind: "list" } | { kind: "group"; categoryId: string | null };
// useReorder.ts (follow 옵션일 때 더함)
interface Reorder { /* 기존 */ dragOffset: { x: number; y: number } | null }
```

## 3. 컴포넌트 구조 (바뀌는 곳)
```
PlanPage
├ header: 제목 Plan · WeekNav(기간 + Week 칩 · ‹ 이번 주 › · | · ScheduleSwitch)
├ PlanDragProvider (놓을 곳: day · list · group)
│ ├ TaskListPanel ─ CategoryGroup(data-drop-group) ─ TaskRow(+ 휴지통 → ConfirmDialog)
│ └ WeekCalendar ─ DayHeader(B2) · SchedLayer · BarLayer
└ TaskDetailModal (maximized)
    ├ 머리: [최대화] | Task ……… SaveStateLabel · 삭제 · 닫기
    ├ TitleInput · PropRows(카테고리·상태·기간·지원 카드·체크리스트 줄)
    ├ Checklist 항목 (값 칸에 맞춰 들여 씀)
    └ 구분선 Notes · MarkdownBody(memo)
```

## 4. C++ 비유
- 머리 줄 옮기기는 같은 위젯 객체(`WeekNav`)를 다른 부모 레이아웃에 다시 붙이는 일이다. 객체 안의 동작은 그대로다.
- `DropTarget`에 `group`을 더하는 것은 `std::variant`에 타입 하나를 추가하는 것과 같다. `switch`가 처리하지 않는 경우를 TypeScript가 알려 준다.
- `useReorder`의 `follow` 옵션은 기본값이 있는 함수 인자다. 기존 호출부(카테고리)는 고치지 않아도 예전처럼 움직인다.
