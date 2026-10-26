import { useMemo, type ReactNode } from "react";
import { findPage } from "./app/pages";
import { NavigationContext, type Navigation } from "./app/navigation";
import { useHistory } from "./app/useHistory";
import { useSidebarCollapsed } from "./app/useSidebarCollapsed";
import { useGlobalShortcuts } from "./app/useGlobalShortcuts";
import AppLayout from "./components/layout/AppLayout";
import Sidebar from "./components/layout/Sidebar";
import TitleBar from "./components/layout/TitleBar";
import { ApplicationsProvider } from "./features/applications/store";
import { ServerProvider } from "./features/server/ServerProvider";
import { useServer } from "./features/server/useServer";
import WelcomeScreen from "./pages/server-setup/WelcomeScreen";
import WizardShell from "./pages/server-setup/wizard/WizardShell";

/** 사이드바 없이 제목 표시줄 + 창 전체를 쓰는 화면 (첫 실행 안내, 연결 마법사) */
function FullScreen({ children }: { children?: ReactNode }) {
  return (
    <div className="app-layout">
      <TitleBar />
      <div className="app-layout__body">{children}</div>
    </div>
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

function App() {
  const history = useHistory("home");
  const [sidebarCollapsed, toggleSidebar] = useSidebarCollapsed();

  useGlobalShortcuts({
    onToggleSidebar: toggleSidebar,
    onBack: history.goBack,
    onForward: history.goForward,
  });

  const { currentPage, navigate, goBack, goForward, canGoBack, canGoForward } = history;
  const navigation = useMemo<Navigation>(
    () => ({ currentPage, navigate, goBack, goForward, canGoBack, canGoForward }),
    [currentPage, navigate, goBack, goForward, canGoBack, canGoForward],
  );
  const Page = findPage(currentPage).component;

  return (
    <NavigationContext.Provider value={navigation}>
      <ServerProvider>
        <ApplicationsProvider>
          <AppScreens
            main={
              <AppLayout
                titleBar={<TitleBar sidebarOpen={!sidebarCollapsed} onToggleSidebar={toggleSidebar} />}
                sidebar={<Sidebar />}
                sidebarCollapsed={sidebarCollapsed}
              >
                <Page />
              </AppLayout>
            }
          />
        </ApplicationsProvider>
      </ServerProvider>
    </NavigationContext.Provider>
  );
}

export default App;
