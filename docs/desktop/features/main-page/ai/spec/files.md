# 메인 페이지: 파일 구조 (2026-11-09 홈 다듬기 수정2 기준)
```
apps/desktop/src/
  App.tsx                       // 방문 기록·사이드바 접힘 상태 + NavigationContext + 레이아웃
  app/
    types.ts                    // PageId
    pageLabels.ts               // 한글·영어 메뉴 이름
    pages.ts                    // PageDef 배열 (메뉴 목록)
    navigation.ts               // NavigationContext, useNavigation
    pageIntent.tsx              // useOpenTarget: 화면 + 탭까지 지정해 이동 (요약 줄·추천 공고가 씀)
    useHistory.ts               // 방문 기록 (뒤로·앞으로)
    useSidebarCollapsed.ts      // 사이드바 접힘 상태 + 기억
    useGlobalShortcuts.ts       // Ctrl+B, Alt+←/→, 마우스 옆 버튼
  components/layout/
    AppLayout.tsx               // 제목 표시줄 + 사이드바 + 본문
    TitleBar.tsx, WindowControls.tsx
    Sidebar.tsx, SidebarItem.tsx
  components/common/
    EmptyState.tsx              // "아직 연결되지 않았어요" 공통 표시 (홈은 더 쓰지 않음, 남겨 둠)
  components/icons/
    LineIcon.tsx, NavIcons.tsx, StatusIcons.tsx, TitleBarIcons.tsx
  features/home/                // 화면 없는 순수 함수 (D11). 다른 기능의 함수를 재사용
    upcoming.ts                 // buildUpcoming: 다가오는 7일 (캘린더 buildCalItems), groupUpcoming: 빈 날 합치기 (D19)
    summary.ts                  // nextEvent·nearestDeadline·todayDone·shortDayLabel (요약 줄)
    weekFocus.ts                // weekFocus: 이번 주 요일별 집중 시간
    projectRows.ts              // projectRows: 진행 중 프로젝트 줄
    newPostings.ts              // newPostings: 새 추천 공고 개수·상위 3개
  features/today/kanbanOrder.ts // 칸반 순서 (투데이 칸반·지금 하는 것이 같이 씀)
  pages/home/
    HomePage.tsx, HomeHeader.tsx, QuickAdd.tsx, SummaryStrip.tsx
    DashboardCard.tsx, dashboardCards.tsx   // 카드 틀, 카드 6개 목록
    CardState.tsx               // 불러오는 중·못 읽음·비었음 (R17)
    ApplicationsSummaryCard.tsx // 지원 현황
    upcoming/  UpcomingCard, UpcomingDay, UpcomingRow, UpcomingGap   // UpcomingGap: 이어진 빈 날 한 줄 (D19)
    now/       NowCard, NowTimer, NowTaskList
    week/      WeekFocusCard
    projects/  ProjectProgressCard, ProjectRow
    jobs/      NewPostingsCard, PostingRow, useHomeRecommend
  pages/job-search/recommend/useOpenedAt.ts // readOpenedAt(): 홈은 읽기만 (D10)
  pages/PlaceholderPage.tsx     // 기능 화면용 빈 페이지
  utils/date.ts, utils/korean.ts, utils/relativeTime.ts
  styles/theme.css, styles/base.css
```
- 스타일은 일반 CSS 파일을 쓴다. 공통 색·기본 스타일은 `styles/`에, 컴포넌트별 CSS는 그 컴포넌트 옆에 둔다 (카드 폴더마다 CSS 하나). (CSS 라이브러리 도입은 이번 범위 밖)
- 홈이 저장소에 쓰는 곳은 `QuickAdd`의 `addTask`와 `NowTimer`·`NowTaskList`의 타이머 함수뿐이다 (R27).
