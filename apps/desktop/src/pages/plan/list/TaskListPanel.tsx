import { Fragment, useMemo, useState } from "react";
import { PlusIcon, SmallCloseIcon } from "../../../components/icons/CommonIcons";
import { groupTasksByCategory, NONE_GROUP_KEY, type TaskGroup } from "../../../features/plan/selectors";
import { usePlan } from "../../../features/plan/store";
import { projectFoldKey } from "../../../features/projects/group";
import { activeProjects } from "../../../features/projects/progress";
import { useTodayKey } from "../../../features/today/useTodayKey";
import { dropGroupValue, useGroupDropHere, usePlanDrag } from "../drag/usePlanDrag";
import { useReorder } from "../useReorder";
import CategoryForm from "./CategoryForm";
import CategoryGroup from "./CategoryGroup";
import GroupHead from "./GroupHead";
import GroupTasks from "./GroupTasks";
import ListEmpty from "./ListEmpty";
import ProjectGroup from "./ProjectGroup";
import QuickAdd from "./QuickAdd";
import "./TaskList.css";

/**
 * 왼쪽 영역: 빠른 입력, 카테고리별 묶음, 미분류, `+ 카테고리 추가` (R2, R6–R19).
 * 카테고리 다음, 미분류 앞에 진행 중 프로젝트 › 단계 묶음을 프로젝트 순서대로 둔다 (프로젝트 R45–R47).
 * 카테고리 머리를 끌어 순서를 바꾼다 (R8). 미분류는 맨 아래 고정이고 태스크가 없으면 숨긴다 (R10).
 * 달력 막대를 이 영역에 끌어 놓으면 날짜가 지워진다 (R27, `data-drop="list"`).
 */
/** onOpenTask: 태스크 줄을 누르면 상세 팝업을 연다 (R20) */
function TaskListPanel({ onOpenTask }: { onOpenTask: (id: string) => void }) {
  const { state, moveCategory } = usePlan();
  const [addAnchor, setAddAnchor] = useState<HTMLElement | null>(null);
  const data = state.kind === "ready" ? state.data : null;
  const categories = data?.categories ?? [];
  const collapsed = data?.view.collapsed ?? [];
  const groups = useMemo(() => (data ? groupTasksByCategory(data) : []), [data]);
  const projects = useMemo(() => (data ? activeProjects(data) : []), [data]);
  const todayKey = useTodayKey();
  const reorder = useReorder(categories.length, moveCategory);
  const { drag } = usePlanDrag();
  const dropHere = drag?.target?.kind === "list";

  const noneGroup = groups.find((g) => g.key === NONE_GROUP_KEY);
  const isEmpty = categories.length === 0 && projects.length === 0 && (data?.tasks.length ?? 0) === 0;

  return (
    <div className={dropHere ? "plan-list plan-list--drop" : "plan-list"} data-drop="list">
      {dropHere && (
        <div className="plan-list__drop-msg">
          <SmallCloseIcon size={13} />
          여기에 놓으면 날짜를 지워요
        </div>
      )}
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
              onOpenTask={onOpenTask}
            />
          </Fragment>
        ))}
        {reorder.dropGap === categories.length && <div className="plan-list__drop-line" />}

        {data &&
          projects.map((project) => (
            <ProjectGroup
              key={project.id}
              project={project}
              tasks={data.tasks}
              collapsed={collapsed.includes(projectFoldKey(project.id))}
              stageFold={data.view.stageFold}
              todayKey={todayKey}
              onOpenTask={onOpenTask}
            />
          ))}

        {noneGroup && (
          <UncategorizedGroup group={noneGroup} collapsed={collapsed.includes(NONE_GROUP_KEY)} onOpenTask={onOpenTask} />
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

/** 미분류 묶음: 고치기·지우기·끌기 없이 접기와 `+`만 (R10). 카테고리 묶음처럼 태스크 줄을 놓을 수 있다 (R45) */
interface UncategorizedGroupProps {
  group: TaskGroup;
  collapsed: boolean;
  onOpenTask: (id: string) => void;
}

function UncategorizedGroup({ group, collapsed, onOpenTask }: UncategorizedGroupProps) {
  const { toggleCollapsed } = usePlan();
  const [adding, setAdding] = useState(false);
  const dropHere = useGroupDropHere(null);

  return (
    <div
      className={dropHere ? "plan-group plan-group--none plan-group--drop" : "plan-group plan-group--none"}
      data-drop-group={dropGroupValue(null)}
    >
      <GroupHead
        name="미분류"
        fixed
        dropHint={dropHere}
        count={group.open.length}
        collapsed={collapsed}
        onToggle={() => toggleCollapsed(group.key)}
        onAdd={() => {
          if (collapsed) toggleCollapsed(group.key);
          setAdding(true);
        }}
        adding={adding}
      />
      <GroupTasks
        group={group}
        collapsed={collapsed}
        adding={adding}
        onCloseAdd={() => setAdding(false)}
        onOpenTask={onOpenTask}
      />
    </div>
  );
}

export default TaskListPanel;
