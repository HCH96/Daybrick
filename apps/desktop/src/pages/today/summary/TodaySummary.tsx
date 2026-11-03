import type { PlanData } from "../../../features/plan/types";
import { categoryTotals, dayTotals, daySlices } from "../../../features/today/stats";
import type { TodayData } from "../../../features/today/types";
import CategoryBars from "./CategoryBars";
import DoneTile from "./DoneTile";
import FocusTile from "./FocusTile";
import StreakTile from "./StreakTile";
import Timeline from "./Timeline";
import "./Summary.css";

interface TodaySummaryProps {
  plan: PlanData;
  today: TodayData;
  /** 오늘 "YYYY-MM-DD" */
  todayKey: string;
}

/**
 * 오늘 요약 (R27–R31): 위 타일 3개(집중 시간·완료·스트릭), 아래 카테고리별 막대와 타임라인.
 * 실행 중 1분마다 다시 그리는 것은 FocusTile·Timeline 안에서만 한다. 나머지는 데이터가 바뀔 때 다시 계산한다.
 */
function TodaySummary({ plan, today, todayKey }: TodaySummaryProps) {
  const now = Date.now();
  const goal = today.settings.dailyGoalMinutes;
  const categories = categoryTotals(daySlices(today, todayKey, now), plan.tasks, plan.categories);

  return (
    <div className="today-summary">
      <div className="today-summary__head">오늘 요약</div>
      <div className="today-summary__body">
        <div className="today-summary__tiles">
          <FocusTile data={today} todayKey={todayKey} />
          <DoneTile plan={plan} todayKey={todayKey} />
          <StreakTile totals={dayTotals(today, now)} todayKey={todayKey} goalMinutes={goal} />
        </div>
        <div>
          <div className="today-summary__label">카테고리별</div>
          <CategoryBars rows={categories} />
        </div>
        <div>
          <div className="today-summary__label">타임라인</div>
          <Timeline plan={plan} today={today} todayKey={todayKey} />
        </div>
      </div>
    </div>
  );
}

export default TodaySummary;
