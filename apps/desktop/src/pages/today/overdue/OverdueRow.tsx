import { useState, type CSSProperties } from "react";
import { SmallCheckIcon } from "../../../components/icons/CommonIcons";
import { DateIcon } from "../../../components/icons/PlanIcons";
import { BringInIcon } from "../../../components/icons/TodayIcons";
import { NONE_CATEGORY_COLOR } from "../../../features/plan/color";
import type { Category } from "../../../features/plan/types";
import { formatDateRange, formatOverdueDays } from "../../../features/today/format";
import { bringToToday, periodLength, type DatedTask, type Period } from "../../../features/today/overdue";
import StatusDot from "../../plan/StatusDot";
import PostponePicker from "./PostponePicker";

interface OverdueRowProps {
  task: DatedTask;
  category: Category | null;
  todayKey: string;
  /** 오늘로 가져오기·다른 날로 미루기 (R36·R37) */
  onMove: (period: Period) => void;
  /** 완료 처리 (R38) */
  onComplete: () => void;
}

type Hover = "bring" | "postpone" | "done" | null;

/**
 * 미완료 태스크 한 줄 (R35): 색 점·제목·"N일 지남"(빨강), 둘째 줄 카테고리·원래 기간·상태,
 * 셋째 줄 버튼. 버튼에 마우스를 올리면(키보드 포커스 포함) 오른쪽에 바뀔 모습을 미리 보인다.
 */
function OverdueRow({ task, category, todayKey, onMove, onComplete }: OverdueRowProps) {
  const [hover, setHover] = useState<Hover>(null);
  const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null);
  const doing = task.status === "doing";
  const length = periodLength(task);

  const hoverProps = (kind: Exclude<Hover, null>) => ({
    onMouseEnter: () => setHover(kind),
    onMouseLeave: () => setHover(null),
    onFocus: () => setHover(kind),
    onBlur: () => setHover(null),
  });

  const style = { "--cat": category?.color ?? NONE_CATEGORY_COLOR } as CSSProperties;

  return (
    <div className="overdue-row" style={style}>
      <div className="overdue-row__top">
        <span className="overdue-row__dot" />
        <span className="overdue-row__title">{task.title || "제목 없음"}</span>
        <span className="overdue-row__late">{formatOverdueDays(task.end, todayKey)}</span>
      </div>
      <div className="overdue-row__meta">
        {category?.name ?? "미분류"}
        <span className="overdue-row__sep">|</span>
        {formatDateRange(task.start, task.end)}
        {!doing && length > 1 && ` (${length}일)`}
        <span className="overdue-row__sep">|</span>
        <span className="overdue-row__state">
          <StatusDot status={task.status} size="sm" />
          {doing ? "진행 중" : "시작 전"}
        </span>
      </div>
      <div className="overdue-row__acts">
        <button type="button" className="overdue-btn" {...hoverProps("bring")} onClick={() => onMove(bringToToday(task, todayKey))}>
          <BringInIcon />
          오늘로 가져오기
        </button>
        <button
          type="button"
          className={pickerAnchor ? "overdue-btn overdue-btn--open" : "overdue-btn"}
          aria-expanded={pickerAnchor !== null}
          {...hoverProps("postpone")}
          onClick={(e) => setPickerAnchor(pickerAnchor ? null : e.currentTarget)}
        >
          <DateIcon size={13} />
          다른 날로
        </button>
        <button type="button" className="overdue-btn overdue-btn--good" {...hoverProps("done")} onClick={onComplete}>
          <SmallCheckIcon size={13} />
          완료
        </button>
        {hover && <Preview kind={hover} task={task} todayKey={todayKey} length={length} />}
      </div>
      {pickerAnchor && (
        <PostponePicker
          anchor={pickerAnchor}
          task={task}
          todayKey={todayKey}
          onPick={(period) => {
            setPickerAnchor(null);
            onMove(period);
          }}
          onClose={() => setPickerAnchor(null)}
        />
      )}
    </div>
  );
}

/** 버튼 오른쪽 미리보기: 가져오기는 바뀔 기간, 미루기는 바뀌는 방식, 완료는 완료로 바뀜 */
function Preview({ kind, task, todayKey, length }: { kind: Exclude<Hover, null>; task: DatedTask; todayKey: string; length: number }) {
  const doing = task.status === "doing";
  if (kind === "done") return <span className="overdue-row__preview">완료로 바꿔요</span>;
  if (kind === "postpone") {
    return <span className="overdue-row__preview">{doing ? "고른 날까지 끝일을 늘려요" : `${length}일 길이 그대로 고른 날로 옮겨요`}</span>;
  }
  const next = bringToToday(task, todayKey);
  return (
    <span className="overdue-row__preview">
      {doing ? "끝일만 늘림" : "길이 그대로 옮김"} → <b>{formatDateRange(next.start, next.end)}</b>
    </span>
  );
}

export default OverdueRow;
