import { parseDateKey } from "../../../utils/date";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

interface DayHeaderProps {
  days: string[]; // 월~일 7일 "YYYY-MM-DD"
  today: string;
}

/** 요일 머리 "Mon 2" 한 줄 (R21, 목업 B2). 오늘은 요일+숫자를 옅은 보라 알약으로, 토 파랑·일 빨강 글자. */
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
            <span>
              {WEEKDAY_LABELS[i]}
              <b>{parseDateKey(key).getDate()}</b>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default DayHeader;
