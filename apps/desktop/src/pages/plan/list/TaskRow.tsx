import { ChecklistIcon, LinkIcon } from "../../../components/icons/PlanIcons";
import { useApplications } from "../../../features/applications/store";
import { findLinkCard } from "../../../features/plan/applicationLinks";
import { formatShortRange } from "../../../features/plan/format";
import { checklistProgress } from "../../../features/plan/selectors";
import { usePlan } from "../../../features/plan/store";
import type { Task } from "../../../features/plan/types";
import { usePlanDrag } from "../drag/usePlanDrag";
import StatusDot from "../StatusDot";

interface TaskRowProps {
  task: Task;
  /** 줄을 누르면 상세 팝업을 연다 (R20). 주지 않으면 누를 수 없는 줄 */
  onOpen?: (id: string) => void;
}

/**
 * 태스크 줄 (목업 list-rows): 상태 표시, 제목, 아래 작은 글자로 기간 또는 "날짜 없음"과 체크리스트 진행도 (R14),
 * 연결된 지원 카드의 회사 (R39).
 * 상태 표시를 누르면 상태만 바뀌고 줄 클릭으로 번지지 않는다 (R18). 완료 줄은 취소선·흐리게.
 * 4px 넘게 끌면 달력 칸에 놓을 수 있다 (R22). 살짝 누르기만 하면 그대로 클릭.
 */
function TaskRow({ task, onOpen }: TaskRowProps) {
  const { cycleStatus } = usePlan();
  const { startDrag } = usePlanDrag();
  const className = task.status === "done" ? "plan-task plan-task--done" : "plan-task";
  const progress = checklistProgress(task);
  // 연결된 지원 카드의 회사 (회사가 없으면 카드 제목). 지원 데이터가 준비되지 않았으면 보이지 않는다 (R39).
  const { state: applications } = useApplications();
  const card =
    task.applicationId !== null && applications.kind === "ready"
      ? findLinkCard(applications.data, task.applicationId, new Date())
      : null;
  const linkName = card ? card.company || card.title : "";

  return (
    <div
      className={onOpen ? `${className} plan-task--clickable` : className}
      onClick={onOpen ? () => onOpen(task.id) : undefined}
      onPointerDown={(e) => startDrag(e, "list-task", task.id)}
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
          {progress.total > 0 && (
            <span className="plan-task__prog" aria-label={`체크리스트 ${progress.done}/${progress.total}`}>
              <ChecklistIcon size={12} />
              {progress.done}/{progress.total}
            </span>
          )}
          {linkName && (
            <span className="plan-task__lnk" aria-label={`연결된 지원 카드 ${linkName}`}>
              <LinkIcon size={11} />
              {linkName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskRow;
