import type { CSSProperties } from "react";
import { EMPTY_TIME, type ProjectClock } from "../../../features/projects/useProjectClock";
import type { PlanData, Project } from "../../../features/plan/types";
import DetailHead from "./DetailHead";
import ProgressPanel from "./ProgressPanel";
import StageBoard from "./StageBoard";
import "./Detail.css";

interface ProjectDetailProps {
  project: Project;
  data: PlanData;
  clock: ProjectClock;
}

/**
 * 프로젝트 상세 (프로젝트 R21–R34): 머리 + 진행 상황 판 + 아래 단계 칸(남은 높이를 차지).
 * 프로젝트 색은 `--c`로 아래에 내려준다 (D14).
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
      <StageBoard project={project} tasks={data.tasks} todayKey={clock.todayKey} />
    </div>
  );
}

export default ProjectDetail;
