import type { Category, Task, TaskStatus } from "../../../features/plan/types";
import type { RunningTimer } from "../../../features/today/types";
import StatusDot from "../../plan/StatusDot";
import ColumnEmpty from "./ColumnEmpty";
import KanbanCard from "./KanbanCard";

const COLUMN_LABEL: Record<TaskStatus, string> = { todo: "시작 전", doing: "진행 중", done: "완료" };

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  categories: Category[];
  todayKey: string;
  running: RunningTimer | null;
  runningTitle: string;
  onOpenTask: (taskId: string) => void;
}

/** 칸반 열 하나: 머리(상태 점 + 이름 + 개수 칩) 아래 카드 목록, 비면 점선 문구 (R15) */
function KanbanColumn({ status, tasks, categories, todayKey, running, runningTitle, onOpenTask }: KanbanColumnProps) {
  return (
    <div className="kanban-col">
      <div className="kanban-col__head">
        <StatusDot status={status} size="sm" />
        {COLUMN_LABEL[status]}
        <span className="kanban-col__count">{tasks.length}</span>
      </div>
      <div className="kanban-col__list">
        {tasks.length === 0 ? (
          <ColumnEmpty status={status} />
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              category={categories.find((c) => c.id === task.categoryId) ?? null}
              todayKey={todayKey}
              running={running}
              runningTitle={runningTitle}
              onOpen={() => onOpenTask(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default KanbanColumn;
