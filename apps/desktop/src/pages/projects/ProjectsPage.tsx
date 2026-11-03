import { useNavigation } from "../../app/navigation";
import { PAGE_LABELS } from "../../app/pageLabels";
import { activeProjects } from "../../features/projects/progress";
import { useProjectClock } from "../../features/projects/useProjectClock";
import { usePlan } from "../../features/plan/store";
import ProjectDetail from "./detail/ProjectDetail";
import ProjectList from "./list/ProjectList";
import BubblePanel from "./top/BubblePanel";
import HeatPanel from "./top/HeatPanel";
import { useTopHighlight } from "./top/useTopHighlight";
import "./ProjectsPage.css";

/**
 * 프로젝트 화면 (R1): 제목 "프로젝트" + 진행 중 개수, 아래에 카드 목록 (R3, R5–R8).
 * 방문 기록의 sub가 있는 프로젝트 id면 그 프로젝트 상세를 연다 (R4, D7). 없거나 지워진 프로젝트면 목록.
 * 목록 위 윗줄(R2): 왼쪽 60%는 최근 활동 잔디(R54–R59), 오른쪽 40%는 이번 주 투입 버블(R35–R44).
 * 두 판은 useTopHighlight로 서로 강조한다(R58–R59).
 */
function ProjectsPage() {
  const plan = usePlan().state;
  const { currentSub } = useNavigation();
  const clock = useProjectClock();
  const top = useTopHighlight();
  const activeCount = plan.kind === "ready" ? activeProjects(plan.data).length : 0;
  const opened =
    plan.kind === "ready" && currentSub !== undefined
      ? plan.data.projects.find((p) => p.id === currentSub)
      : undefined;

  if (plan.kind === "ready" && opened) {
    return <ProjectDetail key={opened.id} project={opened} data={plan.data} clock={clock} />;
  }

  return (
    <div className="projects-page">
      <header className="projects-page__head">
        <h1 className="projects-page__title">{PAGE_LABELS.projects}</h1>
        <span className="projects-page__sub">진행 중 {activeCount}개</span>
      </header>
      {plan.kind === "loading" && <div className="projects-page__notice">불러오는 중…</div>}
      {plan.kind === "error" && (
        <div className="projects-page__notice projects-page__notice--error">플랜 데이터를 읽지 못했습니다: {plan.message}</div>
      )}
      {plan.kind === "ready" && (
        <div className="projects-page__body">
          <div className="proj-top">
            <HeatPanel data={plan.data} clock={clock} highlight={top.highlight} onHoverDay={top.hoverDay} />
            <BubblePanel data={plan.data} clock={clock} highlight={top.highlight} onHoverProject={top.hoverProject} />
          </div>
          <ProjectList data={plan.data} clock={clock} />
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;
