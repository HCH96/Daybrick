import { ChevronLeftIcon, ChevronRightIcon } from "../../components/icons/CommonIcons";
import { formatWeekPeriod } from "../../features/plan/format";

interface WeekNavProps {
  weekStart: string; // 보고 있는 주의 월요일 "YYYY-MM-DD"
  onPrev: () => void;
  onThisWeek: () => void;
  onNext: () => void;
}

/** 달력 위 줄: 보고 있는 기간 글자 + ‹ 이전 주 · 이번 주 · 다음 주 › (R3·R4) */
function WeekNav({ weekStart, onPrev, onThisWeek, onNext }: WeekNavProps) {
  return (
    <div className="plan-calbar">
      <div className="plan-calbar__period">{formatWeekPeriod(weekStart)}</div>
      <div className="plan-calbar__nav">
        <button type="button" className="plan-btn plan-btn--ghost" onClick={onPrev}>
          <ChevronLeftIcon size={14} />
          이전 주
        </button>
        <button type="button" className="plan-btn" onClick={onThisWeek}>
          이번 주
        </button>
        <button type="button" className="plan-btn plan-btn--ghost" onClick={onNext}>
          다음 주
          <ChevronRightIcon size={14} />
        </button>
      </div>
    </div>
  );
}

export default WeekNav;
