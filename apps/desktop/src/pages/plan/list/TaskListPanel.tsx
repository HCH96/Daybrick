import { Fragment, useState } from "react";
import { PlusIcon } from "../../../components/icons/CommonIcons";
import { usePlan } from "../../../features/plan/store";
import { useReorder } from "../useReorder";
import CategoryForm from "./CategoryForm";
import CategoryGroup from "./CategoryGroup";
import GroupHead from "./GroupHead";
import "./TaskList.css";

/**
 * 왼쪽 영역: (3단계) 빠른 입력, 카테고리별 묶음, 미분류, `+ 카테고리 추가` (R2, R6–R10).
 * 카테고리 머리를 끌어 순서를 바꾼다 (R8). 미분류는 맨 아래 고정이고 태스크가 없으면 숨긴다 (R10).
 */
function TaskListPanel() {
  const { state, moveCategory } = usePlan();
  const [addAnchor, setAddAnchor] = useState<HTMLElement | null>(null);
  const categories = state.kind === "ready" ? state.data.categories : [];
  const tasks = state.kind === "ready" ? state.data.tasks : [];
  const reorder = useReorder(categories.length, moveCategory);

  const hasUncategorized = tasks.some((t) => t.categoryId === null);

  return (
    <div className="plan-list">
      <div className="plan-list__groups">
        {categories.map((category, index) => (
          <Fragment key={category.id}>
            {reorder.dropGap === index && <div className="plan-list__drop-line" />}
            <CategoryGroup
              category={category}
              taskCount={tasks.filter((t) => t.categoryId === category.id).length}
              dragging={reorder.dragIndex === index}
              onDragStart={reorder.startDrag(index)}
              groupRef={reorder.itemRef(index)}
            />
          </Fragment>
        ))}
        {reorder.dropGap === categories.length && <div className="plan-list__drop-line" />}

        {hasUncategorized && (
          <div className="plan-group plan-group--none">
            <GroupHead name="미분류" fixed />
          </div>
        )}

        <button
          type="button"
          className={addAnchor ? "plan-list__add-cat plan-list__add-cat--on" : "plan-list__add-cat"}
          onClick={(e) => setAddAnchor(e.currentTarget)}
        >
          <PlusIcon size={13} />
          카테고리 추가
        </button>
      </div>

      {addAnchor && <CategoryForm anchor={addAnchor} onClose={() => setAddAnchor(null)} />}
    </div>
  );
}

export default TaskListPanel;
