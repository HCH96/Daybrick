import { useNavigation } from "../../../app/navigation";
import { projectRows } from "../../../features/home/projectRows";
import { usePlan } from "../../../features/plan/store";
import type { PlanData } from "../../../features/plan/types";
import { useToday } from "../../../features/today/store";
import type { TodayData } from "../../../features/today/types";
import { useNow } from "../../../features/today/useNow";
import { useTodayKey } from "../../../features/today/useTodayKey";
import CardState from "../CardState";
import ProjectRow from "./ProjectRow";
import "./Projects.css";

const MAX_ROWS = 4;

/**
 * 홈 "프로젝트 진행" 카드 본문 (R40–R41, 목업 dash.html dash-projects·part-empty.html empty-projects).
 * 진행 중 프로젝트를 프로젝트 화면 순서로 최대 4개, 넘으면 "외 N개". 없으면 빈 상태.
 */
function ProjectProgressCard() {
  const { state: plan } = usePlan();
  const { state: today } = useToday();
  const todayKey = useTodayKey();

  if (plan.kind === "loading" || today.kind === "loading") return <CardState kind="loading" />;
  if (plan.kind === "error") return <CardState kind="error" message="프로젝트를 불러오지 못했어요" />;
  if (today.kind === "error") return <CardState kind="error" message="작업 시간 기록을 불러오지 못했어요" />;
  return <ProjectList plan={plan.data} today={today.data} todayKey={todayKey} />;
}

/** 타이머가 도는 동안 1분마다 다시 그리는 부분 (누적 시간은 분 단위) */
function ProjectList({ plan, today, todayKey }: { plan: PlanData; today: TodayData; todayKey: string }) {
  const { navigate } = useNavigation();
  const now = useNow(today.running?.state === "running", 60_000);
  const rows = projectRows(plan, today, todayKey, now);

  if (rows.length === 0) {
    return (
      <CardState
        kind="empty"
        linkTo="projects"
        message="진행 중인 프로젝트가 없어요"
        description="프로젝트마다 현재 주차·단계와 진행 막대가 보여요"
      />
    );
  }

  const rest = rows.length - MAX_ROWS;
  return (
    <div className="home-projs">
      {rows.slice(0, MAX_ROWS).map((row) => (
        <ProjectRow key={row.id} row={row} onOpen={() => navigate("projects")} />
      ))}
      {rest > 0 && <div className="home-projs__more">외 {rest}개</div>}
    </div>
  );
}

export default ProjectProgressCard;
