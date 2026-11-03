import { tasksOnDate } from "../../../features/plan/selectors";
import type { PlanData } from "../../../features/plan/types";

interface DoneTileProps {
  plan: PlanData;
  todayKey: string;
}

/** 완료 타일 (R28): 오늘 칸반의 완료 / 전체 카드 수 ("2 / 7") */
function DoneTile({ plan, todayKey }: DoneTileProps) {
  const tasks = tasksOnDate(plan, todayKey);
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="today-summary__tile">
      <div className="today-summary__tile-key">완료</div>
      <div className="today-summary__tile-value">
        {done} <small>/ {tasks.length}</small>
      </div>
    </div>
  );
}

export default DoneTile;
