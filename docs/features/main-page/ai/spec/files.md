# 메인 페이지: 파일 구조 (2026-10-22 구현 기준)
```
apps/desktop/src/
  App.tsx                       // 방문 기록·사이드바 접힘 상태 + NavigationContext + 레이아웃
  app/
    types.ts                    // PageId
    pageLabels.ts               // 한글·영어 메뉴 이름
    pages.ts                    // PageDef 배열 (메뉴 목록)
    navigation.ts               // NavigationContext, useNavigation
    useHistory.ts               // 방문 기록 (뒤로·앞으로)
    useSidebarCollapsed.ts      // 사이드바 접힘 상태 + 기억
    useGlobalShortcuts.ts       // Ctrl+B, Alt+←/→, 마우스 옆 버튼
  components/layout/
    AppLayout.tsx               // 제목 표시줄 + 사이드바 + 본문
    TitleBar.tsx, WindowControls.tsx
    Sidebar.tsx, SidebarItem.tsx
  components/common/
    EmptyState.tsx              // "아직 연결되지 않았어요" 공통 표시
  components/icons/
    LineIcon.tsx, NavIcons.tsx, StatusIcons.tsx, TitleBarIcons.tsx
  pages/home/
    HomePage.tsx, HomeHeader.tsx, QuickAdd.tsx, SummaryStrip.tsx
    DashboardCard.tsx, dashboardCards.tsx, WeeklyFocusEmpty.tsx
  pages/PlaceholderPage.tsx     // 기능 화면용 빈 페이지
  utils/date.ts, utils/korean.ts
  styles/theme.css, styles/base.css
```
- 스타일은 일반 CSS 파일을 쓴다. 공통 색·기본 스타일은 `styles/`에, 컴포넌트별 CSS는 그 컴포넌트 옆에 둔다. (CSS 라이브러리 도입은 이번 범위 밖)
