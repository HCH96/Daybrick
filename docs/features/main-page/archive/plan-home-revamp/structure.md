# 메인 페이지 수정1: 파일·데이터·컴포넌트 구조
경로 기준: `apps/desktop/src/`. 괄호는 만들거나 고치는 단계.

## 파일 목록
```
features/home/                     새 폴더, 화면 없는 순수 함수
  upcoming.ts        (2)  buildUpcoming(src, todayKey): UpcomingDay[]   캘린더 buildCalItems 재사용
  summary.ts         (3)  nextEvent, nearestDeadline, todayDone, shortDayLabel
  weekFocus.ts       (5)  weekFocus(today, todayKey, now): WeekFocusDay[]  dayTotals·startOfWeek
  projectRows.ts     (6)  projectRows(plan, today, todayKey, now)        projects progress·weeks·time
  newPostings.ts     (7)  newPostings(postings, openedAt, now)           마감 지남 제외, 점수순 상위 3
features/today/kanbanOrder.ts (4)  새: Kanban.tsx의 sortLikePlanList를 옮겨 export
pages/today/kanban/Kanban.tsx (4)  고침: 옮긴 함수를 import (동작 그대로)
pages/job-search/recommend/useOpenedAt.ts (7)  고침: readOpenedAt() 추가 (읽기 전용)

pages/home/
  HomePage.tsx/.css           (1)  고침: 6카드 그리드, todayKey 전달
  dashboardCards.tsx          (1, 이후 단계마다 body 교체)
  DashboardCard.tsx/.css      (1)  고침: 크기 large·narrow·quarter
  CardState.tsx/.css          (1)  새: loading / error / empty (아이콘 + 두 줄 + 이동 버튼)
  WeeklyFocusEmpty.tsx/.css   (1)  지움
  HomeHeader.tsx              (3)  고침: todayKey로 날짜
  QuickAdd.tsx/.css           (3)  고침: 실제 입력 + 안내 문구
  SummaryStrip.tsx/.css       (3)  고침: 4칸 값 연결, 누르면 이동
  upcoming/UpcomingCard.tsx, UpcomingDay.tsx, UpcomingRow.tsx, Upcoming.css   (2)
  now/NowCard.tsx, NowTimer.tsx, NowTaskList.tsx, Now.css                     (4)
  week/WeekFocusCard.tsx, WeekFocus.css                                       (5)
  projects/ProjectProgressCard.tsx, ProjectRow.tsx, Projects.css              (6)
  ApplicationsSummaryCard.tsx/.css   (6)  고침: 2×2 타일
  jobs/NewPostingsCard.tsx, PostingRow.tsx, useHomeRecommend.ts, Jobs.css    (7)
```
문서 (8): `docs/features/main-page/ai/spec/files.md`, `extension.md` (CardSize).

## 데이터 모양 (새로 저장하는 것 없음, 화면용 계산 결과만)
```ts
type UpcomingRow =
  | { kind: "task"; key: string; title: string; color: string }
  | { kind: "app"; key: string; title: string; company: string; eventKind: EventKind; time: string | null }
  | { kind: "flag"; key: string; title: string; color: string }
  | { kind: "personal"; key: string; title: string; time: string | null; endLabel: string | null }; // "~11/12"
interface UpcomingDay { dateKey: string; label: string; isToday: boolean; rows: UpcomingRow[] }
interface WeekFocusDay { dateKey: string; ms: number; state: "past" | "today" | "future" }
interface ProjectRowView { id: string; name: string; color: string; place: string; progress: number; totalMs: number }
interface HomeRecommend { status: "off" | "loading" | "error" | "ready"; items: RecommendPosting[]; newCount: number; lastCollectAt: string | null }
```

## 컴포넌트 구조
```
HomePage (todayKey)
├ HomeHeader ─ QuickAdd            usePlan().addTask(title, null, { start: today, end: today })
├ SummaryStrip                     오늘 집중 · 오늘 완료 · 다음 일정 · 가까운 마감
└ home-page__grid
  ├ DashboardCard large    UpcomingCard → UpcomingDay → UpcomingRow
  ├ DashboardCard narrow   NowCard → NowTimer | NowTaskList | CardState
  ├ DashboardCard narrow   WeekFocusCard
  ├ DashboardCard quarter  ProjectProgressCard → ProjectRow
  ├ DashboardCard quarter  ApplicationsSummaryCard
  └ DashboardCard quarter  NewPostingsCard (useHomeRecommend) → PostingRow
```
- 본문은 각 저장소(usePlan·useToday·useCalendar·useApplications·useServer)의 읽기 상태를 보고 CardState를 먼저 고른다.

## C++ 비유
- `features/home/*.ts`는 멤버 없는 자유 함수(free function)다. 입력(저장소 데이터, 오늘 날짜)만 받아 화면용 구조체를 돌려주고 아무것도 바꾸지 않는다. 그래서 Node로 따로 불러 확인할 수 있다.
- 카드 본문은 각 저장소의 `const&` 참조만 받는 뷰다. 쓰기는 빠른 추가·타이머 버튼에서 그 기능의 공용 함수(멤버 함수)를 부를 때만 한다 (R27).
- `dashboardCards` 배열은 지금처럼 함수 포인터 테이블이다. 단계마다 표의 body 칸만 바꿔 끼운다.
