import { useMemo } from "react";
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
          <AppLayout
            titleBar={<TitleBar sidebarOpen={!sidebarCollapsed} onToggleSidebar={toggleSidebar} />}
            sidebar={<Sidebar />}
            sidebarCollapsed={sidebarCollapsed}
          >
            <Page />
          </AppLayout>
        </ApplicationsProvider>
      </ServerProvider>
    </NavigationContext.Provider>
  );
}

export default App;
