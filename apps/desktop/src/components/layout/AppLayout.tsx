import { useState, type ReactNode } from "react";
import { OverlayRootContext } from "./overlayRoot";
import "./AppLayout.css";

interface AppLayoutProps {
  titleBar?: ReactNode;
  sidebar?: ReactNode;
  sidebarCollapsed?: boolean;
  children?: ReactNode;
}

/**
 * 맨 위 제목 표시줄 + 아래 (왼쪽 사이드바 + 오른쪽 본문) 배치.
 * 사이드바를 접으면 폭이 0이 되고, 안의 버튼은 키보드로도 닿지 않게 inert로 막는다.
 * 본문 위에는 팝업을 그릴 겹침 층을 둔다 (제목 표시줄은 덮지 않아 창 이동·닫기가 계속 된다).
 */
function AppLayout({ titleBar, sidebar, sidebarCollapsed = false, children }: AppLayoutProps) {
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);

  return (
    <div className="app-layout">
      {titleBar}
      <div className="app-layout__body">
        <aside
          className={
            sidebarCollapsed
              ? "app-layout__sidebar app-layout__sidebar--collapsed"
              : "app-layout__sidebar"
          }
          inert={sidebarCollapsed}
        >
          <div className="app-layout__sidebar-inner">{sidebar}</div>
        </aside>
        <OverlayRootContext.Provider value={overlayRoot}>
          <main className="app-layout__main">{children}</main>
        </OverlayRootContext.Provider>
        <div
          ref={setOverlayRoot}
          className={
            sidebarCollapsed
              ? "app-layout__overlay app-layout__overlay--sidebar-collapsed"
              : "app-layout__overlay"
          }
        />
      </div>
    </div>
  );
}

export default AppLayout;
