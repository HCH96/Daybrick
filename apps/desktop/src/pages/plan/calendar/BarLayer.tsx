import { useMemo } from "react";
import type { PlanData, Task } from "../../../features/plan/types";
import { countLanes, type WeekBar } from "../../../features/plan/weekLayout";
import { NONE_GROUP_INFO, taskGroupInfo } from "../../../features/projects/group";
import InlineTaskInput from "../list/InlineTaskInput";
import TaskBar from "./TaskBar";

interface BarLayerProps {
  bars: WeekBar[];
  tasks: Task[];
  /** 막대 색을 정할 플랜 데이터 (카테고리 색, 프로젝트 단계 태스크는 프로젝트 색). 준비 전이면 null */
  plan: PlanData | null;
  onOpenTask: (id: string) => void;
  /** 더블클릭으로 연 바로 만들기 칸 (0=월 ~ 6=일). null이면 없음 (R28) */
  draftCol: number | null;
  onSubmitDraft: (title: string) => void;
  onCloseDraft: () => void;
}

/** 태스크 막대 층: 7칸 격자에 막대를 줄(lane)마다 놓는다 (R23·R29). 바로 만들기 칸은 막대들 아래 줄에 둔다. */
function BarLayer({ bars, tasks, plan, onOpenTask, draftCol, onSubmitDraft, onCloseDraft }: BarLayerProps) {
  const taskById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);

  return (
    <div className="plan-bars">
      {bars.map((bar) => {
        const task = taskById.get(bar.taskId);
        if (!task) return null;
        // 프로젝트 단계 태스크는 프로젝트 색 막대 (프로젝트 R49)
        const color = (plan ? taskGroupInfo(plan, task) : NONE_GROUP_INFO).color;
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
