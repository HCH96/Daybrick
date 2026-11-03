import type { CSSProperties } from "react";
import { EMPTY_TIME, type ProjectClock } from "../../../features/projects/useProjectClock";
import type { PlanData, Project } from "../../../features/plan/types";
import DetailHead from "./DetailHead";
import ProgressPanel from "./ProgressPanel";
import "./Detail.css";

interface ProjectDetailProps {
  project: Project;
  data: PlanData;
  clock: ProjectClock;
}

/**
 * 프로젝트 상세 (프로젝트 R21–R28): 머리 + 진행 상황 판.
 * 아래 단계 영역(R29–R34)은 4단계에서 붙인다. 프로젝트 색은 `--c`로 아래에 내려준다.
 */
function ProjectDetail({ project, data, clock }: ProjectDetailProps) {
  return (
    <div className="proj-detail" style={{ "--c": project.color } as CSSProperties}>
      <DetailHead project={project} tasks={data.tasks} />
      <ProgressPanel
        project={project}
        tasks={data.tasks}
        time={clock.byProject.get(project.id) ?? EMPTY_TIME}
        todayKey={clock.todayKey}
        running={clock.runningProjectId === project.id}
      />
    </div>
  );
}

export default ProjectDetail;
