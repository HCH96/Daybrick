import type { WeekLayout } from "../../../features/calendar/monthLayout";
import type { CalendarCell } from "../../../utils/calendarGrid";
import CalChip, { type CalOpenHandler } from "../chips/CalChip";
import MoreButton from "../more/MoreButton";
import DayCell from "./DayCell";

interface WeekRowProps {
  week: CalendarCell[]; // 월~일 7칸
  todayKey: string;
  isFirstWeek: boolean;
  layout: WeekLayout; // 이 주의 칩 자리와 +N (monthLayout)
  onOpen: CalOpenHandler; // 칩을 눌렀을 때 (R19)
}

/**
 * 주 줄 하나 (목업 .week). 뒤에 7칸 배경(날짜 숫자 포함)을 깔고,
 * 앞쪽 그리드(열 7, 1행 날짜 자리 + 칩 줄 4)에 칩과 +N을 열·폭·줄 자리로 놓는다 (D12).
 */
function WeekRow({ week, todayKey, isFirstWeek, layout, onOpen }: WeekRowProps) {
  return (
    <div className="cal-week">
      <div className="cal-week__bg">
        {week.map((cell, i) => (
          <DayCell
            key={cell.key}
            cell={cell}
            todayKey={todayKey}
            showMonth={(isFirstWeek && i === 0) || cell.date.getDate() === 1}
          />
        ))}
      </div>
      {layout.slots.map((slot) => (
        <CalChip key={`${slot.item.key}@${slot.col}`} slot={slot} onOpen={onOpen} />
      ))}
      {layout.more.map((m) => (
        <MoreButton key={`more@${m.col}`} more={m} date={week[m.col].date} onOpen={onOpen} />
      ))}
    </div>
  );
}

export default WeekRow;
