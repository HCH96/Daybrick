import type { PointerEvent } from "react";
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
  /** 끄는 카드를 여기 놓을 수 있어 보라 점선으로 칠한다 (R13) */
  dropping: boolean;
  /** 끄는 중인 카드 id (원래 자리 자리표시), 없으면 null */
  draggingId: string | null;
  onOpenTask: (taskId: string) => void;
  onCardPointerDown: (e: PointerEvent<HTMLDivElement>, taskId: string, from: TaskStatus) => void;
}

/**
 * 칸반 열 하나: 머리(상태 점 + 이름 + 개수 칩) 아래 카드 목록, 비면 점선 문구 (R15).
 * 열 전체가 놓을 곳이다 (`data-drop-status`, R13).
 */
function KanbanColumn({
  status,
  tasks,
  categories,
  todayKey,
  running,
  runningTitle,
  dropping,
  draggingId,
  onOpenTask,
  onCardPointerDown,
}: KanbanColumnProps) {
  return (
    <div className={dropping ? "kanban-col kanban-col--drop" : "kanban-col"} data-drop-status={status}>
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
              placeholder={task.id === draggingId}
              onOpen={() => onOpenTask(task.id)}
              onPointerDown={(e) => onCardPointerDown(e, task.id, status)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default KanbanColumn;
