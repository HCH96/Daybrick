import { Fragment, useMemo, useState } from "react";
import { PlusIcon } from "../../../components/icons/CommonIcons";
import { groupTasksByCategory, NONE_GROUP_KEY, type TaskGroup } from "../../../features/plan/selectors";
import { usePlan } from "../../../features/plan/store";
import { useReorder } from "../useReorder";
import CategoryForm from "./CategoryForm";
import CategoryGroup from "./CategoryGroup";
import GroupHead from "./GroupHead";
import GroupTasks from "./GroupTasks";
import ListEmpty from "./ListEmpty";
import QuickAdd from "./QuickAdd";
import "./TaskList.css";

/**
 * 왼쪽 영역: 빠른 입력, 카테고리별 묶음, 미분류, `+ 카테고리 추가` (R2, R6–R19).
 * 카테고리 머리를 끌어 순서를 바꾼다 (R8). 미분류는 맨 아래 고정이고 태스크가 없으면 숨긴다 (R10).
 */
function TaskListPanel() {
  const { state, moveCategory } = usePlan();
  const [addAnchor, setAddAnchor] = useState<HTMLElement | null>(null);
  const data = state.kind === "ready" ? state.data : null;
  const categories = data?.categories ?? [];
  const collapsed = data?.view.collapsed ?? [];
  const groups = useMemo(() => (data ? groupTasksByCategory(data) : []), [data]);
  const reorder = useReorder(categories.length, moveCategory);

  const noneGroup = groups.find((g) => g.key === NONE_GROUP_KEY);
  const isEmpty = categories.length === 0 && (data?.tasks.length ?? 0) === 0;

  return (
    <div className="plan-list">
      <QuickAdd />
      <div className="plan-list__groups">
        {isEmpty && <ListEmpty />}
        {categories.map((category, index) => (
          <Fragment key={category.id}>
            {reorder.dropGap === index && <div className="plan-list__drop-line" />}
            <CategoryGroup
              category={category}
              group={groups[index]}
              collapsed={collapsed.includes(category.id)}
              dragging={reorder.dragIndex === index}
              onDragStart={reorder.startDrag(index)}
              groupRef={reorder.itemRef(index)}
            />
          </Fragment>
        ))}
        {reorder.dropGap === categories.length && <div className="plan-list__drop-line" />}

        {noneGroup && <UncategorizedGroup group={noneGroup} collapsed={collapsed.includes(NONE_GROUP_KEY)} />}

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

/** 미분류 묶음: 고치기·지우기·끌기 없이 접기와 `+`만 (R10) */
function UncategorizedGroup({ group, collapsed }: { group: TaskGroup; collapsed: boolean }) {
  const { toggleCollapsed } = usePlan();
  const [adding, setAdding] = useState(false);

  return (
    <div className="plan-group plan-group--none">
      <GroupHead
        name="미분류"
        fixed
        count={group.open.length}
        collapsed={collapsed}
        onToggle={() => toggleCollapsed(group.key)}
        onAdd={() => {
          if (collapsed) toggleCollapsed(group.key);
          setAdding(true);
        }}
        adding={adding}
      />
      <GroupTasks group={group} collapsed={collapsed} adding={adding} onCloseAdd={() => setAdding(false)} />
    </div>
  );
}

export default TaskListPanel;
