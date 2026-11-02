import { useMemo } from "react";
import { NONE_CATEGORY_COLOR } from "../../../features/plan/color";
import type { Category, Task } from "../../../features/plan/types";
import { countLanes, type WeekBar } from "../../../features/plan/weekLayout";
import InlineTaskInput from "../list/InlineTaskInput";
import TaskBar from "./TaskBar";

interface BarLayerProps {
  bars: WeekBar[];
  tasks: Task[];
  categories: Category[];
  onOpenTask: (id: string) => void;
  /** 더블클릭으로 연 바로 만들기 칸 (0=월 ~ 6=일). null이면 없음 (R28) */
  draftCol: number | null;
  onSubmitDraft: (title: string) => void;
  onCloseDraft: () => void;
}

/** 태스크 막대 층: 7칸 격자에 막대를 줄(lane)마다 놓는다 (R23·R29). 바로 만들기 칸은 막대들 아래 줄에 둔다. */
function BarLayer({ bars, tasks, categories, onOpenTask, draftCol, onSubmitDraft, onCloseDraft }: BarLayerProps) {
  const taskById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const colorById = useMemo(() => new Map(categories.map((c) => [c.id, c.color])), [categories]);

  return (
    <div className="plan-bars">
      {bars.map((bar) => {
        const task = taskById.get(bar.taskId);
        if (!task) return null;
        const color = (task.categoryId && colorById.get(task.categoryId)) || NONE_CATEGORY_COLOR;
        return <TaskBar key={bar.taskId} bar={bar} task={task} color={color} onOpen={onOpenTask} />;
      })}
      {draftCol !== null && (
        <div className="plan-bars__draft" style={{ gridColumn: `${draftCol + 1} / span 1`, gridRow: countLanes(bars) + 1 }}>
          <InlineTaskInput
            className="plan-task--bar"
            keepOpen={false}
            placeholder="새 태스크"
            onSubmit={onSubmitDraft}
            onClose={onCloseDraft}
          />
        </div>
      )}
    </div>
  );
}

export default BarLayer;
