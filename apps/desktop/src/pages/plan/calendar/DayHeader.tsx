import { parseDateKey } from "../../../utils/date";

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"] as const;

interface DayHeaderProps {
  days: string[]; // 월~일 7일 "YYYY-MM-DD"
  today: string;
}

/** 요일 머리 "월 2" (R21). 오늘은 날짜 숫자를 보라 원으로, 토 파랑·일 빨강 글자. */
function DayHeader({ days, today }: DayHeaderProps) {
  return (
    <div className="plan-days">
      {days.map((key, i) => {
        const className = [
          "plan-day-h",
          key === today && "plan-day-h--today",
          i === 5 && "plan-day-h--sat",
          i === 6 && "plan-day-h--sun",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <div key={key} className={className}>
            {WEEKDAY_LABELS[i]} <b>{parseDateKey(key).getDate()}</b>
          </div>
        );
      })}
    </div>
  );
}

export default DayHeader;
