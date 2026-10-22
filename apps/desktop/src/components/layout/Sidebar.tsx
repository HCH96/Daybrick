import { pages } from "../../app/pages";
import { useNavigation } from "../../app/navigation";
import { version } from "../../../package.json";
import SidebarItem from "./SidebarItem";
import "./Sidebar.css";

/** 로고 + 메뉴 목록 + 버전 표시 */
function Sidebar() {
  const { currentPage, navigate } = useNavigation();

  return (
    <nav className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__brick" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        Daybrick
      </div>

      {pages.map((page) => (
        <SidebarItem
          key={page.id}
          label={page.navLabel}
          icon={page.icon}
          active={page.id === currentPage}
          onClick={() => navigate(page.id)}
        />
      ))}

      <div className="sidebar__spacer" />
      <div className="sidebar__version">v{version}</div>
    </nav>
  );
}

export default Sidebar;
