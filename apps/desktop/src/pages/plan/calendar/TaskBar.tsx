import type { CSSProperties } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../../../components/icons/CommonIcons";
import type { Task } from "../../../features/plan/types";
import type { WeekBar } from "../../../features/plan/weekLayout";
import StatusDot from "../StatusDot";

interface TaskBarProps {
  bar: WeekBar;
  task: Task;
  color: string; // 카테고리 색 (미분류는 NONE_CATEGORY_COLOR)
  onOpen: (id: string) => void;
}

/**
 * 태스크 막대 (R23·R24·R30): 카테고리 색 옅은 바탕 + 왼쪽 굵은 선, 앞에 상태 표시, 제목 말줄임.
 * 완료는 흐리게, 주 경계에서 잘린 쪽은 모서리를 각지게 하고 ‹ / › 를 붙인다. 누르면 상세 팝업.
 */
function TaskBar({ bar, task, color, onOpen }: TaskBarProps) {
  const className = [
    "plan-tbar",
    task.status === "done" && "plan-tbar--done",
    bar.cutLeft && "plan-tbar--cut-l",
    bar.cutRight && "plan-tbar--cut-r",
  ]
    .filter(Boolean)
    .join(" ");
  const style = {
    "--cat": color,
    gridColumn: `${bar.col + 1} / span ${bar.span}`,
    gridRow: bar.lane + 1,
  } as CSSProperties;

  return (
    <button type="button" className={className} style={style} title={task.title} onClick={() => onOpen(task.id)}>
      {bar.cutLeft && (
        <span className="plan-tbar__cut" aria-label="지난 주에서 이어짐">
          <ChevronLeftIcon size={13} />
        </span>
      )}
      <StatusDot status={task.status} size="sm" />
      <span className="plan-tbar__title">{task.title}</span>
      {bar.cutRight && (
        <span className="plan-tbar__cut plan-tbar__cut--r" aria-label="다음 주로 이어짐">
          <ChevronRightIcon size={13} />
        </span>
      )}
    </button>
  );
}

export default TaskBar;
