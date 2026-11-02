import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { NONE_CATEGORY_COLOR } from "../../../features/plan/color";
import { formatShortRange } from "../../../features/plan/format";
import { usePlan } from "../../../features/plan/store";
import StatusDot from "../StatusDot";
import type { DragPointer, PlanDrag } from "./usePlanDrag";

interface DragGhostProps {
  drag: PlanDrag;
  pointer: DragPointer;
}

/**
 * 포인터를 따라가는 끄는 모습 (목업 cal-drag·cal-move·list-drop).
 * 목록 태스크는 떠 있는 태스크 줄, 막대 옮기기는 들어 올린 막대. 끝 끌기는 막대 자체가 늘고 줄어 따로 그리지 않는다.
 */
function DragGhost({ drag, pointer }: DragGhostProps) {
  const { state } = usePlan();
  if (state.kind !== "ready" || drag.kind === "bar-start" || drag.kind === "bar-end") return null;
  const task = state.data.tasks.find((t) => t.id === drag.taskId);
  if (!task) return null;
  const category = task.categoryId ? state.data.categories.find((c) => c.id === task.categoryId) : undefined;

  const style = {
    "--cat": category?.color ?? NONE_CATEGORY_COLOR,
    left: pointer.x - pointer.offsetX,
    top: pointer.y - pointer.offsetY,
    width: drag.kind === "list-task" ? Math.min(pointer.width, 260) : pointer.width,
  } as CSSProperties;

  const ghost =
    drag.kind === "list-task" ? (
      <div className="plan-drag-ghost plan-drag-ghost--task" style={style}>
        <div className="plan-task">
          <StatusDot status={task.status} />
          <div className="plan-task__main">
            <div className="plan-task__title">{task.title}</div>
            <div className="plan-task__meta">
              {task.start !== null && task.end !== null ? (
                <span className="plan-task__when">{formatShortRange(task.start, task.end)}</span>
              ) : (
                <span>날짜 없음</span>
              )}
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="plan-drag-ghost plan-tbar plan-tbar--lift" style={style}>
        <StatusDot status={task.status} size="sm" />
        <span className="plan-tbar__title">{task.title}</span>
      </div>
    );

  return createPortal(ghost, document.body);
}

export default DragGhost;
