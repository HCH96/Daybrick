import type { CalendarCell } from "../../../utils/calendarGrid";
import DayCell from "./DayCell";

interface WeekRowProps {
  week: CalendarCell[]; // 월~일 7칸
  todayKey: string;
  isFirstWeek: boolean;
}

/**
 * 주 줄 하나 (목업 .week). 뒤에 7칸 배경(날짜 숫자 포함)을 깔고,
 * 앞쪽 그리드(열 7, 1행 날짜 자리 + 칩 줄 4)에 3단계부터 칩을 놓는다.
 */
function WeekRow({ week, todayKey, isFirstWeek }: WeekRowProps) {
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
    </div>
  );
}

export default WeekRow;
