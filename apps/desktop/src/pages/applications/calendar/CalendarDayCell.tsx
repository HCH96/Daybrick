import { useState } from "react";
import Popover from "../../../components/common/Popover";
import type { CalendarEntry } from "../../../features/applications/calendarEntries";
import type { CalendarCell } from "../../../utils/calendarGrid";
import CalendarEventChip from "./CalendarEventChip";

/** 한 칸에 보여줄 최대 줄 수. 넘으면 (MAX_ROWS - 1)개 + "+N개 더" */
const MAX_ROWS = 3;

interface CalendarDayCellProps {
  cell: CalendarCell;
  entries: readonly CalendarEntry[];
  todayKey: string;
  onOpen: (applicationId: string) => void;
}

/** 달력 날짜 칸 하나. 지난 날·오늘·다른 달 날짜를 구분하고, 일정이 많으면 접는다. */
function CalendarDayCell({ cell, entries, todayKey, onOpen }: CalendarDayCellProps) {
  const [moreAnchor, setMoreAnchor] = useState<HTMLButtonElement | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  const past = cell.key < todayKey;
  const isToday = cell.key === todayKey;
  const classes = ["cal-day"];
  if (!cell.inMonth) classes.push("cal-day--out");
  if (past) classes.push("cal-day--past");
  if (isToday) classes.push("cal-day--today");

  const folded = entries.length > MAX_ROWS;
  const shown = folded ? entries.slice(0, MAX_ROWS - 1) : entries;

  // 팝업을 열기 전에 "더 보기" 창을 닫는다
  const openFromMore = (applicationId: string) => {
    setMoreOpen(false);
    onOpen(applicationId);
  };

  return (
    <div className={classes.join(" ")}>
      <div className="cal-day__num">{isToday ? <span>{cell.date.getDate()}</span> : cell.date.getDate()}</div>
      {shown.map((entry) => (
        <CalendarEventChip key={entry.key} entry={entry} past={past} onOpen={onOpen} />
      ))}
      {folded && (
        <button
          ref={setMoreAnchor}
          type="button"
          className="cal-more"
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((o) => !o)}
        >
          +{entries.length - shown.length}개 더
        </button>
      )}
      {moreOpen && moreAnchor && (
        <Popover anchor={moreAnchor} onClose={() => setMoreOpen(false)} width={240} ariaLabel="이 날의 일정" className="cal-more-pop">
          <div className="cal-more-pop__date">
            {cell.date.getMonth() + 1}월 {cell.date.getDate()}일
          </div>
          {entries.map((entry) => (
            <CalendarEventChip key={entry.key} entry={entry} past={past} onOpen={openFromMore} />
          ))}
        </Popover>
      )}
    </div>
  );
}

export default CalendarDayCell;
