# 프로젝트: 파일 목록·데이터 모양·컴포넌트 구조
전체 구조가 필요할 때만 읽는다. 경로 기준은 [index.md](index.md) 맨 위.

## 1. 파일 목록 (새 파일은 "새")
### 고치는 공용 파일
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `features/plan/types.ts`, `storage.ts` | 2절 모양 추가, 읽을 때 빈 값 채우기 (D6) | 1 |
| `features/plan/reducer.ts`, `store.tsx` | 프로젝트 추가·수정·순서·삭제, `addStageTask`, `stageId` 고치기(카테고리 비움), 접힘·완료 묶음 상태 | 1 |
| 〃 | 단계 편집(사라지는 단계 태스크 옮기기/지우기), `goalSeenAt` | 5 |
| `features/plan/selectors.ts` | 카테고리 묶음·미분류에서 프로젝트 태스크 빼기 | 1 |
| `app/types.ts`, `pageLabels.ts`, `pages.ts`, `components/icons/NavIcons.tsx` | `projects` 화면, Plan 바로 아래 메뉴 (R1) | 1 |
| `app/useHistory.ts`, `navigation.ts` | 기록 한 칸 `{ page, sub? }`, `navigate(page, sub?)`, `currentSub` (D7) | 3 |
| `App.tsx` | `useGoalReset` 붙이기 | 5 |
| `package.json` | `d3-force`, `d3-ease`, `@types/d3-force`, `@types/d3-ease` (D8) | 6 |

### 새 공용 계산 (`features/projects/`, 순수 함수 + 훅)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| 새 `progress.ts` | `stageTasks`, `isStageDone`, `currentStage`, `runnerPosition`, `isProjectDone`, `activeProjects`, `doneProjects` | 1 |
| 새 `weeks.ts` | `weekRange(project, index)`, `currentWeekIndex`, `stageLabel` | 1 |
| 새 `time.ts` | `projectSlices`, `projectTotal`, `lastWorkDay`, `dayTotalsByProject` (today `collectSlices`·`splitByDay` 사용) | 1 |
| 새 `campfire.ts` | `fireByLastDay`(6단계), `fireByStreak`(4단계), `formatLastWork` | 1 |
| 새 `useProjectClock.ts` | 플랜 + 투데이 + 지금 시각 → 프로젝트별 시간 값, 실행 중 프로젝트 (D9) | 2 |
| 새 `useGoalReset.ts` | 완료가 아니게 된 프로젝트의 `goalSeenAt` 비우기 | 5 |
| 새 `bubbleScale.ts` | 반지름 비율, 글자 크기, 범례 정렬, 시간 글자 | 6 |
| 새 `heat.ts` | 16주 칸, 진하기 5단계, 연속·최장·최근 4주, 프로젝트로 거르기 | 7 |
| 새 `group.ts` | `taskGroupInfo(data, task)` → `{ kind, name, color }` | 8, 9 |

### 새 화면 (`pages/projects/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| 새 `ProjectsPage.tsx`·`.css` | 제목·`진행 중 N개`, 목록/상세 전환 | 1, 3 |
| 새 `list/ProjectList.tsx`, `ProjectCard.tsx`, `MiniTrack.tsx`, `CardMenu.tsx`, `DoneFold.tsx`, `Projects.css` | 카드·끌기 순서·`…` 메뉴·완료 묶음 | 2 |
| 새 `create/CreateProjectDialog.tsx`, `StageListEditor.tsx`, `WeeklyEditor.tsx`, `Create.css` | 만들기 창 (5단계 편집 창도 같이 씀) | 2, 5 |
| 새 `common/Campfire.tsx`, `FlagTrack.tsx`, `ProjectIcons.tsx` | 목업 icons.js의 깃발·캐릭터·모닥불 SVG | 2, 3 |
| 새 `detail/ProjectDetail.tsx`, `DetailHead.tsx`, `ProgressPanel.tsx`, `Detail.css` | 상세 머리·진행 판 | 3 |
| 새 `detail/StageBoard.tsx`, `StageColumn.tsx`, `StageTaskRow.tsx`, `useStageTaskDrag.ts` | 단계 칸·태스크 줄·끌기 | 4 |
| 새 `edit/EditStagesDialog.tsx`, `RemoveStageConfirm.tsx`, `detail/GoalCelebration.tsx` | 단계 편집·확인 창·골인 | 5 |
| 새 `top/BubblePanel.tsx`, `useBubbleSim.ts`, `BubbleLegend.tsx`, `Bubble.css` | 버블 그래프 | 6 |
| 새 `top/HeatPanel.tsx`, `HeatGrid.tsx`, `HeatStats.tsx`, `HeatTooltip.tsx`, `Heat.css`, `useTopHighlight.ts` | 잔디·서로 강조 | 7 |

### 고치는 플랜·투데이 화면
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `pages/plan/list/TaskListPanel.tsx`, 새 `ProjectGroup.tsx`·`StageGroup.tsx`, `TaskList.css` | 카테고리 아래·미분류 위 프로젝트 › 단계 트리 | 8 |
| `pages/plan/drag/usePlanDrag.ts`, `PlanDragProvider.tsx`, `DragGhost.tsx` | 놓을 곳 `{ kind: "stage"; stageId }`, 끄는 모습 색 | 8 |
| `pages/plan/detail/PropRows.tsx`, `calendar/BarLayer.tsx` | "프로젝트 › 단계" 선택, 막대 색 | 8 |
| `pages/today/kanban/Kanban.tsx`, `KanbanColumn.tsx`, `overdue/OverduePopup.tsx`, `summary/Timeline.tsx`, `TodayPage.tsx`, `features/today/stats.ts` | 이름·색을 `taskGroupInfo`로, 묶음 합계에 프로젝트 | 9 |

다시 쓰는 것: `Modal`, `ConfirmDialog`, `Popover`, 플랜 `ColorPicker`·`StatusDot`·`TaskDetailModal`·`InlineTaskInput`·`useReorder`·`DoneFold` 모양, 투데이 `formatDuration`·`useNow`·`useTodayKey`, `utils/date`.

## 2. 데이터 모양 (`plan.json` version 1에 더함)
```ts
interface Project {
  id: string; name: string; color: string;      // "#RRGGBB"
  kind: "stage" | "weekly";
  startWeek: string | null;                      // 주차형: 1주차 월요일 "YYYY-MM-DD", 단계형 null
  stages: Stage[];                               // 순서 = 배열 순서. 주차형은 주 수 = 길이
  goalSeenAt: string | null;                     // 골인 연출 본 시각 (R25)
}
interface Stage { id: string; name: string }     // 주차형 "" → "N주차"
interface Task { /* 기존 */ stageId: string | null }   // 값이 있으면 categoryId = null (D2)
interface PlanView { /* 기존 */ stageFold: Record<string, boolean>; projectsDoneOpen: boolean }
interface PlanData { /* 기존 */ projects: Project[] }  // 순서 = 진행 중 카드·트리 순서 (R7)
```
- 단계 편집 입력: `StageEdit { stages: Stage[]; startWeek?: string; removed: { stageId; moveTo: string | null }[] }` (`moveTo` null = 함께 지우기).
- 계산 결과(저장 안 함): `Fire = "blaze" | "mid" | "small" | "ember" | "out" | "wood"`, `HeatCell { day; minutes; level 0–4; today; future }`, `BubbleNode { id; minutes; r; x; y; vx; vy }`.

## 3. 컴포넌트 구조
```
App → PlanProvider → TodayProvider (+ useGoalReset)
ProjectsPage (currentSub 없음 → 목록, 프로젝트 id → 상세)
├ 목록
│ ├ 윗줄: HeatPanel(HeatGrid · HeatStats · HeatTooltip) 60% | BubblePanel(useBubbleSim · BubbleLegend) 40%
│ │        └ useTopHighlight: 버블 원·범례 ↔ 잔디 칸 서로 강조
│ ├ ProjectList(useReorder) ─ ProjectCard(MiniTrack · Campfire 소 · CardMenu)
│ ├ + 프로젝트 만들기 → CreateProjectDialog(StageListEditor | WeeklyEditor)
│ └ DoneFold ─ ProjectCard(흐리게)
└ 상세: ProjectDetail
  ├ DetailHead(← · 색 점 · 이름 · 종류 칩 · 단계 편집 → EditStagesDialog → RemoveStageConfirm · …)
  ├ ProgressPanel(FlagTrack + 캐릭터 | Campfire 대 · 마지막 작업 · 누적 시간) + GoalCelebration
  ├ StageBoard(useStageTaskDrag) ─ StageColumn ─ StageTaskRow · InlineTaskInput
  └ TaskDetailModal (플랜 것)
PlanPage 왼쪽 트리: CategoryGroup… → ProjectGroup ─ StageGroup ─ TaskRow → 미분류
```

## 4. C++ 비유
- 프로젝트를 `plan.json`에 넣는 것은 두 테이블을 한 트랜잭션 안에 두는 것이다. 프로젝트 삭제 + 태스크 미분류 옮기기가 reducer 한 번이라 반만 저장될 수 없다.
- `progress.ts`·`time.ts`·`heat.ts`는 상태를 갖지 않는 `const` 자유 함수다. 진행률을 멤버로 캐시하지 않고 그릴 때마다 계산한다 (D3).
- 방문 기록 `{ page, sub? }`는 `std::optional` 멤버를 하나 더한 구조체다. 기존 호출 `navigate(page)`는 기본 인자 덕에 그대로 컴파일된다.
- `useBubbleSim`은 d3 시뮬레이션 객체를 `useRef`에 붙잡아 두는 RAII 래퍼다. 화면이 사라지면 정리 함수에서 `stop()`한다.
- `taskGroupInfo`는 카테고리/프로젝트 두 타입을 하나의 인터페이스로 보여 주는 어댑터다. 투데이는 둘을 구분하지 않는다.
