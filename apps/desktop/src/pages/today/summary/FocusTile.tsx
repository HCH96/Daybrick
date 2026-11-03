import { useState } from "react";
import { PenIcon } from "../../../components/icons/CommonIcons";
import { formatClock } from "../../../features/today/format";
import { dayTotal } from "../../../features/today/stats";
import { useToday } from "../../../features/today/store";
import type { TodayData } from "../../../features/today/types";
import { useNow } from "../../../features/today/useNow";
import GoalEditor from "./GoalEditor";

interface FocusTileProps {
  data: TodayData;
  todayKey: string;
}

/**
 * 집중 시간 타일 (R27): "3:20 / 6:00" + 보라 막대 + 연필.
 * 연필을 누르면 이 자리에서 목표를 고친다. 목표를 고치는 곳은 여기뿐이다 (D4).
 * 타이머가 달리는 동안만 1분마다 다시 그린다.
 */
function FocusTile({ data, todayKey }: FocusTileProps) {
  const { setGoal } = useToday();
  const [editing, setEditing] = useState(false);
  const now = useNow(data.running?.state === "running", 60_000);
  const total = dayTotal(data, todayKey, now);
  const goalMinutes = data.settings.dailyGoalMinutes;
  const goalMs = Math.max(1, goalMinutes) * 60000;
  const percent = Math.min(100, (total / goalMs) * 100);

  return (
    <div className="today-summary__tile">
      <div className="today-summary__tile-key">
        집중 시간
        {!editing && (
          <button
            type="button"
            className="today-summary__goal-edit"
            onClick={() => setEditing(true)}
            aria-label="하루 목표 고치기"
            title="하루 목표 고치기"
          >
            <PenIcon size={13} />
          </button>
        )}
      </div>
      {editing ? (
        <GoalEditor
          goalMinutes={goalMinutes}
          onSave={(minutes) => {
            setGoal(minutes);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <div className="today-summary__tile-value">
            {formatClock(total)} <small>/ {formatClock(goalMs)}</small>
          </div>
          <div className="today-summary__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}>
            <i style={{ width: `${percent}%` }} />
          </div>
        </>
      )}
    </div>
  );
}

export default FocusTile;
