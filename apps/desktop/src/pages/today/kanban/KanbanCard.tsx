import type { CSSProperties, KeyboardEvent } from "react";
import { NONE_CATEGORY_COLOR } from "../../../features/plan/color";
import type { Category, Task } from "../../../features/plan/types";
import { formatDday, formatDoneAt } from "../../../features/today/format";
import { PlayIcon } from "../../../components/icons/TodayIcons";

interface KanbanCardProps {
  task: Task;
  /** 미분류·없는 카테고리면 null */
  category: Category | null;
  todayKey: string;
  /** 카드를 누르면 상세 팝업 (R14) */
  onOpen: () => void;
}

/**
 * 칸반 카드 (R10, R12): 왼쪽 카테고리 색 띠 + 제목 + 색 점·카테고리 이름,
 * 여러 날이면 "D-N" / 끝일이 오늘이면 주황 "오늘 마감".
 * 완료 카드는 투명 바탕·흐린 제목에 끝낸 때를 보이고 ▶가 없다.
 * 시작 전·진행 중 카드의 ▶는 이 단계에서 모양만 둔다 (타이머는 3단계).
 */
function KanbanCard({ task, category, todayKey, onOpen }: KanbanCardProps) {
  const done = task.status === "done";
  const dday = formatDday(task, todayKey);
  const style = { "--cat": category?.color ?? NONE_CATEGORY_COLOR } as CSSProperties;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      className={done ? "kanban-card kanban-card--done" : "kanban-card"}
      style={style}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={onKeyDown}
    >
      <div className="kanban-card__main">
        <div className="kanban-card__title">{task.title || "제목 없음"}</div>
        <div className="kanban-card__meta">
          <span className="kanban-card__dot" />
          {category?.name ?? "미분류"}
          {dday && <span className={dday.dueToday ? "kanban-card__due kanban-card__due--today" : "kanban-card__due"}>{dday.text}</span>}
          {done && <span className="kanban-card__when">· {formatDoneAt(task.completedAt, todayKey)}</span>}
        </div>
      </div>
      {!done && (
        <button
          type="button"
          className="kanban-card__play"
          aria-label="타이머 시작"
          title="타이머 시작"
          onClick={(e) => e.stopPropagation()}
        >
          <PlayIcon />
        </button>
      )}
    </div>
  );
}

export default KanbanCard;
