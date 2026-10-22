import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../../../components/icons/CommonIcons";
import { groupEntriesByDate } from "../../../features/applications/calendarEntries";
import type { Application } from "../../../features/applications/types";
import { getMonthGrid } from "../../../utils/calendarGrid";
import { toDateKey } from "../../../utils/date";
import CalendarDayCell from "./CalendarDayCell";
import "./CalendarView.css";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

const LEGEND = [
  { label: "지원 완료", className: "cal-legend__dot--applied" },
  { label: "전형 준비", className: "cal-legend__dot--stage-prep" },
  { label: "결과 대기", className: "cal-legend__dot--awaiting" },
  { label: "종료", className: "cal-legend__dot--closed" },
  { label: "지원 마감 (준비 중)", className: "cal-legend__dot--deadline" },
] as const;

interface CalendarViewProps {
  applications: readonly Application[];
  onOpen: (applicationId: string) => void;
}

/** 지원 관리 달력 (R7–R11): 월 이동 + 범례 + 월 달력 */
function CalendarView({ applications, onOpen }: CalendarViewProps) {
  const today = new Date();
  const todayKey = toDateKey(today);
  const [month, setMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const byDate = useMemo(() => groupEntriesByDate(applications), [applications]);
  const weeks = getMonthGrid(month.year, month.month);

  const move = (delta: number) =>
    setMonth(({ year, month: m }) => {
      const d = new Date(year, m + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  return (
    <div className="cal-view">
      <div className="cal-bar">
        <div className="cal-bar__nav">
          <button type="button" className="cal-bar__icon-btn" aria-label="이전 달" onClick={() => move(-1)}>
            <ChevronLeftIcon />
          </button>
          <h3 className="cal-bar__month">
            {month.year}년 {month.month + 1}월
          </h3>
          <button type="button" className="cal-bar__icon-btn" aria-label="다음 달" onClick={() => move(1)}>
            <ChevronRightIcon />
          </button>
          <button
            type="button"
            className="cal-bar__today"
            onClick={() => setMonth({ year: today.getFullYear(), month: today.getMonth() })}
          >
            오늘
          </button>
        </div>
        <div className="cal-legend">
          {LEGEND.map((item) => (
            <span key={item.label}>
              <i className={`cal-legend__dot ${item.className}`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="cal">
        <div className="cal-week cal-week--head">
          {WEEKDAYS.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
        {weeks.map((week) => (
          <div key={week[0].key} className="cal-week">
            {week.map((cell) => (
              <CalendarDayCell
                key={cell.key}
                cell={cell}
                entries={byDate.get(cell.key) ?? []}
                todayKey={todayKey}
                onOpen={onOpen}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalendarView;
