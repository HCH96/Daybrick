import { usePlan } from "../../../features/plan/store";
import { tasksOnDate } from "../../../features/plan/selectors";
import type { PlanData, Task, TaskStatus } from "../../../features/plan/types";
import { taskCardGroup } from "../../../features/projects/group";
import { sortLikePlanList } from "../../../features/today/kanbanOrder";
import { useToday } from "../../../features/today/store";
import type { RunningTimer } from "../../../features/today/types";
import DragCardGhost from "./DragCardGhost";
import KanbanColumn from "./KanbanColumn";
import { useKanbanDrag } from "./useKanbanDrag";
import "./Kanban.css";

interface KanbanProps {
  data: PlanData;
  /** 오늘 "YYYY-MM-DD" */
  todayKey: string;
  /** 도는(또는 일시정지한) 타이머, 없으면 null (R11, R48) */
  running: RunningTimer | null;
  /** 카드를 누르면 플랜 태스크 상세 팝업 (R14) */
  onOpenTask: (taskId: string) => void;
}

const STATUSES: TaskStatus[] = ["todo", "doing", "done"];

/**
 * 칸반 (R8–R10, R12, R13, R15): 오늘이 기간 안인 태스크를 시작 전 / 진행 중 / 완료 세 열로 나눈다.
 * 날짜 없는 태스크는 tasksOnDate에서 빠진다 (R8). 완료 열은 언제 끝냈든 모두 보인다 (R9).
 * 카드를 다른 열로 끌면 상태가 바뀐다. 타이머가 도는 카드는 완료 열이면 타이머 완료(R19),
 * 시작 전 열이면 중단(R20)과 같다. 진행 중 열로 옮기는 것만으로는 타이머를 시작하지 않는다.
 */
function Kanban({ data, todayKey, running, onOpenTask }: KanbanProps) {
  const { updateTask } = usePlan();
  const { complete, stop } = useToday();
  const { drag, onCardPointerDown, clickSuppressed } = useKanbanDrag((taskId, _from, to) => {
    if (running !== null && running.taskId === taskId) {
      if (to === "done") complete();
      else if (to === "todo") stop();
      return;
    }
    updateTask(taskId, { status: to });
  });

  const ordered = sortLikePlanList(data, tasksOnDate(data, todayKey));
  const runningTask = running ? data.tasks.find((t) => t.id === running.taskId) : undefined;
  const runningTitle = runningTask ? runningTask.title || "제목 없음" : "지금 도는 태스크";
  const dragTask = drag ? data.tasks.find((t) => t.id === drag.taskId) : undefined;

  return (
    <div className="kanban">
      {STATUSES.map((status) => {
        const tasks = ordered.filter((t) => t.status === status);
        return (
          <KanbanColumn
            key={status}
            status={status}
            tasks={status === "done" ? sortByCompleted(tasks) : tasks}
            data={data}
            todayKey={todayKey}
            running={running}
            runningTitle={runningTitle}
            dropping={drag !== null && drag.over === status && drag.from !== status}
            draggingId={drag ? drag.taskId : null}
            onOpenTask={(id) => {
              if (!clickSuppressed()) onOpenTask(id);
            }}
            onCardPointerDown={onCardPointerDown}
          />
        );
      })}
      {drag && dragTask && (
        <DragCardGhost
          drag={drag}
          task={dragTask}
          category={taskCardGroup(data, dragTask)}
          todayKey={todayKey}
          live={running !== null && running.taskId === dragTask.id ? running : null}
        />
      )}
    </div>
  );
}

/** 완료 열: 완료한 때 최근 순 */
function sortByCompleted(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
}

export default Kanban;
