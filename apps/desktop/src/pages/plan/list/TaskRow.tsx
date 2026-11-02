import { formatShortRange } from "../../../features/plan/format";
import { usePlan } from "../../../features/plan/store";
import type { Task } from "../../../features/plan/types";
import StatusDot from "../StatusDot";

interface TaskRowProps {
  task: Task;
  /** 줄을 누르면 상세 팝업을 연다 (R20, 4단계에서 연결) */
  onOpen?: (id: string) => void;
}

/**
 * 태스크 줄 (목업 list-rows): 상태 표시, 제목, 아래 작은 글자로 기간 또는 "날짜 없음" (R14).
 * 상태 표시를 누르면 상태만 바뀌고 줄 클릭으로 번지지 않는다 (R18). 완료 줄은 취소선·흐리게.
 */
function TaskRow({ task, onOpen }: TaskRowProps) {
  const { cycleStatus } = usePlan();
  const className = task.status === "done" ? "plan-task plan-task--done" : "plan-task";

  return (
    <div
      className={onOpen ? `${className} plan-task--clickable` : className}
      onClick={onOpen ? () => onOpen(task.id) : undefined}
    >
      <StatusDot status={task.status} onCycle={() => cycleStatus(task.id)} />
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
  );
}

export default TaskRow;
