import { getWeekDays } from "../../utils/date";
import "./WeeklyFocusEmpty.css";

/**
 * "이번 주 집중" 카드의 빈 상태.
 * 기록이 없으므로 월~일 막대를 바닥 높이로만 그리고, 오늘 요일을 강조한다.
 * 타이머 기능을 만들면 요일별 집중 시간으로 막대 높이를 채운다.
 */
function WeeklyFocusEmpty() {
  const days = getWeekDays(new Date());

  return (
    <div className="weekly-focus">
      <div className="weekly-focus__bars">
        {days.map((day) => (
          <div
            key={day.weekday}
            className={day.isToday ? "weekly-focus__day weekly-focus__day--today" : "weekly-focus__day"}
          >
            <i className="weekly-focus__bar" />
            <span className="weekly-focus__label">{day.weekday}</span>
          </div>
        ))}
      </div>
      <p className="weekly-focus__note">타이머를 연결하면 기록이 쌓여요</p>
    </div>
  );
}

export default WeeklyFocusEmpty;
