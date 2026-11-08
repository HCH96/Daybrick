import { dayParts, type UpcomingDay as UpcomingDayData } from "../../../features/home/upcoming";
import UpcomingRow from "./UpcomingRow";

interface UpcomingDayProps {
  day: UpcomingDayData;
  todayKey: string;
}

/**
 * 하루 묶음: 왼쪽 날짜 열(큰 숫자 + "오늘"·"내일"·요일) + 오른쪽 칩 목록 (R29, R33).
 * 오늘은 연한 보라 바탕이고, 비어 있으면 칩 자리에 "일정 없음"을 흐리게 보인다.
 */
function UpcomingDay({ day, todayKey }: UpcomingDayProps) {
  const parts = dayParts(day.dateKey, todayKey);
  // 오늘 색(--accent)이 토·일 색보다 먼저다
  const labelClass = day.isToday
    ? ""
    : parts.weekend
      ? ` upcoming-day__label--${parts.weekend}`
      : "";
  return (
    <div className={`upcoming-day${day.isToday ? " upcoming-day--today" : ""}`}>
      <div className="upcoming-day__date">
        <b>{parts.day}</b>
        <small className={`upcoming-day__label${labelClass}`}>{parts.label}</small>
      </div>
      <div className="upcoming-day__list">
        {day.rows.length === 0 ? (
          <span className="upcoming-day__none">일정 없음</span>
        ) : (
          day.rows.map((row) => <UpcomingRow key={row.key} row={row} />)
        )}
      </div>
    </div>
  );
}

export default UpcomingDay;
