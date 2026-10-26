import { useCallback, useMemo, useState, type ReactNode } from "react";
import { findPage } from "./app/pages";
import { NavigationContext, type Navigation } from "./app/navigation";
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
  const { currentPage, navigate: go, goBack: back, goForward: forward, canGoBack, canGoForward } = history;
  const navigate = useCallback(
    (id: PageId) => {
      closeUpdate();
      go(id);
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
    () => ({ currentPage, navigate, goBack, goForward, canGoBack, canGoForward }),
    [currentPage, navigate, goBack, goForward, canGoBack, canGoForward],
  );
  const Page = findPage(currentPage).component;

  return (
    <NavigationContext.Provider value={navigation}>
      <ApplicationsProvider>
        <AppScreens
          main={
            <AppLayout
              titleBar={<TitleBar sidebarOpen={!sidebarCollapsed} onToggleSidebar={toggleSidebar} />}
              banner={<ServerBanner />}
              sidebar={<Sidebar />}
              sidebarCollapsed={sidebarCollapsed}
            >
              {updateOpen ? <ServerUpdateScreen /> : <Page />}
            </AppLayout>
          }
        />
      </ApplicationsProvider>
    </NavigationContext.Provider>
  );
}

function App() {
  return (
    <ServerProvider>
      <AppMain />
    </ServerProvider>
  );
}

export default App;
