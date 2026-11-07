import { useState } from "react";
import Popover from "../../../components/common/Popover";
import { usePlan } from "../../../features/plan/store";
import type { Category } from "../../../features/plan/types";
import ColorPicker from "./ColorPicker";

/** 새 카테고리의 처음 색 (최근 쓴 색이 없을 때) */
const DEFAULT_COLOR = "#7AA8FF";

interface CategoryFormProps {
  anchor: HTMLElement;
  /** 고칠 카테고리. 없으면 새로 만든다 */
  category?: Category;
  onClose: () => void;
}

/**
 * 카테고리 만들기·고치기 작은 창 (R7·R8, 목업 list-catform).
 * 이름 + 큰 견본 + 색 선택기 + [취소]/[만들기]·[저장]. 빈 이름이면 버튼을 막는다.
 * 저장하면 그 색을 최근 쓴 색 맨 앞에 넣는다.
 */
function CategoryForm({ anchor, category, onClose }: CategoryFormProps) {
  const { state, addCategory, updateCategory, pushRecentColor } = usePlan();
  const recentColors = state.kind === "ready" ? state.data.view.recentColors : [];
  const [name, setName] = useState(category?.name ?? "");
  const [color, setColor] = useState(category?.color ?? recentColors[0] ?? DEFAULT_COLOR);

  const trimmed = name.trim();
  const canSave = trimmed !== "";

  const save = () => {
    if (!canSave) return;
    if (category) updateCategory(category.id, { name: trimmed, color });
    else addCategory(trimmed, color);
    pushRecentColor(color);
    onClose();
  };

  return (
    <Popover
      anchor={anchor}
      onClose={onClose}
      placement="bottom-start"
      width={300}
      ariaLabel={category ? "카테고리 고치기" : "새 카테고리"}
      className="cat-form"
    >
      <form
        className="cat-form__body"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <h4 className="cat-form__title">{category ? "카테고리 고치기" : "새 카테고리"}</h4>
        <div className="cat-form__row">
          <span className="cat-form__swatch" style={{ background: color }} />
          <input
            className="pop-input cat-form__name"
            value={name}
            placeholder="카테고리 이름"
            aria-label="카테고리 이름"
            autoFocus
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <ColorPicker value={color} onChange={setColor} recentColors={recentColors} />
        <div className="cat-form__foot">
          <button type="button" className="plan-btn plan-btn--lg plan-btn--ghost" onClick={onClose}>
            취소
          </button>
          <button type="submit" className="plan-btn plan-btn--lg plan-btn--primary" disabled={!canSave}>
            {category ? "저장" : "만들기"}
          </button>
        </div>
      </form>
    </Popover>
  );
}

export default CategoryForm;
