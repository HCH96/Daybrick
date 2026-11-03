import { forwardRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { PlusIcon } from "../../../components/icons/CommonIcons";
import { formatShortRange } from "../../../features/plan/format";
import { usePlan } from "../../../features/plan/store";
import type { Stage, Task } from "../../../features/plan/types";
import type { DayRange } from "../../../features/projects/weeks";
import InlineTaskInput from "../../plan/list/InlineTaskInput";
import StageTaskRow from "./StageTaskRow";

interface StageColumnProps {
  stage: Stage;
  /** 칸 이름 (주차형은 "N주차 · 이름") */
  label: string;
  /** 주차형 기간, 단계형 null */
  range: DayRange | null;
  /** 이 단계의 태스크 (저장 순서) */
  tasks: Task[];
  /** 현재 단계면 칩 글자 (`현재`/`이번 주`), 아니면 null */
  currentLabel: string | null;
  /** 끄는 중인 태스크 id */
  draggingId: string | null;
  /** 끄는 태스크를 이 칸 위에 올려 둔 상태 (다른 칸에서 왔을 때만) */
  dropping: boolean;
  onOpenTask: (id: string) => void;
  onStartDrag: (e: ReactPointerEvent<HTMLElement>, taskId: string, stageId: string) => void;
}

/**
 * 단계 칸 (프로젝트 R29–R32, 목업 detail-stages·weekly-stages).
 * 머리: 이름 · (주차형) 기간 · 현재 칩 · 완료/전체(모두 끝나면 초록) · `+`.
 * 몸: 안 끝난 태스크 → `완료 N` 구분선 → 완료 태스크 → (`+`를 눌렀으면) 바로 적는 입력 줄. 비었으면 안내 문구.
 */
const StageColumn = forwardRef<HTMLElement, StageColumnProps>(function StageColumn(
  { stage, label, range, tasks, currentLabel, draggingId, dropping, onOpenTask, onStartDrag },
  ref,
) {
  const { addStageTask } = usePlan();
  const [adding, setAdding] = useState(false);
  const open = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");
  const full = tasks.length > 0 && done.length === tasks.length;
  const className = ["proj-stage", currentLabel !== null && "proj-stage--now", dropping && "proj-stage--drop"]
    .filter(Boolean)
    .join(" ");

  const row = (task: Task) => (
    <StageTaskRow
      key={task.id}
      task={task}
      lifted={task.id === draggingId}
      onOpen={onOpenTask}
      onStartDrag={(e, id) => onStartDrag(e, id, stage.id)}
    />
  );

  return (
    <section ref={ref} className={className} data-drop-stage={stage.id} aria-label={label}>
      <header className="proj-stage__head">
        <b className="proj-stage__name" title={label}>
          {label}
        </b>
        {range && <span className="proj-stage__when">{formatShortRange(range.start, range.end)}</span>}
        {currentLabel !== null && <span className="proj-stage__badge">{currentLabel}</span>}
        <span className={full ? "proj-stage__cnt proj-stage__cnt--full" : "proj-stage__cnt"}>
          {done.length}/{tasks.length}
        </span>
        <button
          type="button"
          className="proj-icon-btn proj-stage__add"
          title="태스크 추가"
          aria-label={`${label}에 태스크 추가`}
          onClick={() => setAdding(true)}
        >
          <PlusIcon size={14} />
        </button>
      </header>

      <div className="proj-stage__body">
        {tasks.length === 0 && !adding && (
          <div className="proj-stage__empty">
            <span>아직 태스크가 없어요</span>
            <small>+ 를 눌러 추가</small>
          </div>
        )}
        {open.map(row)}
        {done.length > 0 && <div className="proj-stage__sep">완료 {done.length}</div>}
        {done.map(row)}
        {adding && (
          <InlineTaskInput
            className="proj-stask"
            onSubmit={(title) => addStageTask(title, stage.id)}
            onClose={() => setAdding(false)}
          />
        )}
      </div>
    </section>
  );
});

export default StageColumn;
