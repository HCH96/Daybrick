import { tasksInRange } from "../../features/plan/selectors";
import type { PlanData } from "../../features/plan/types";
import { formatWeekRange } from "../../features/today/format";
import { addDays, startOfWeek } from "../../utils/date";
import { AlertIcon } from "../../components/icons/TodayIcons";

interface WeekProgressProps {
  data: PlanData;
  /** 오늘 "YYYY-MM-DD" */
  todayKey: string;
}

/**
 * 이번 주 진행 바 (R5–R7): "이번 주 11/2 – 11/8" + 초록 막대 + "완료 N / M".
 * 이번 주(월~일, 플랜과 같은 주 계산)에 하루라도 걸린 태스크를 1개씩 센다 (R6).
 * 오른쪽 끝 "미완료 N"은 끝일이 오늘보다 앞이고 완료 아닌 태스크 수, 0이면 숨긴다. 누르는 동작은 8단계.
 */
function WeekProgress({ data, todayKey }: WeekProgressProps) {
  const weekStart = startOfWeek(todayKey);
  const weekEnd = addDays(weekStart, 6);
  const weekTasks = tasksInRange(data, weekStart, weekEnd);
  const total = weekTasks.length;
  const done = weekTasks.filter((t) => t.status === "done").length;
  const percent = total === 0 ? 0 : (done / total) * 100;
  const overdue = data.tasks.filter((t) => t.end !== null && t.end < todayKey && t.status !== "done").length;

  return (
    <>
      <div className="week-progress__label">
        이번 주<span>{formatWeekRange(weekStart, weekEnd)}</span>
      </div>
      <div className="week-progress__bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
        <i style={{ width: `${percent}%` }} />
      </div>
      <div className="week-progress__count">
        완료 <b>{done}</b> / {total}
      </div>
      {overdue > 0 && (
        <button type="button" className="week-progress__overdue">
          <AlertIcon />
          미완료 <b>{overdue}</b>
        </button>
      )}
    </>
  );
}

export default WeekProgress;
