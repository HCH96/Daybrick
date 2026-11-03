import type { CSSProperties } from "react";
import { NONE_CATEGORY_COLOR } from "../../../features/plan/color";
import type { PlanData } from "../../../features/plan/types";
import { daySlices, timelineBars, timelinePosition } from "../../../features/today/stats";
import type { TodayData } from "../../../features/today/types";
import { useNow } from "../../../features/today/useNow";

interface TimelineProps {
  plan: PlanData;
  today: TodayData;
  todayKey: string;
}

const AXIS = ["08", "12", "16", "20", "24"];

/**
 * 타임라인 (R31): 08–24시 축 위에 카테고리 색 막대, 실행 중 구간은 빗금, 빨간 지금 선, 아래 시각 눈금.
 * 1분마다 다시 그린다(실행 중 막대 끝과 지금 선이 움직이도록).
 */
function Timeline({ plan, today, todayKey }: TimelineProps) {
  const now = useNow(true, 60_000);
  const bars = timelineBars(daySlices(today, todayKey, now), todayKey);
  const nowLeft = timelinePosition(todayKey, now);
  const colorByTask = new Map(
    plan.tasks.map((t) => [t.id, plan.categories.find((c) => c.id === t.categoryId)?.color ?? NONE_CATEGORY_COLOR]),
  );

  return (
    <>
      <div className="today-summary__tl">
        {bars.map((b) => (
          <i
            key={`${b.taskId}-${b.left}`}
            className={b.live ? "today-summary__tl-live" : undefined}
            style={{ left: `${b.left}%`, width: `${b.width}%`, "--c": colorByTask.get(b.taskId) ?? NONE_CATEGORY_COLOR } as CSSProperties}
          />
        ))}
        {nowLeft !== null && <span className="today-summary__nowline" style={{ left: `${nowLeft}%` }} />}
      </div>
      <div className="today-summary__tl-axis" aria-hidden="true">
        {AXIS.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
    </>
  );
}

export default Timeline;
