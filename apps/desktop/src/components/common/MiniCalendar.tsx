import { useState } from "react";
import { getMonthGrid } from "../../utils/calendarGrid";
import { parseDateKey, toDateKey } from "../../utils/date";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/CommonIcons";
import "./MiniCalendar.css";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

interface MiniCalendarProps {
  /** 고른 날짜 "YYYY-MM-DD". 없으면 null */
  value: string | null;
  onSelect: (key: string) => void;
  /** 작은 점을 찍을 날짜들 (예: 일정이 있는 날, 6단계) */
  marked?: ReadonlySet<string>;
}

/**
 * 날짜를 클릭해서 고르는 작은 달력 (R22·R25·R32). 직접 타이핑하지 않는다.
 * 처음에는 고른 날짜의 달(없으면 이번 달)을 보여준다.
 */
function MiniCalendar({ value, onSelect, marked }: MiniCalendarProps) {
  const [month, setMonth] = useState(() => {
    const base = value ? parseDateKey(value) : new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });
  const todayKey = toDateKey(new Date());
  const weeks = getMonthGrid(month.year, month.month);

  const move = (delta: number) => {
    const next = new Date(month.year, month.month + delta, 1);
    setMonth({ year: next.getFullYear(), month: next.getMonth() });
  };

  return (
    <div className="mini-cal">
      <div className="mini-cal__head">
        <span>
          {month.year}년 {month.month + 1}월
        </span>
        <span className="mini-cal__nav">
          <button type="button" className="mini-cal__nav-btn" aria-label="이전 달" onClick={() => move(-1)}>
            <ChevronLeftIcon />
          </button>
          <button type="button" className="mini-cal__nav-btn" aria-label="다음 달" onClick={() => move(1)}>
            <ChevronRightIcon />
          </button>
        </span>
      </div>
      <div className="mini-cal__grid" role="grid" aria-label={`${month.year}년 ${month.month + 1}월`}>
        {WEEKDAYS.map((w) => (
          <div key={w} className="mini-cal__weekday" role="columnheader">
            {w}
          </div>
        ))}
        {weeks.flat().map((cell) => {
          const classes = ["mini-cal__day"];
          if (!cell.inMonth) classes.push("mini-cal__day--out");
          if (cell.key === todayKey) classes.push("mini-cal__day--today");
          if (cell.key === value) classes.push("mini-cal__day--selected");
          if (marked?.has(cell.key)) classes.push("mini-cal__day--marked");
          return (
            <button
              key={cell.key}
              type="button"
              role="gridcell"
              className={classes.join(" ")}
              aria-selected={cell.key === value}
              aria-label={`${cell.date.getMonth() + 1}월 ${cell.date.getDate()}일`}
              onClick={() => onSelect(cell.key)}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MiniCalendar;
