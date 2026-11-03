import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { Task } from "../../../features/plan/types";
import type { CardGroup } from "../../../features/projects/group";
import { formatDuration } from "../../../features/today/format";
import { sessionElapsed } from "../../../features/today/stats";
import type { RunningTimer } from "../../../features/today/types";
import { useNow } from "../../../features/today/useNow";
import { cardLook, KanbanCardBody } from "./KanbanCard";
import type { KanbanDrag } from "./useKanbanDrag";

interface DragCardGhostProps {
  drag: KanbanDrag;
  task: Task;
  category: CardGroup | null;
  todayKey: string;
  /** 끄는 카드의 타이머면 그 타이머, 아니면 null */
  live: RunningTimer | null;
}

/**
 * 포인터를 따라 기울어져 떠 있는 카드 (목업 drag-kanban의 card.lifted, R13).
 * 끄는 카드의 타이머가 돌고 있고 완료/시작 전 열 위면 놓았을 때 일을 말풍선으로 알린다 (R19·R20).
 */
function DragCardGhost({ drag, task, category, todayKey, live }: DragCardGhostProps) {
  const look = cardLook(task, category, live !== null);
  const target = drag.over !== null && drag.over !== drag.from ? drag.over : null;
  const style: CSSProperties = { left: drag.x - drag.offsetX, top: drag.y - drag.offsetY, width: drag.width };

  return createPortal(
    <div className="kanban-ghost" style={style}>
      <div className={`${look.className} kanban-card--lifted`} style={look.style}>
        <KanbanCardBody task={task} category={category} todayKey={todayKey} live={live} />
      </div>
      {live && (target === "done" || target === "todo") && <TimerDropTip running={live} target={target} />}
    </div>,
    document.body,
  );
}

/** "놓으면 타이머 완료/중단" 말풍선. 기록될 시간은 달리는 중이면 1초마다 다시 센다 */
function TimerDropTip({ running, target }: { running: RunningTimer; target: "done" | "todo" }) {
  const now = useNow(running.state === "running");
  const minutes = formatDuration(sessionElapsed(running, now));
  return (
    <div className="kanban-tip kanban-ghost__tip">
      {target === "done" ? "놓으면 타이머 완료" : "놓으면 타이머 중단"}
      <span>{target === "done" ? `${minutes}을 기록하고 태스크를 완료로 바꿔요.` : `${minutes}을 기록하고 시작 전으로 돌려요.`}</span>
    </div>
  );
}

export default DragCardGhost;
