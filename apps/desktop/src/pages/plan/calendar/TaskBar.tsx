import type { CSSProperties } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../../../components/icons/CommonIcons";
import { checklistProgress } from "../../../features/plan/selectors";
import type { Task } from "../../../features/plan/types";
import type { WeekBar } from "../../../features/plan/weekLayout";
import { usePlanDrag } from "../drag/usePlanDrag";
import StatusDot from "../StatusDot";

interface TaskBarProps {
  bar: WeekBar;
  task: Task;
  color: string; // 카테고리 색 (미분류는 NONE_CATEGORY_COLOR)
  onOpen: (id: string) => void;
}

/**
 * 태스크 막대 (R23·R24·R30): 카테고리 색 옅은 바탕 + 왼쪽 굵은 선, 앞에 상태 표시, 제목 말줄임.
 * 체크리스트 항목이 있으면 오른쪽 끝에 진행도 `2/5` (잘린 쪽 › 보다 앞).
 * 완료는 흐리게, 주 경계에서 잘린 쪽은 모서리를 각지게 하고 ‹ / › 를 붙인다. 누르면 상세 팝업.
 * 4px 넘게 끌면 옮기기(R25), 마우스를 올리면 보이는 양 끝 손잡이를 끌면 시작일·끝일 바꾸기(R26).
 * 잘린 쪽 끝은 이번 주에 없으므로 손잡이를 두지 않는다.
 */
function TaskBar({ bar, task, color, onOpen }: TaskBarProps) {
  const { drag, startDrag } = usePlanDrag();
  const mine = drag?.taskId === task.id;
  const progress = checklistProgress(task);
  const className = [
    "plan-tbar",
    mine && drag?.kind === "bar-move" && "plan-tbar--ghost",
    mine && (drag?.kind === "bar-start" || drag?.kind === "bar-end") && "plan-tbar--sel",
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
    <button type="button" className={className} style={style} title={task.title} onClick={() => onOpen(task.id)}
      onPointerDown={(e) => startDrag(e, "bar-move", task.id)}
    >
      {!bar.cutLeft && (
        <span
          className="plan-tbar__h plan-tbar__h--l"
          aria-hidden="true"
          onPointerDown={(e) => {
            e.stopPropagation();
            startDrag(e, "bar-start", task.id);
          }}
        />
      )}
      {bar.cutLeft && (
        <span className="plan-tbar__cut" aria-label="지난 주에서 이어짐">
          <ChevronLeftIcon size={12} />
        </span>
      )}
      <StatusDot status={task.status} size="sm" />
      <span className="plan-tbar__title">{task.title}</span>
      {progress.total > 0 && (
        <b className="plan-tbar__meta" aria-label={`체크리스트 ${progress.done}/${progress.total}`}>
          {progress.done}/{progress.total}
        </b>
      )}
      {bar.cutRight && (
        <span className="plan-tbar__cut plan-tbar__cut--r" aria-label="다음 주로 이어짐">
          <ChevronRightIcon size={12} />
        </span>
      )}
      {!bar.cutRight && (
        <span
          className="plan-tbar__h plan-tbar__h--r"
          aria-hidden="true"
          onPointerDown={(e) => {
            e.stopPropagation();
            startDrag(e, "bar-end", task.id);
          }}
        />
      )}
    </button>
  );
}

export default TaskBar;
