import { useRef, useState, type CSSProperties } from "react";
import Popover from "../../../components/common/Popover";
import { ChevronDownIcon, PlusIcon } from "../../../components/icons/CommonIcons";
import { NONE_CATEGORY_COLOR as NONE_COLOR } from "../../../features/plan/color";
import { usePlan } from "../../../features/plan/store";
import type { Category } from "../../../features/plan/types";
import CategoryOption from "../CategoryOption";

/**
 * 목록 맨 위 빠른 입력 (목업 plan-quick·list-quickcat, R16).
 * 제목을 적고 Enter → 고른 카테고리에 날짜 없는 태스크. 만든 뒤에도 커서는 입력칸에 남는다.
 * 카테고리 기본값은 미분류이고, 고른 카테고리가 지워지면 미분류로 돌아간다.
 */
function QuickAdd() {
  const { state, addTask } = usePlan();
  const categories = state.kind === "ready" ? state.data.categories : [];
  const [title, setTitle] = useState("");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [pickAnchor, setPickAnchor] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const picked = categories.find((c) => c.id === pickedId) ?? null;

  const submit = () => {
    if (!title.trim()) return;
    addTask(title, picked?.id ?? null);
    setTitle("");
    inputRef.current?.focus();
  };

  const choose = (category: Category | null) => {
    setPickedId(category?.id ?? null);
    setPickAnchor(null);
    inputRef.current?.focus();
  };

  return (
    <div className="plan-quick">
      <label className="plan-field plan-quick__field">
        <PlusIcon size={13} />
        <input
          ref={inputRef}
          className="plan-quick__input"
          value={title}
          placeholder="새 태스크 (Enter로 추가)"
          aria-label="새 태스크 제목"
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
        />
        {title.trim() && <span className="plan-kbd">Enter</span>}
      </label>

      <button
        type="button"
        className={pickAnchor ? "plan-quick__cat plan-quick__cat--on" : "plan-quick__cat"}
        style={{ "--cat": picked?.color ?? NONE_COLOR } as CSSProperties}
        aria-label="새 태스크 카테고리 고르기"
        title={picked?.name ?? "미분류"}
        aria-haspopup="menu"
        onClick={(e) => setPickAnchor(pickAnchor ? null : e.currentTarget)}
      >
        <span className={picked ? "plan-cat-dot" : "plan-cat-dot plan-cat-dot--ring"} />
        <span className="plan-quick__cat-name">{picked?.name ?? "미분류"}</span>
        <ChevronDownIcon size={13} />
      </button>

      {pickAnchor && (
        <Popover
          anchor={pickAnchor}
          onClose={() => setPickAnchor(null)}
          placement="bottom-end"
          width={210}
          ariaLabel="카테고리 고르기"
          className="cat-menu"
        >
          <CategoryOption name="미분류" color={NONE_COLOR} ring selected={picked === null} onPick={() => choose(null)} />
          {categories.map((c) => (
            <CategoryOption key={c.id} name={c.name} color={c.color} selected={picked?.id === c.id} onPick={() => choose(c)} />
          ))}
        </Popover>
      )}
    </div>
  );
}

export default QuickAdd;
