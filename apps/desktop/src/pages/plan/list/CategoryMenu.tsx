import Popover from "../../../components/common/Popover";
import { PenIcon } from "../../../components/icons/CommonIcons";
import { TrashIcon } from "../../../components/icons/DialogIcons";

interface CategoryMenuProps {
  anchor: HTMLElement;
  categoryName: string;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

/** 카테고리 머리 `…` 메뉴: [이름·색 고치기], [카테고리 삭제] (R8·R9, 목업 list-menu) */
function CategoryMenu({ anchor, categoryName, onEdit, onDelete, onClose }: CategoryMenuProps) {
  return (
    <Popover anchor={anchor} onClose={onClose} placement="bottom-start" width={210} ariaLabel={`${categoryName} 메뉴`} className="cat-menu">
      <button type="button" className="pop-row cat-menu__row" onClick={onEdit} autoFocus>
        <PenIcon />
        이름·색 고치기
      </button>
      <div className="pop-sep" />
      <button type="button" className="pop-row pop-row--danger cat-menu__row" onClick={onDelete}>
        <TrashIcon />
        카테고리 삭제
      </button>
    </Popover>
  );
}

export default CategoryMenu;
