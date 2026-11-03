import { useState, type PointerEvent as ReactPointerEvent } from "react";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { TrashIcon } from "../../../components/icons/DialogIcons";
import { ChecklistIcon } from "../../../components/icons/PlanIcons";
import { formatShortRange, taskDeleteText } from "../../../features/plan/format";
import { checklistProgress } from "../../../features/plan/selectors";
import { usePlan } from "../../../features/plan/store";
import type { Task } from "../../../features/plan/types";
import StatusDot from "../../plan/StatusDot";

interface StageTaskRowProps {
  task: Task;
  /** 끄는 중인 줄이면 원래 자리를 흐린 점선으로 */
  lifted: boolean;
  onOpen: (id: string) => void;
  onStartDrag: (e: ReactPointerEvent<HTMLElement>, taskId: string) => void;
}

/**
 * 단계 칸 안 태스크 줄 (프로젝트 R31, R33). 플랜 목록 줄과 같은 모양·클래스(`plan-task`)다.
 * 상태 표시 누르기 → 상태 돌리기, 줄 누르기 → 상세 팝업, 마우스를 올린 줄의 휴지통 → 플랜과 같은 확인 창 뒤 삭제.
 */
function StageTaskRow({ task, lifted, onOpen, onStartDrag }: StageTaskRowProps) {
  const { cycleStatus, deleteTask } = usePlan();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const progress = checklistProgress(task);
  const className = [
    "plan-task plan-task--clickable proj-stask",
    task.status === "done" && "plan-task--done",
    lifted && "plan-task--ghost",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className={className} onClick={() => onOpen(task.id)} onPointerDown={(e) => onStartDrag(e, task.id)}>
        <StatusDot status={task.status} onCycle={() => cycleStatus(task.id)} />
        <div className="plan-task__main">
          <div className="plan-task__title">{task.title}</div>
          <div className="plan-task__meta">
            {task.start !== null && task.end !== null ? (
              <span className="plan-task__when">{formatShortRange(task.start, task.end)}</span>
            ) : (
              <span>날짜 없음</span>
            )}
            {progress.total > 0 && (
              <span className="plan-task__prog" aria-label={`체크리스트 ${progress.done}/${progress.total}`}>
                <ChecklistIcon size={12} />
                {progress.done}/{progress.total}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          className="plan-task__trash"
          title="삭제"
          aria-label={`${task.title || "제목 없음"} 삭제`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setConfirmingDelete(true);
          }}
        >
          <TrashIcon />
        </button>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          {...taskDeleteText(task)}
          confirmLabel="삭제"
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            setConfirmingDelete(false);
            deleteTask(task.id);
          }}
        />
      )}
    </>
  );
}

export default StageTaskRow;
