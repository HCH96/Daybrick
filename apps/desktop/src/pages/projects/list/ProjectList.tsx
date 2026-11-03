import { useCallback, useMemo, useState } from "react";
import { PlusIcon } from "../../../components/icons/CommonIcons";
import { activeProjects, doneProjects } from "../../../features/projects/progress";
import { EMPTY_TIME, type ProjectClock } from "../../../features/projects/useProjectClock";
import { usePlan } from "../../../features/plan/store";
import type { PlanData } from "../../../features/plan/types";
import { useReorder } from "../../plan/useReorder";
import CreateProjectDialog from "../create/CreateProjectDialog";
import DoneFold from "./DoneFold";
import ProjectCard from "./ProjectCard";
import "./Projects.css";

interface ProjectListProps {
  data: PlanData;
  clock: ProjectClock;
}

/**
 * 진행 중 카드 목록 + `+ 프로젝트 만들기` + 완료 묶음 (프로젝트 R3, R5–R7).
 * 진행 중 카드는 끌어서 순서를 바꾼다. 저장 순서는 전체 프로젝트 배열이라, 끈 카드와 놓을 카드의
 * 전체 배열 자리로 바꿔 moveProject에 넘긴다 (완료된 프로젝트는 그 사이에서 자리를 지킨다).
 */
function ProjectList({ data, clock }: ProjectListProps) {
  const { moveProject, setProjectsDoneOpen } = usePlan();
  const [creating, setCreating] = useState(false);
  const active = useMemo(() => activeProjects(data), [data]);
  const done = useMemo(() => doneProjects(data), [data]);

  const onMove = useCallback(
    (from: number, to: number) => {
      const fromIndex = data.projects.indexOf(active[from]);
      const toIndex = data.projects.indexOf(active[to]);
      if (fromIndex >= 0 && toIndex >= 0) moveProject(fromIndex, toIndex);
    },
    [data.projects, active, moveProject],
  );
  const reorder = useReorder(active.length, onMove);

  return (
    <div className="proj-list-area">
      {active.length > 0 && (
        <div className="proj-list">
          {active.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={data.tasks}
              time={clock.byProject.get(project.id) ?? EMPTY_TIME}
              todayKey={clock.todayKey}
              dragging={reorder.dragIndex === i}
              dropBefore={reorder.dropGap === i}
              dropAfter={reorder.dropGap === active.length && i === active.length - 1}
              cardRef={reorder.itemRef(i)}
              onPointerDown={reorder.startDrag(i)}
            />
          ))}
        </div>
      )}
      {data.projects.length === 0 && <div className="proj-empty">아직 프로젝트가 없어요. 아래에서 첫 프로젝트를 만들어 보세요.</div>}
      <button type="button" className="proj-add" onClick={() => setCreating(true)}>
        <PlusIcon size={14} />
        프로젝트 만들기
      </button>
      <DoneFold count={done.length} open={data.view.projectsDoneOpen} onToggle={() => setProjectsDoneOpen(!data.view.projectsDoneOpen)}>
        {done.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            tasks={data.tasks}
            time={clock.byProject.get(project.id) ?? EMPTY_TIME}
            todayKey={clock.todayKey}
            finished
          />
        ))}
      </DoneFold>
      {creating && <CreateProjectDialog onClose={() => setCreating(false)} />}
    </div>
  );
}

export default ProjectList;
