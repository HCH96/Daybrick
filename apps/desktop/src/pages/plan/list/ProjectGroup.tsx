import type { CSSProperties } from "react";
import { usePlan } from "../../../features/plan/store";
import type { Project, Task } from "../../../features/plan/types";
import { currentStage, stageTasks } from "../../../features/projects/progress";
import { stageLabel, weekRange } from "../../../features/projects/weeks";
import { projectFoldKey } from "../../../features/projects/group";
import GroupHead from "./GroupHead";
import StageGroup from "./StageGroup";

interface ProjectGroupProps {
  project: Project;
  /** 플랜 태스크 전체 (단계 id로 거른다) */
  tasks: Task[];
  /** 접힘 (view.collapsed에 `project:<id>`) */
  collapsed: boolean;
  /** 사용자가 직접 접고 편 단계 (view.stageFold) */
  stageFold: Record<string, boolean>;
  todayKey: string;
  onOpenTask: (id: string) => void;
}

/**
 * 플랜 트리의 진행 중 프로젝트 묶음 (프로젝트 R45–R47): 카테고리 머리와 같은 모양(프로젝트 색·이름·끝나지 않은 개수·접기)에
 * 단계 묶음을 한 층 더 펼친다. `…`·`+`·순서 끌기는 없다 (태스크는 단계 `+`로, 순서는 프로젝트 목록에서 R7).
 * 단계 펼침: 직접 바꾼 값이 있으면 그 값, 없으면 현재 단계(R17)만 펼친다.
 */
function ProjectGroup({ project, tasks, collapsed, stageFold, todayKey, onOpenTask }: ProjectGroupProps) {
  const { toggleCollapsed } = usePlan();
  const current = currentStage(project, tasks, todayKey);
  const perStage = project.stages.map((stage) => stageTasks(tasks, stage.id));
  const openCount = perStage.reduce((sum, list) => sum + list.filter((t) => t.status !== "done").length, 0);

  return (
    <div className="plan-group plan-pgroup" style={{ "--cat": project.color } as CSSProperties}>
      <GroupHead
        name={project.name}
        count={openCount}
        collapsed={collapsed}
        onToggle={() => toggleCollapsed(projectFoldKey(project.id))}
      />
      {!collapsed &&
        project.stages.map((stage, index) => (
          <StageGroup
            key={stage.id}
            stage={stage}
            label={stageLabel(project, index)}
            range={weekRange(project, index)}
            tasks={perStage[index]}
            open={stageFold[stage.id] ?? index === current}
            onOpenTask={onOpenTask}
          />
        ))}
    </div>
  );
}

export default ProjectGroup;
