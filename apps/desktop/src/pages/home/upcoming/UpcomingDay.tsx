import { shortDateLabel, type UpcomingDay as UpcomingDayData } from "../../../features/home/upcoming";
import UpcomingRow from "./UpcomingRow";

interface UpcomingDayProps {
  day: UpcomingDayData;
}

/** 하루 묶음: 날짜 머리 + 줄들. 항목이 없는 날은 머리만 흐리게 (R29, R33) */
function UpcomingDay({ day }: UpcomingDayProps) {
  const blank = day.rows.length === 0;
  const date = shortDateLabel(day.dateKey);
  // "오늘"·"내일" 머리 옆에는 날짜를 작게 붙인다
  const named = day.label !== date;
  return (
    <div className={`upcoming-day${blank ? " upcoming-day--blank" : ""}`}>
      <div className={`upcoming-day__head${day.isToday ? " upcoming-day__head--today" : ""}`}>
        {day.label}
        {named && <small>{date}</small>}
      </div>
      {day.rows.map((row) => (
        <UpcomingRow key={row.key} row={row} />
      ))}
    </div>
  );
}

export default UpcomingDay;
