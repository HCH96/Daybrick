import { PAGE_LABELS } from "../../app/pageLabels";
import { activeProjects } from "../../features/projects/progress";
import { useProjectClock } from "../../features/projects/useProjectClock";
import { usePlan } from "../../features/plan/store";
import ProjectList from "./list/ProjectList";
import "./ProjectsPage.css";

/**
 * 프로젝트 화면 (R1): 제목 "프로젝트" + 진행 중 개수, 아래에 카드 목록 (R3, R5–R8).
 * 윗줄 잔디·버블은 6·7단계, 상세 전환은 3단계에서 붙인다.
 */
function ProjectsPage() {
  const plan = usePlan().state;
  const clock = useProjectClock();
  const activeCount = plan.kind === "ready" ? activeProjects(plan.data).length : 0;

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
          <ProjectList data={plan.data} clock={clock} />
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;
