import { useState, type ReactNode } from "react";
import { OverlayRootContext } from "./overlayRoot";
import "./AppLayout.css";

interface AppLayoutProps {
  titleBar?: ReactNode;
  /** 제목 표시줄 바로 아래 전체 폭 안내 띠 자리 (서버 상태, R41). 띠가 뜨면 아래를 밀어낸다. */
  banner?: ReactNode;
  sidebar?: ReactNode;
  sidebarCollapsed?: boolean;
  children?: ReactNode;
}

/**
 * 맨 위 제목 표시줄 + 안내 띠 자리 + 아래 (왼쪽 사이드바 + 오른쪽 본문) 배치.
 * 사이드바를 접으면 폭이 0이 되고, 안의 버튼은 키보드로도 닿지 않게 inert로 막는다.
 * 본문 위에는 팝업을 그릴 겹침 층을 둔다 (제목 표시줄·띠는 덮지 않아 창 이동·닫기가 계속 된다).
 */
function AppLayout({ titleBar, banner, sidebar, sidebarCollapsed = false, children }: AppLayoutProps) {
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);

  return (
    <OverlayRootContext.Provider value={overlayRoot}>
      <div className="app-layout">
        {titleBar}
        {banner}
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
          <div className="app-layout__main-frame">
            <main className="app-layout__main">{children}</main>
          </div>
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
    </OverlayRootContext.Provider>
  );
}

export default AppLayout;
