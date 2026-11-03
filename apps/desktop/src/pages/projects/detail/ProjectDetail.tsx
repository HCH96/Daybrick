import { useState, type CSSProperties } from "react";
import { EMPTY_TIME, type ProjectClock } from "../../../features/projects/useProjectClock";
import type { PlanData, Project } from "../../../features/plan/types";
import EditStagesDialog from "../edit/EditStagesDialog";
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
 * 프로젝트 상세 (프로젝트 R13, R21–R34): 머리 + 진행 상황 판 + 아래 단계 칸(남은 높이를 차지).
 * 머리의 `단계 편집`/`주차 편집`은 편집 창을 연다. 프로젝트 색은 `--c`로 아래에 내려준다 (D14).
 */
function ProjectDetail({ project, data, clock }: ProjectDetailProps) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="proj-detail" style={{ "--c": project.color } as CSSProperties}>
      <DetailHead project={project} tasks={data.tasks} onEditStages={() => setEditing(true)} />
      <ProgressPanel
        project={project}
        tasks={data.tasks}
        time={clock.byProject.get(project.id) ?? EMPTY_TIME}
        todayKey={clock.todayKey}
        running={clock.runningProjectId === project.id}
      />
      <StageBoard project={project} tasks={data.tasks} todayKey={clock.todayKey} />
      {editing && <EditStagesDialog project={project} onClose={() => setEditing(false)} />}
    </div>
  );
}

export default ProjectDetail;
