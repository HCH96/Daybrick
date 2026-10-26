import { pages, type PageDef } from "../../app/pages";
import { useNavigation } from "../../app/navigation";
import { version } from "../../../package.json";
import SidebarItem from "./SidebarItem";
import "./Sidebar.css";

const topPages = pages.filter((page) => page.position !== "bottom");
const bottomPages = pages.filter((page) => page.position === "bottom");

/** 로고 + 메뉴 목록 + (맨 아래) Settings 등 + 버전 표시 */
function Sidebar() {
  const { currentPage, navigate } = useNavigation();

  const renderItem = (page: PageDef) => (
    <SidebarItem
      key={page.id}
      label={page.navLabel}
      icon={page.icon}
      active={page.id === currentPage}
      onClick={() => navigate(page.id)}
    />
  );

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

      {topPages.map(renderItem)}

      <div className="sidebar__spacer" />
      {bottomPages.map(renderItem)}
      <div className="sidebar__version">v{version}</div>
    </nav>
  );
}

export default Sidebar;
