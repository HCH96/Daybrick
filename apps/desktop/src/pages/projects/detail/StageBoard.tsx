import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { formatShortRange } from "../../../features/plan/format";
import type { Project, Task } from "../../../features/plan/types";
import { currentStage, stageTasks } from "../../../features/projects/progress";
import { stageLabel, weekRange } from "../../../features/projects/weeks";
import ApplicationDetailModal from "../../applications/detail/ApplicationDetailModal";
import TaskDetailModal from "../../plan/detail/TaskDetailModal";
import StatusDot from "../../plan/StatusDot";
import StageColumn from "./StageColumn";
import { useStageTaskDrag, type StageDrag } from "./useStageTaskDrag";
import "../../plan/list/TaskList.css";
import "../../plan/drag/drag.css";

interface StageBoardProps {
  project: Project;
  /** 플랜 태스크 전체 (단계 id로 거른다) */
  tasks: Task[];
  todayKey: string;
}

/**
 * 상세 아래 단계 영역 (프로젝트 R29–R34, 목업 detail-stages·weekly-stages).
 * 단계형은 칸을 같은 너비로 나누고, 주차형은 272px 칸을 가로로 넘긴다(처음 열면 현재 주차 칸이 맨 앞).
 * 줄을 누르면 플랜 태스크 상세 팝업(메모 = 개발일지, D1)을 이 화면 위에 띄운다.
 */
function StageBoard({ project, tasks, todayKey }: StageBoardProps) {
  const weekly = project.kind === "weekly";
  const current = currentStage(project, tasks, todayKey);
  const { drag, startDrag } = useStageTaskDrag();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const closeTask = useCallback(() => setOpenTaskId(null), []);
  const [openApplicationId, setOpenApplicationId] = useState<string | null>(null);
  const closeApplication = useCallback(() => setOpenApplicationId(null), []);

  const boardRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLElement>(null);
  // 주차형은 처음 열 때만 현재 주차 칸을 맨 앞으로 (그 뒤 사용자가 넘긴 자리는 그대로 둔다)
  useLayoutEffect(() => {
    const board = boardRef.current;
    const column = currentRef.current;
    if (board && column && board.classList.contains("proj-stages--scroll")) board.scrollLeft = column.offsetLeft;
  }, []);

  const currentLabel = (index: number): string | null => {
    if (index !== current) return null;
    if (!weekly) return "현재";
    const range = weekRange(project, index);
    return range && range.start <= todayKey && todayKey <= range.end ? "이번 주" : "현재";
  };

  return (
    <>
      <div ref={boardRef} className={weekly ? "proj-stages proj-stages--scroll" : "proj-stages"}>
        {project.stages.map((stage, index) => (
          <StageColumn
            key={stage.id}
            ref={index === current ? currentRef : undefined}
            stage={stage}
            label={stageLabel(project, index)}
            range={weekRange(project, index)}
            tasks={stageTasks(tasks, stage.id)}
            currentLabel={currentLabel(index)}
            draggingId={drag?.taskId ?? null}
            dropping={drag !== null && drag.overStageId === stage.id && drag.fromStageId !== stage.id}
            onOpenTask={setOpenTaskId}
            onStartDrag={startDrag}
          />
        ))}
      </div>

      {drag && <StageDragGhost drag={drag} tasks={tasks} />}
      {openTaskId && <TaskDetailModal taskId={openTaskId} onClose={closeTask} onOpenApplication={setOpenApplicationId} />}
      {openApplicationId && <ApplicationDetailModal applicationId={openApplicationId} onClose={closeApplication} />}
    </>
  );
}

/** 포인터를 따라가는 기울어진 태스크 줄 (플랜 DragGhost의 목록 줄과 같은 클래스·모양) */
function StageDragGhost({ drag, tasks }: { drag: StageDrag; tasks: Task[] }) {
  const task = tasks.find((t) => t.id === drag.taskId);
  if (!task) return null;
  const { pointer } = drag;
  const style: CSSProperties = {
    left: pointer.x - pointer.offsetX,
    top: pointer.y - pointer.offsetY,
    width: Math.min(pointer.width, 260),
  };
  return createPortal(
    <div className="plan-drag-ghost plan-drag-ghost--task" style={style}>
      <div className="plan-task">
        <StatusDot status={task.status} />
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
    </div>,
    document.body,
  );
}

export default StageBoard;
