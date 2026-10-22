import type { CalendarEntry } from "../../../features/applications/calendarEntries";

interface CalendarEventChipProps {
  entry: CalendarEntry;
  past: boolean; // 오늘보다 이전 일정이면 흐리게
  onOpen: (applicationId: string) => void;
}

/** 달력 칸의 일정 한 줄: `제목 · 일정 종류` (R7). 누르면 그 카드의 상세 팝업 (R11). */
function CalendarEventChip({ entry, past, onOpen }: CalendarEventChipProps) {
  const classes = ["cal-ev", entry.isDeadline ? "cal-ev--deadline" : `cal-ev--${entry.status}`];
  if (past) classes.push("cal-ev--past");
  const title = entry.title || "제목 없음";
  const kind = entry.time ? `${entry.label} ${entry.time}` : entry.label;

  return (
    <button type="button" className={classes.join(" ")} title={`${title} · ${kind}`} onClick={() => onOpen(entry.applicationId)}>
      <span className="cal-ev__title">{title}</span>
      <span className="cal-ev__kind">· {entry.label}</span>
    </button>
  );
}

export default CalendarEventChip;
