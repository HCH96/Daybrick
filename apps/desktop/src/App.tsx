import { useCallback, useMemo, useState, type ReactNode } from "react";
import { findPage } from "./app/pages";
import { NavigationContext, type Navigation } from "./app/navigation";
import { PageIntentProvider } from "./app/pageIntent";
import type { PageId } from "./app/types";
import { useHistory } from "./app/useHistory";
import { useSidebarCollapsed } from "./app/useSidebarCollapsed";
import { useGlobalShortcuts } from "./app/useGlobalShortcuts";
import AppLayout from "./components/layout/AppLayout";
import { OverlayRootContext } from "./components/layout/overlayRoot";
import Sidebar from "./components/layout/Sidebar";
import TitleBar from "./components/layout/TitleBar";
import ServerBanner from "./components/server/ServerBanner";
import ServerUpdateScreen from "./components/server/ServerUpdateScreen";
import { ApplicationsProvider } from "./features/applications/store";
import { useJobStatusSync } from "./features/job-search/statusSync";
import { PlanProvider } from "./features/plan/store";
import { TodayProvider } from "./features/today/store";
import { NotificationsProvider } from "./features/notifications/NotificationsProvider";
import { ServerProvider } from "./features/server/ServerProvider";
import { useServer } from "./features/server/useServer";
import WelcomeScreen from "./pages/server-setup/WelcomeScreen";
import WizardShell from "./pages/server-setup/wizard/WizardShell";

/**
 * 사이드바 없이 제목 표시줄 + 창 전체를 쓰는 화면 (첫 실행 안내, 연결 마법사).
 * 마법사 안의 확인 창(빈 프로젝트 경고 등)도 그려지도록 AppLayout처럼 팝업 겹침 층을 둔다.
 */
function FullScreen({ children }: { children?: ReactNode }) {
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);
  return (
    <OverlayRootContext.Provider value={overlayRoot}>
      <div className="app-layout">
        <TitleBar />
        <div className="app-layout__body">
          {children}
          <div ref={setOverlayRoot} className="app-layout__overlay app-layout__overlay--sidebar-collapsed" />
        </div>
      </div>
    </OverlayRootContext.Provider>
  );
}

/** 구직 관리가 만든 지원 카드의 상태를 서버 지원 건에 맞춘다 (구직 관리 R58·R59). 화면은 없다 */
function JobStatusSync() {
  useJobStatusSync();
  return null;
}

/**
 * 연결 흐름 중이면 첫 실행 안내·마법사를, 아니면 평소 화면을 보여준다.
 * server.json을 읽기 전에는 화면이 번쩍이지 않도록 제목 표시줄만 그린다.
 */
function AppScreens({ main }: { main: ReactNode }) {
  const { config, setupOpen } = useServer();
  if (setupOpen) {
    return (
      <FullScreen>
        <WizardShell />
      </FullScreen>
    );
  }
  if (!config) return <FullScreen />;
  if (!config.connection && !config.welcomeDismissed) {
    return (
      <FullScreen>
        <WelcomeScreen />
      </FullScreen>
    );
  }
  return main;
}

/** 평소 화면. 서버 업데이트 화면이 열려 있으면 본문 자리에 그것을 그린다 (사이드바는 그대로). */
function AppMain() {
  const history = useHistory("home");
  const [sidebarCollapsed, toggleSidebar] = useSidebarCollapsed();
  const { updateOpen, closeUpdate } = useServer();

  // 다른 메뉴로 가면(뒤로·앞으로 포함) 서버 업데이트 화면을 닫는다
  const { currentPage, currentSub, navigate: go, goBack: back, goForward: forward, canGoBack, canGoForward } =
    history;
  const navigate = useCallback(
    (id: PageId, sub?: string) => {
      closeUpdate();
      go(id, sub);
    },
    [closeUpdate, go],
  );
  const goBack = useCallback(() => {
    closeUpdate();
    back();
  }, [closeUpdate, back]);
  const goForward = useCallback(() => {
    closeUpdate();
    forward();
  }, [closeUpdate, forward]);

  useGlobalShortcuts({
    onToggleSidebar: toggleSidebar,
    onBack: goBack,
    onForward: goForward,
  });

  const navigation = useMemo<Navigation>(
    () => ({ currentPage, currentSub, navigate, goBack, goForward, canGoBack, canGoForward }),
    [currentPage, currentSub, navigate, goBack, goForward, canGoBack, canGoForward],
  );
  const Page = findPage(currentPage).component;

  return (
    <NavigationContext.Provider value={navigation}>
      <ApplicationsProvider>
        <PlanProvider>
          <TodayProvider>
            <JobStatusSync />
            <AppScreens
              main={
                // 갈 곳 이동은 평소 화면에서만 한다. 전체 화면(FullScreen)에는 Provider가 없어 이동할 수 없는 상태다 (D10)
                <PageIntentProvider>
                  <AppLayout
                    titleBar={<TitleBar sidebarOpen={!sidebarCollapsed} onToggleSidebar={toggleSidebar} />}
                    banner={<ServerBanner />}
                    sidebar={<Sidebar />}
                    sidebarCollapsed={sidebarCollapsed}
                  >
                    {updateOpen ? <ServerUpdateScreen /> : <Page />}
                  </AppLayout>
                </PageIntentProvider>
              }
            />
          </TodayProvider>
        </PlanProvider>
      </ApplicationsProvider>
    </NavigationContext.Provider>
  );
}

function App() {
  return (
    <ServerProvider>
      {/* 알림은 제목 표시줄(종)과 전체 화면(마법사 등) 모두에서 쓰므로 그 둘을 함께 감싼다 */}
      <NotificationsProvider>
        <AppMain />
      </NotificationsProvider>
    </ServerProvider>
  );
}

export default App;
