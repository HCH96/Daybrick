import type { CSSProperties } from "react";
import { SmallCheckIcon } from "../../components/icons/CommonIcons";

interface CategoryOptionProps {
  name: string;
  color: string;
  /** 미분류는 빈 원 */
  ring?: boolean;
  selected: boolean;
  onPick: () => void;
}

/**
 * 카테고리 고르기 목록의 줄 하나: 색 점 + 이름 + 고른 것 체크.
 * 빠른 입력(QuickAdd)과 상세 팝업 카테고리(PropRows)가 같이 쓴다. 모양은 TaskList.css의 cat-menu·plan-cat-dot.
 */
function CategoryOption({ name, color, ring, selected, onPick }: CategoryOptionProps) {
  return (
    <button
      type="button"
      className={selected ? "pop-row cat-menu__row pop-row--active" : "pop-row cat-menu__row"}
      style={{ "--cat": color } as CSSProperties}
      onClick={onPick}
      autoFocus={selected}
    >
      <span className={ring ? "plan-cat-dot plan-cat-dot--ring" : "plan-cat-dot"} />
      <span className="plan-quick__opt-name">{name}</span>
      {selected && (
        <span className="pop-row__check">
          <SmallCheckIcon size={14} />
        </span>
      )}
    </button>
  );
}

export default CategoryOption;
