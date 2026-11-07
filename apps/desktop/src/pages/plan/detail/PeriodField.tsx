import { useState } from "react";
import MiniCalendar from "../../../components/common/MiniCalendar";
import Popover from "../../../components/common/Popover";
import { PlusIcon } from "../../../components/icons/CommonIcons";
import { formatChipDay, formatDayCount } from "../../../features/plan/format";
import type { TaskRange } from "../../../features/plan/store";

interface PeriodFieldProps {
  start: string | null;
  end: string | null;
  /** 새 기간. null이면 날짜 없음 */
  onChange: (range: TaskRange | null) => void;
}

type Side = "start" | "end";

/**
 * 기간 줄 값 (R35, D2·D17): "11월 2일 (월) → 11월 4일 (수)" + 회색 일수 + "날짜 없음으로"(줄에 마우스를 올렸을 때만).
 * 날짜 없는 태스크는 "날짜 없음 + 날짜 정하기"로 시작일을 고르고, 끝일도 같은 날이 된다.
 */
function PeriodField({ start, end, onChange }: PeriodFieldProps) {
  const [open, setOpen] = useState<{ side: Side; anchor: HTMLElement } | null>(null);
  const range = start !== null && end !== null ? { start, end } : null;

  const pick = (key: string) => {
    if (!open) return;
    onChange(pickPeriod(range, open.side, key));
    setOpen(null);
  };

  return (
    <>
      {range ? (
        <>
          <DateButton label="시작일" value={range.start} active={open?.side === "start"} onOpen={(a) => setOpen({ side: "start", anchor: a })} />
          <span className="task-detail__sep">→</span>
          <DateButton label="끝일" value={range.end} active={open?.side === "end"} onOpen={(a) => setOpen({ side: "end", anchor: a })} />
          <span className="task-detail__sub">{formatDayCount(range.start, range.end)}</span>
          <button type="button" className="task-detail__hint" onClick={() => onChange(null)}>
            날짜 없음으로
          </button>
        </>
      ) : (
        <>
          <span className="task-detail__empty">날짜 없음</span>
          <button
            type="button"
            className="task-detail__add"
            aria-expanded={open !== null}
            onClick={(e) => setOpen({ side: "start", anchor: e.currentTarget })}
          >
            <PlusIcon size={16} />
            날짜 정하기
          </button>
        </>
      )}

      {open && (
        <Popover
          anchor={open.anchor}
          onClose={() => setOpen(null)}
          width={252}
          ariaLabel={open.side === "start" ? "시작일 고르기" : "끝일 고르기"}
          className="task-date-pop"
        >
          <MiniCalendar value={range ? range[open.side] : null} onSelect={pick} />
        </Popover>
      )}
    </>
  );
}

interface DateButtonProps {
  label: string;
  value: string;
  active: boolean;
  onOpen: (anchor: HTMLElement) => void;
}

/** 날짜 글자 "11월 2일 (월)". 누르면 작은 달력이 열린다. */
function DateButton({ label, value, active, onOpen }: DateButtonProps) {
  return (
    <button
      type="button"
      className={active ? "task-detail__plain task-detail__plain--on" : "task-detail__plain"}
      aria-label={`${label}: ${formatChipDay(value)}`}
      aria-expanded={active}
      onClick={(e) => onOpen(e.currentTarget)}
    >
      {formatChipDay(value)}
    </button>
  );
}

/**
 * 고른 날로 새 기간을 만든다 (D17).
 * 날짜가 없었으면 하루짜리. 시작일을 끝일 뒤로 고르면 끝일을, 끝일을 시작일 앞으로 고르면 시작일을 고른 날로 맞춘다.
 * 날짜는 "YYYY-MM-DD"라 글자 비교로 앞뒤를 안다.
 */
function pickPeriod(range: TaskRange | null, side: Side, key: string): TaskRange {
  if (!range) return { start: key, end: key };
  if (side === "start") return { start: key, end: key > range.end ? key : range.end };
  return { start: key < range.start ? key : range.start, end: key };
}

export default PeriodField;
