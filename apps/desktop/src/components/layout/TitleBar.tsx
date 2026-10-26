import { useNavigation } from "../../app/navigation";
import { BackIcon, ForwardIcon, SidebarToggleIcon } from "../icons/TitleBarIcons";
import NotificationBell from "../notifications/NotificationBell";
import WindowControls from "./WindowControls";
import "./TitleBar.css";

interface TitleBarProps {
  sidebarOpen?: boolean;
  /** 없으면 왼쪽 버튼 묶음 대신 앱 이름만 보인다 (첫 실행 안내·연결 마법사처럼 사이드바가 없는 화면) */
  onToggleSidebar?: () => void;
}

/**
 * 앱이 직접 그리는 창 제목 표시줄.
 * 왼쪽: 사이드바 접기, 뒤로, 앞으로 / 가운데 빈 곳: 끌어서 창 이동, 더블클릭 최대화 / 오른쪽: 알림 종, 창 버튼
 * data-tauri-drag-region이 붙은 요소 자체를 누를 때만 창이 끌린다 (그 안의 버튼은 제외).
 */
function TitleBar({ sidebarOpen = false, onToggleSidebar }: TitleBarProps) {
  const { goBack, goForward, canGoBack, canGoForward } = useNavigation();
  const sidebarLabel = sidebarOpen ? "사이드바 닫기 (Ctrl+B)" : "사이드바 열기 (Ctrl+B)";

  if (!onToggleSidebar) {
    return (
      <header className="titlebar" data-tauri-drag-region>
        <div className="titlebar__title" data-tauri-drag-region>
          Daybrick
        </div>
        <div className="titlebar__drag" data-tauri-drag-region />
        <NotificationBell />
        <WindowControls />
      </header>
    );
  }

  return (
    <header className="titlebar" data-tauri-drag-region>
      <div className="titlebar__nav">
        <button
          type="button"
          className={sidebarOpen ? "titlebar__button titlebar__button--pressed" : "titlebar__button"}
          aria-label={sidebarLabel}
          aria-pressed={sidebarOpen}
          title={sidebarLabel}
          onClick={onToggleSidebar}
        >
          <SidebarToggleIcon />
        </button>
        <button
          type="button"
          className="titlebar__button"
          aria-label="뒤로 (Alt+←)"
          title="뒤로 (Alt+←)"
          disabled={!canGoBack}
          onClick={goBack}
        >
          <BackIcon />
        </button>
        <button
          type="button"
          className="titlebar__button"
          aria-label="앞으로 (Alt+→)"
          title="앞으로 (Alt+→)"
          disabled={!canGoForward}
          onClick={goForward}
        >
          <ForwardIcon />
        </button>
      </div>

      <div className="titlebar__drag" data-tauri-drag-region />

      <NotificationBell />
      <WindowControls />
    </header>
  );
}

export default TitleBar;
