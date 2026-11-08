import { useMemo } from "react";
import { useApplications } from "../../../features/applications/store";
import { useCalendar } from "../../../features/calendar/store";
import type { CalSources } from "../../../features/calendar/items";
import { buildUpcoming, groupUpcoming } from "../../../features/home/upcoming";
import { usePlan } from "../../../features/plan/store";
import { useTodayKey } from "../../../features/today/useTodayKey";
import CardState from "../CardState";
import UpcomingDay from "./UpcomingDay";
import UpcomingGap from "./UpcomingGap";
import "./Upcoming.css";

/**
 * 홈 "다가오는 7일" 카드 본문 (R29–R34). 항목 있는 날·오늘은 날짜 묶음, 이어진 빈 날은 한 줄로 합친다 (D19).
 * 플랜·지원 관리·캘린더 중 하나라도 불러오는 중이면 loading, 모두 못 읽었으면 error.
 * 일부만 못 읽었으면 그 항목만 빼고 보여 준다 (캘린더와 같은 규칙).
 */
function UpcomingCard() {
  const { state: plan } = usePlan();
  const { state: apps } = useApplications();
  const { state: cal } = useCalendar();
  const todayKey = useTodayKey();

  const loading = plan.kind === "loading" || apps.kind === "loading" || cal.kind === "loading";
  const allFailed = plan.kind === "error" && apps.kind === "error" && cal.kind === "error";

  const days = useMemo(() => {
    const src: CalSources = {
      plan: plan.kind === "ready" ? plan.data : null,
      applications: apps.kind === "ready" ? apps.data : null,
      events: cal.kind === "ready" ? cal.data.events : [],
    };
    return buildUpcoming(src, todayKey);
  }, [plan, apps, cal, todayKey]);

  if (loading) return <CardState kind="loading" />;
  if (allFailed) return <CardState kind="error" message="일정을 불러오지 못했어요" />;
  if (days.every((d) => d.rows.length === 0)) {
    return (
      <CardState
        kind="empty"
        linkTo="calendar"
        message="앞으로 7일 동안 일정이 없어요"
        description="태스크 마감, 지원 전형, 개인 일정이 날짜별로 보여요"
      />
    );
  }

  return (
    <div className="upcoming">
      {groupUpcoming(days).map((block) =>
        block.kind === "day" ? (
          <UpcomingDay key={block.day.dateKey} day={block.day} todayKey={todayKey} />
        ) : (
          <UpcomingGap key={`gap-${block.from}`} from={block.from} to={block.to} />
        ),
      )}
      <div className="upcoming__fade" aria-hidden="true" />
    </div>
  );
}

export default UpcomingCard;
