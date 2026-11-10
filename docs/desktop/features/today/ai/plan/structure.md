# 투데이: 파일 목록·데이터 모양·컴포넌트 구조
전체 구조가 필요할 때만 읽는다. 경로 기준은 [index.md](index.md) 맨 위.

## 1. 파일 목록 (새 파일은 "새")
### Rust (`apps/desktop/src-tauri/src/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| 새 `today.rs` | `today.json` 읽기·쓰기 (`plan.rs`와 같은 방식, 임시 파일 후 바꿔치기) | 1 |
| `lib.rs` | `today::load_today`, `today::save_today` 등록 | 1 |

### 공용 데이터 (`features/today/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| 새 `types.ts` | 2절 모양 | 1 |
| 새 `storage.ts` | `loadTodayData`·`saveTodayData`, 빈 데이터, 버전 확인 (깨진 파일이면 저장 막기) | 1 |
| 새 `reducer.ts` | 시작·일시정지·재개·끝내기(완료/중단), 1분 확인, 목표 고치기, 복구 | 1, 3, 4, 6 |
| 새 `store.tsx` | `TodayProvider`·`useToday` (공용 타이머 저장소, 플랜 `updateTask` 호출) | 1, 3, 4 |
| 새 `useAutoSave.ts` | 0.5초 뒤 저장, 창 닫을 때 바로 저장 (플랜 것과 같은 흐름) | 1 |
| 새 `useTodayKey.ts` | 오늘 "YYYY-MM-DD", 자정·창 포커스 때 다시 계산 (R4) | 1 |
| 새 `startFlow.ts` | `requestStart(taskId)` → (빈 단계: 나중 연동 팝업) → `start` (R26) | 3 |
| 새 `stats.ts` | `splitByDay`, `dayTotal`, `taskTotalOn`, `categoryTotals`, `timelineBars`, `streak`, `monthLights` | 3, 6 |
| 새 `format.ts` | `formatClock`(H:MM), `formatDuration`("N시간 M분"), `formatDday`, `formatOverdueDays` | 2, 3, 8 |
| 새 `useHeartbeat.ts` | 실행 중이면 1분마다 `lastSeenAt` 저장, 창 닫을 때 지금으로 적기 (R25, D9) | 4 |
| 새 `useTimerGuard.ts` | 실행 중 태스크의 상태 변경·삭제 감시 (D10) | 4 |
| 새 `overdue.ts` | `listOverdue`(많이 지난 순), `bringToToday`, `postponeTo` | 8 |
| `features/plan/selectors.ts` | `tasksInRange(data, start, end)` 추가 (공용) | 2 |

### 화면 (`pages/today/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| 새 `TodayPage.tsx`·`.css` | 머리(투데이·날짜), 진행 바, 칸반 60 : 오른쪽 40, 팝업 상태 | 1, 2, 8 |
| 새 `WeekProgress.tsx` | `이번 주 11/2 – 11/8` 막대·`완료 N / M`·`미완료 N` | 2, 8 |
| 새 `kanban/Kanban.tsx`, `KanbanColumn.tsx`, `KanbanCard.tsx`, `ColumnEmpty.tsx`, `Kanban.css` | 세 열·카드·빈 열 | 2, 3 |
| 새 `kanban/StartButton.tsx` | ▶ / 자물쇠 + 이유 말풍선 (R11) | 3 |
| 새 `kanban/useKanbanDrag.ts`, `DragCardGhost.tsx` | 끌기 상태 기계, 놓을 열, 안내 말풍선 (R13) | 7 |
| 새 `timer/TimerCard.tsx`, `TimerEmpty.tsx`, `TimerButtons.tsx`, `ElapsedClock.tsx`, `TimerCard.css` | 타이머 카드 (R16–R21, R40–R41, R46) | 3 |
| 새 `timer/RunTrack.tsx`, `TrackScene.tsx`, `Sprite.tsx`, `sprites.ts`, `track.css` | 트랙·캐릭터·장면 (R42–R47) | 5 |
| 새 `summary/TodaySummary.tsx`, `FocusTile.tsx`, `GoalEditor.tsx`, `DoneTile.tsx`, `StreakTile.tsx`, `StreakCalendar.tsx`, `CategoryBars.tsx`, `Timeline.tsx`, `Summary.css` | 오늘 요약 (R27–R31) | 6 |
| 새 `overdue/OverduePopup.tsx`, `OverdueRow.tsx`, `PostponePicker.tsx`, `Overdue.css` | 미완료 팝업 (R34–R39) | 8 |

### 고칠 파일
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `app/types.ts`, `app/pageLabels.ts`, `app/pages.ts` | `timer` → `today`, "투데이"/`Today`, `TodayPage` 연결 | 1 |
| `components/icons/NavIcons.tsx` | `TimerIcon` 자리에 `TodayIcon` (목업 icons.js 모양) | 1 |
| `pages/home/dashboardCards.tsx` | `linkTo: "today"` (글자는 그대로) | 1 |
| `App.tsx` | `PlanProvider` 안쪽에 `TodayProvider` | 1 |
| `styles/theme.css` | `--mono` 토큰 추가 (목업 common.css 값) | 3 |
| 새 `components/icons/TodayIcons.tsx` | 재생·자물쇠·연필·불꽃·달력 등 목업 아이콘 | 2, 3, 6, 8 |

다시 쓰는 것: `features/plan/store` `usePlan`(`updateTask` — 상태를 바꾸면 완료한 날을 맞춤), `selectors` `tasksOnDate`, `utils/date` `startOfWeek`·`addDays`·`diffDays`·`toDateKey`, `pages/plan/StatusDot`, `pages/plan/detail/TaskDetailModal`, `pages/applications/detail/ApplicationDetailModal`, `components/common/` `Modal`·`Popover`·`MiniCalendar`.

## 2. 데이터 모양 (`today.json`)
```ts
interface TodayData { version: 1; records: TimeRecord[]; running: RunningTimer | null; settings: TodaySettings }
interface TimeRecord { id: string; taskId: string; start: string; end: string }   // id = crypto.randomUUID(), ISO 시각
interface RunningTimer {
  taskId: string;
  state: "running" | "paused";
  segments: { start: string; end: string | null }[];  // 마지막 구간만 end가 null일 수 있음 (running일 때)
  lastSeenAt: string;                                  // R25, 1분마다·창 닫을 때
}
interface TodaySettings { dailyGoalMinutes: number }  // 기본 360 (D4), 1~1440
```
- 완료·중단: `segments`(0초 구간 제외)를 `records`로 옮기고 `running = null`.
- 복구(D9): 시작할 때 `running`이 남아 있으면 열린 구간을 `lastSeenAt`에서 닫고 중단 처리.
- 계산 결과(저장 안 함): `DaySlice { taskId; start; end }`(날짜별로 자른 구간), `TimelineBar { left%, width%, color, live }`, `MonthLight { day, lit, today, future }`.

## 3. 컴포넌트 구조
```
App → ApplicationsProvider → PlanProvider → TodayProvider (+ useHeartbeat, useTimerGuard, 시작 때 복구)
TodayPage
├ 머리: 투데이 · 날짜
├ WeekProgress ─ 막대 · 완료 N / M · [미완료 N]
├ Kanban (useKanbanDrag + DragCardGhost)
│   └ KanbanColumn ×3 (StatusDot·이름·개수) ─ KanbanCard(StartButton, D-N 칩, 실행 중 H:MM) · ColumnEmpty
├ 오른쪽
│   ├ TimerCard ─ 카테고리 줄 · 제목 · ElapsedClock · 보조 문구 · TimerButtons · RunTrack(TrackScene, Sprite)
│   │   └ (타이머 없음) TimerEmpty + RunTrack(stand)
│   └ TodaySummary ─ FocusTile(GoalEditor) · DoneTile · StreakTile(StreakCalendar) · CategoryBars · Timeline
├ OverduePopup ─ OverdueRow ×N · PostponePicker(MiniCalendar)
└ TaskDetailModal · ApplicationDetailModal (플랜 것 그대로)
```

## 4. C++ 비유
- `TodayProvider`는 앱 전체가 공유하는 싱글턴 타이머 객체다. 화면이 사라져도 객체는 살아 있어서 다른 메뉴에서도 시간이 흐른다(R23). 상태는 시작 시각만 들고, 흐른 시간은 그릴 때마다 `now - start`로 계산한다(틱마다 더하지 않음).
- `reducer`는 그 객체의 유일한 상태 변경 함수 `apply(Action)`, `startFlow`는 `start()` 앞에 끼울 수 있는 미들웨어(체인) 자리다.
- `stats.ts`·`overdue.ts`는 `const` 자유 함수라 따로 실행해 확인할 수 있다.
- D9의 종료 처리는 소멸자에서 무거운 일을 하지 않고 "dirty 플래그 + 다음 시작 때 복구"로 넘기는 방식이다. 강제 종료와 정상 종료가 같은 복구 코드를 탄다.
- `useKanbanDrag`는 마우스 캡처를 잡은 동안의 상태 기계(대기 → 누름 → 끄는 중 → 놓음)다.
