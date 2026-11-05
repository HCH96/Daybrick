# 캘린더: 파일 목록·데이터 모양·컴포넌트 구조
전체 구조가 필요할 때만 읽는다. 경로 기준은 [index.md](index.md) 맨 위.

## 1. 파일 목록 (새 파일은 "새")
### 고치는 공용 파일
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `app/types.ts`, `pageLabels.ts`, `pages.ts`, `components/icons/NavIcons.tsx` | 메뉴 id `scheduler` → `calendar`, Calendar/캘린더, 달력 아이콘 (R1) | 1 |
| `pages/home/dashboardCards.tsx` | `linkTo="calendar"` 두 곳 (R7, D6) | 1 |
| `App.tsx` | `CalendarProvider`를 `PlanProvider` 안에 (D7) | 1 |
| 새 `src-tauri/src/calendar.rs`, `src-tauri/src/lib.rs` | `load_calendar`·`save_calendar` (plan.rs와 같은 방식) | 1 |

### 새 데이터·계산 (`features/calendar/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| 새 `types.ts`, `storage.ts`, `reducer.ts`, `store.tsx`, `useAutoSave.ts` | 개인 일정 추가·수정·옮기기·삭제, 자동 저장 | 1 |
| 새 `items.ts` | 태스크·지원 일정·깃발·개인 일정 → `CalItem` 목록 (기간으로 거르기) | 3 |
| 새 `checkpoints.ts` | 주차형 프로젝트 주차 → 일요일 날짜·끝남 여부 (R15–R16, D4) | 3 |
| 새 `badge.ts` | 이니셜 글자·색 번호 (R13, D3) | 3 |
| 새 `monthLayout.ts` | 한 주의 칩 자리(열·폭·줄·끊김)와 +N (D8) | 3 |
| 새 `personalForm.ts` | 편집 입력 검사·날짜 따라오기 (D9) | 5 |
| 새 `review.ts` | 하루 종일 줄, 타임라인 줄(기록·일정 시간순), 그날 완료 태스크 | 7 |

### 새 화면 (`pages/calendar/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| 새 `CalendarPage.tsx`·`.css`, `head/MonthHeader.tsx` | 제목·달 이동·[오늘], 패널·팝업 상태 | 1, 2, 4, 7 |
| 새 `grid/MonthGrid.tsx`, `WeekRow.tsx`, `DayCell.tsx`, `Grid.css` | 7열 주 줄, 칸 모양, 넘김 애니메이션 | 2 |
| 새 `chips/CalChip.tsx`, `TaskChip.tsx`, `AppChip.tsx`, `FlagChip.tsx`, `PersonalChip.tsx`, `Chips.css` | 칩 4종 | 3 |
| 새 `components/icons/CalendarIcons.tsx` | 종류 아이콘 k-*, 깃발 f-todo/f-ok, 시계 | 3 |
| 새 `more/MoreButton.tsx`, `MoreList.tsx` | +N 목록 (Popover 250px) | 4 |
| 새 `personal/QuickInput.tsx`, `RangeInput.tsx`, `PersonalEditPopover.tsx`, `DeleteConfirmRow.tsx`, `Personal.css`, `grid/useRangeSelect.ts` | 입력·기간 입력·편집·삭제 | 5 |
| 새 `drag/useCalendarDrag.ts`, `DragGhost.tsx`, `Drag.css` | 칩 옮기기·튀어오름·흔들림 | 6 |
| 새 `review/ReviewPanel.tsx`, `ReviewTimeline.tsx`, `ReviewDoneList.tsx`, `ReviewAddRow.tsx`, `Review.css` | 회고 패널 | 7 |

### 고치는 플랜 화면
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `pages/plan/calendar/WeekCalendar.tsx`·`.css`, 새 `PersonalLayer.tsx` | 개인 일정 칩·막대, 하루 종일 날 칸 어둡게 | 8 |

## 2. 데이터 모양
```ts
// calendar.json (D7)
interface PersonalEvent {
  id: string; title: string;
  start: string; end: string;      // "YYYY-MM-DD", 하루짜리는 같음
  time: string | null;             // "HH:mm", 하루짜리일 때만 (R26)
  createdAt: string; updatedAt: string;
}
interface CalendarData { version: 1; events: PersonalEvent[] }

// 화면용 (저장하지 않음)
type CalItem =
  | { kind: "task"; key; taskId; title; start; end; color; done: boolean }
  | { kind: "app"; key; applicationId; eventKind; text; initial; badge: number; date; time: string | null }
  | { kind: "flag"; key; projectId; label; color; date; done: boolean }
  | { kind: "personal"; key; eventId; title; start; end; time: string | null };

interface ChipSlot { item: CalItem; col: number; span: number; row: number; cutLeft: boolean; cutRight: boolean }
interface WeekLayout { slots: ChipSlot[]; more: { col: number; count: number; items: CalItem[] }[] }
```

## 3. 컴포넌트 구조
```
CalendarPage
├ MonthHeader              제목 · [<] 2026년 11월 [>] · [오늘]
├ MonthGrid                요일 머리(고정) + 넘김 애니메이션 상자
│ └ WeekRow × 5~6          배경 칸 + 날짜 숫자 + 칩(열·폭·줄 자리)
│   ├ DayCell              오늘/지난/다른 달, 눌림·범위 강조
│   ├ CalChip → Task/App/Flag/PersonalChip
│   ├ MoreButton → MoreList(Popover)
│   └ QuickInput / RangeInput
├ ReviewPanel (380px)      제목·✕ / 하루 종일 / 타임라인 / 완료 태스크 / ReviewAddRow
├ PersonalEditPopover      (플랜 PersonalLayer도 같이 씀)
├ DragGhost
└ TaskDetailModal · ApplicationDetailModal (기존 것 재사용)
```

## 4. C++ 비유
- `CalendarProvider`(store.tsx)는 앱 전체가 공유하는 싱글턴 객체, `reducer.ts`는 상태를 바꾸는 유일한 멤버 함수 모음이다. 화면은 `const&`로 읽고 함수 호출로만 바꾼다.
- `CalItem`은 `std::variant<Task, App, Flag, Personal>`이고, `CalChip`은 `std::visit`처럼 kind로 갈라 그린다.
- `monthLayout.ts`·`items.ts`는 부작용 없는 자유 함수(`static` 순수 함수)라 Node에서 따로 돌려 볼 수 있다.
- Rust `calendar.rs`는 파일 입출력만 맡는 얇은 DLL 함수 두 개다.
