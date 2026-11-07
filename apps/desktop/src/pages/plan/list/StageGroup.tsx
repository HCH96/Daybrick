import { useState, type MouseEvent as ReactMouseEvent } from "react";
import { ChevronDownIcon, PlusIcon } from "../../../components/icons/CommonIcons";
import { formatShortRange } from "../../../features/plan/format";
import { usePlan } from "../../../features/plan/store";
import type { Stage, Task } from "../../../features/plan/types";
import { splitStageTasks } from "../../../features/projects/group";
import type { DayRange } from "../../../features/projects/weeks";
import { useStageDropHere } from "../drag/usePlanDrag";
import DoneFold from "./DoneFold";
import InlineTaskInput from "./InlineTaskInput";
import TaskRow from "./TaskRow";

interface StageGroupProps {
  stage: Stage;
  /** 단계 이름표 (주차형은 "N주차 · 이름") */
  label: string;
  /** 주차형 단계의 기간. 단계형은 null */
  range: DayRange | null;
  /** 이 단계의 태스크 */
  tasks: Task[];
  /** 펼쳐져 있는지 (직접 바꾼 값, 없으면 현재 단계만 펼침, 프로젝트 R47) */
  open: boolean;
  onOpenTask: (id: string) => void;
}

/**
 * 플랜 트리의 프로젝트 단계 묶음 (프로젝트 R46–R48·R50): 한 층 들인 머리(이름·주차 기간·끝나지 않은 개수·`+`)와
 * 그 아래 플랜 태스크 줄·"완료 N개" 줄. 머리를 누르면 접고 펴며, 그 값은 저장된다 (`stageFold`).
 * 다른 묶음의 태스크 줄을 끌어 놓을 곳이다 (`data-drop-stage`, 놓으면 그 단계로 옮겨짐).
 */
function StageGroup({ stage, label, range, tasks, open, onOpenTask }: StageGroupProps) {
  const { addStageTask, toggleStageFold } = usePlan();
  const [adding, setAdding] = useState(false);
  const dropHere = useStageDropHere(stage.id);
  const { open: openTasks, done } = splitStageTasks(tasks);

  const toggle = () => toggleStageFold(stage.id, !open);
  const onClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".plan-ghead__tools")) return;
    toggle();
  };

  const headClass = [
    "plan-ghead",
    "plan-ghead--stage",
    !open && "plan-ghead--closed",
    adding && "plan-ghead--active",
    dropHere && "plan-ghead--drop",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={dropHere ? "plan-group plan-sgroup plan-group--drop" : "plan-group plan-sgroup"} data-drop-stage={stage.id}>
      <div
        className={headClass}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={`${label} 단계 ${open ? "접기" : "펴기"}`}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <span className="plan-ghead__fold">
          <ChevronDownIcon size={16} />
        </span>
        <span className="plan-ghead__name">{label}</span>
        {range && <span className="plan-sgroup__range">{formatShortRange(range.start, range.end)}</span>}
        <span className="plan-ghead__count">{openTasks.length}</span>
        {dropHere && <span className="plan-ghead__drop-hint">여기로 옮기기</span>}
        <span className="plan-ghead__tools">
          <button
            type="button"
            className={adding ? "plan-ghead__tool plan-ghead__tool--on" : "plan-ghead__tool"}
            aria-label={`${label}에 태스크 추가`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (!open) toggleStageFold(stage.id, true); // 접힌 단계에 적으면 펴서 보이게
              setAdding(true);
            }}
          >
            <PlusIcon size={16} />
          </button>
        </span>
      </div>

      {open && (
        <>
          {adding && <InlineTaskInput onSubmit={(title) => addStageTask(title, stage.id)} onClose={() => setAdding(false)} />}
          {openTasks.map((task) => (
            <TaskRow key={task.id} task={task} onOpen={onOpenTask} />
          ))}
          <DoneFold tasks={done} onOpen={onOpenTask} />
        </>
      )}
    </div>
  );
}

export default StageGroup;
