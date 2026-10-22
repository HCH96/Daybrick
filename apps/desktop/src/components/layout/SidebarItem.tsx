import type { ComponentType } from "react";

interface SidebarItemProps {
  label: string;
  icon: ComponentType;
  active: boolean;
  onClick: () => void;
}

/** 사이드바 메뉴 한 줄 (아이콘 + 이름). 선택된 메뉴는 강조한다. */
function SidebarItem({ label, icon: Icon, active, onClick }: SidebarItemProps) {
  return (
    <button
      type="button"
      className={active ? "sidebar__item sidebar__item--active" : "sidebar__item"}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      <Icon />
      {label}
    </button>
  );
}

export default SidebarItem;
