# 플랜 3단계: 태스크 목록

- 요구사항: R11–R19 (R10 미분류 보이기)
- 목업: `plan.html` plan-quick·plan-list 구역, `part-list.html` list-rows·list-inline·list-quickcat 구역, `plan-empty.html` plan-empty-list 구역 (CSS: plan.css·parts.css·common.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D7, D13, D15

## 할 일
- reducer·store: `add-task`(제목, 카테고리, 기간 선택값 → 새 태스크 id 돌려줌, 상태 "시작 전" R19), `cycle-status`(D13, `completedAt` 기록·지우기), `toggle-collapsed`(카테고리 id 또는 "none").
- `selectors.ts`: `groupTasksByCategory(data)` → 카테고리 순서대로 묶음 + 미분류(태스크 있을 때만, R10), `sortGroupTasks`(날짜 없음 먼저 → 시작일 순 → 만든 순, R13), 완료는 따로 (R15), `countOpen`(안 끝난 수, R12), `tasksOnDate(data, key)`(공용, 이 단계는 함수만).
- `format.ts`: `formatShortRange(start, end)` → "11/3–11/5", 하루면 "11/6".
- `StatusDot`: 시작 전 회색 빈 원, 진행 중 `#F0B860` 반쪽 원, 완료 `#66CF95` 채운 원 + 체크. 크기 두 가지(목록·막대).
- `list/TaskRow`: 상태 표시(누르면 `cycle-status`, 줄 클릭과 분리), 제목, 아래 작은 회색 글자(기간 또는 "날짜 없음", R14). 완료 줄은 취소선·흐리게. 줄 클릭은 `onOpen(id)`만 받아 두고 4단계에서 연결.
- `list/DoneFold`: "완료 N개" 접힌 줄, 누르면 펼침 (펼침은 화면 state, 저장 안 함).
- `GroupHead`: 개수, 접기 (R12, 저장됨), `+` → 그 묶음 안 `InlineTaskInput` (R17).
- `list/InlineTaskInput`: Enter → 만들기, 입력칸 유지. Esc·빈 칸으로 포커스 잃기 → 닫기. `keepOpen` 선택값으로 5단계(더블클릭)도 쓴다.
- `list/QuickAdd` (R16): 목록 맨 위 입력칸 + 카테고리 고르기(`Popover`, 기본 미분류, 색 점과 이름). 만든 뒤 커서 유지. 고른 카테고리가 지워지면 미분류로.
- `list/ListEmpty`: 태스크·카테고리가 없을 때 안내 (plan-empty-list).
- `PlanIcons.tsx`: 목록에 필요한 아이콘(더하기·접기·더보기 등, 이미 있는 것은 다시 쓴다).

## 확인할 결과
- `npm run build` 성공.
- 빠른 입력칸에 제목 → Enter를 세 번 연속으로 하면 고른 카테고리에 태스크 세 개, 커서는 입력칸에 남는다.
- 묶음 `+`로 그 카테고리에 바로 적힌다. 상태 표시를 누르면 ○ → ◐ → ● → ○.
- 완료한 태스크는 "완료 N개" 줄로 모이고 누르면 펼쳐진다. 머리 개수는 안 끝난 것만 센다.
- 접은 묶음은 앱을 다시 켜도 접혀 있다. 미분류는 태스크가 생길 때만 맨 아래에 보인다.
- 카테고리를 지우면 그 태스크들이 미분류 묶음에 나타난다.
- Node로 `sortGroupTasks`: 날짜 없음 2개 + 11/5, 11/3 시작 태스크 → 날짜 없음, 11/3, 11/5 순서.

## 이 단계에서 만들거나 고칠 파일
- `apps/desktop/src/features/plan/reducer.ts`, `store.tsx`, `selectors.ts`, `format.ts`
- 새 `components/icons/PlanIcons.tsx`
- 새 `pages/plan/StatusDot.tsx`, `list/TaskRow.tsx`, `DoneFold.tsx`, `InlineTaskInput.tsx`, `QuickAdd.tsx`, `ListEmpty.tsx`
- `pages/plan/list/TaskListPanel.tsx`, `CategoryGroup.tsx`, `GroupHead.tsx`, `TaskList.css`
