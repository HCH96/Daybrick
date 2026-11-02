import { ChevronLeftIcon, ChevronRightIcon } from "../../components/icons/CommonIcons";
import { formatWeekTitle } from "../../features/plan/format";
import ScheduleSwitch from "./calendar/ScheduleSwitch";

interface WeekNavProps {
  weekStart: string; // 보고 있는 주의 월요일 "YYYY-MM-DD"
  onPrev: () => void;
  onThisWeek: () => void;
  onNext: () => void;
}

/**
 * 페이지 머리 오른쪽 줄 (목업 plan-calbar, D21): 기간 글자 + 주 번호 칩 (R4, D29)
 * → ‹ 이전 주 · 이번 주 · 다음 주 › (R3·R4) → 구분선 + `지원 일정` 스위치 (R33). 창이 좁아도 한 줄이다.
 */
function WeekNav({ weekStart, onPrev, onThisWeek, onNext }: WeekNavProps) {
  const { title, week } = formatWeekTitle(weekStart);
  return (
    <div className="plan-head-tools">
      <div className="plan-period">
        <b>{title}</b>
        <span>{week}</span>
      </div>
      <div className="plan-weeknav">
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
      <ScheduleSwitch />
    </div>
  );
}

export default WeekNav;
