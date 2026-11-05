import type { CalendarCell } from "../../../utils/calendarGrid";
import type { DaySelection } from "./useRangeSelect";

interface DayCellProps {
  cell: CalendarCell;
  todayKey: string;
  showMonth: boolean; // 그리드 첫 칸·각 달 1일 칸이면 "10월 26"처럼 월을 붙인다
  selection: DaySelection | null; // 드래그로 고르는 중이거나 고른 범위 (R24)
}

/**
 * 날짜 칸 하나의 배경과 숫자 (목업 cal-grid의 .bg i + .d, R4).
 * 오늘 = 보라 테두리 + 숫자 보라 원, 지난 날 = 살짝 어둡게, 다른 달 = 더 어둡게.
 * 드래그 범위에 들면 보라 테두리로 묶는다 (목업 part-personal 5-2, 범위 첫날·끝날만 옆 테두리).
 * 칩(3단계)은 이 칸 위의 주 줄 그리드에 따로 놓인다.
 */
function DayCell({ cell, todayKey, showMonth, selection }: DayCellProps) {
  const isToday = cell.key === todayKey;
  const tone = !cell.inMonth ? "other" : isToday ? "today" : cell.key < todayKey ? "past" : null;
  const day = cell.date.getDate();
  const text = showMonth ? `${cell.date.getMonth() + 1}월 ${day}` : String(day);

  let cls = tone ? `cal-day cal-day--${tone}` : "cal-day";
  if (selection && selection.start <= cell.key && cell.key <= selection.end) {
    cls += " cal-day--sel";
    if (cell.key === selection.start) cls += " cal-day--sel-first";
    if (cell.key === selection.end) cls += " cal-day--sel-last";
  }

  return (
    <div className={cls}>
      <span className="cal-day__num">{isToday ? <b>{text}</b> : text}</span>
    </div>
  );
}

export default DayCell;
