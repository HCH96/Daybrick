import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { NONE_CATEGORY_COLOR } from "../../../features/plan/color";
import type { Category, Task } from "../../../features/plan/types";
import { formatDday, formatDoneAt } from "../../../features/today/format";
import type { RunningTimer } from "../../../features/today/types";
import ElapsedClock from "../timer/ElapsedClock";
import StartButton from "./StartButton";

interface KanbanCardProps {
  task: Task;
  /** 미분류·없는 카테고리면 null */
  category: Category | null;
  todayKey: string;
  /** 도는(또는 일시정지한) 타이머, 없으면 null */
  running: RunningTimer | null;
  /** 도는 타이머의 태스크 제목 (막힘 안내용) */
  runningTitle: string;
  /** 끄는 중이라 원래 자리에 흐린 점선 자리표시로 남는다 (R13) */
  placeholder: boolean;
  /** 카드를 누르면 상세 팝업 (R14) */
  onOpen: () => void;
  /** 끌기 시작 (R13) */
  onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
}

/** 카드 겉 클래스·색 (끄는 모습 DragCardGhost와 같이 쓴다) */
export function cardLook(task: Task, category: Category | null, live: boolean): { className: string; style: CSSProperties } {
  let className = "kanban-card";
  if (task.status === "done") className += " kanban-card--done";
  if (live) className += " kanban-card--running";
  return { className, style: { "--cat": category?.color ?? NONE_CATEGORY_COLOR } as CSSProperties };
}

interface KanbanCardBodyProps {
  task: Task;
  category: Category | null;
  todayKey: string;
  /** 이 카드의 타이머면 그 타이머, 아니면 null */
  live: RunningTimer | null;
}

/** 카드 안쪽: 제목 + 색 점·카테고리 이름·D-N·끝낸 때, 타이머가 돌면 흐른 시간 */
export function KanbanCardBody({ task, category, todayKey, live }: KanbanCardBodyProps) {
  const dday = formatDday(task, todayKey);
  return (
    <div className="kanban-card__main">
      <div className="kanban-card__title">{task.title || "제목 없음"}</div>
      <div className="kanban-card__meta">
        <span className="kanban-card__dot" />
        {category?.name ?? "미분류"}
        {dday && <span className={dday.dueToday ? "kanban-card__due kanban-card__due--today" : "kanban-card__due"}>{dday.text}</span>}
        {task.status === "done" && <span className="kanban-card__when">· {formatDoneAt(task.completedAt, todayKey)}</span>}
      </div>
      {live && (
        <div className="kanban-card__live">
          <span className="kanban-card__pulse" />
          <ElapsedClock running={live} />
        </div>
      )}
    </div>
  );
}

/**
 * 칸반 카드 (R10–R13, R48): 왼쪽 카테고리 색 띠 + 제목 + 색 점·카테고리 이름,
 * 여러 날이면 "D-N" / 끝일이 오늘이면 주황 "오늘 마감".
 * 완료 카드는 투명 바탕·흐린 제목에 끝낸 때를 보이고 ▶가 없다.
 * 타이머가 도는 카드는 보라 테두리 + 아래 보라 점과 흐른 시간 H:MM, ▶ 없음.
 * 다른 태스크의 타이머가 돌면 ▶ 대신 자물쇠 (R11). 눌러 끌면 다른 열로 옮긴다 (R13).
 */
function KanbanCard({ task, category, todayKey, running, runningTitle, placeholder, onOpen, onPointerDown }: KanbanCardProps) {
  const done = task.status === "done";
  const live = running !== null && running.taskId === task.id ? running : null;
  const look = cardLook(task, category, live !== null);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      className={placeholder ? `${look.className} kanban-card--placeholder` : look.className}
      style={look.style}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
    >
      <KanbanCardBody task={task} category={category} todayKey={todayKey} live={live} />
      {!done && !live && <StartButton taskId={task.id} blockedBy={running !== null ? runningTitle : null} />}
    </div>
  );
}

export default KanbanCard;
