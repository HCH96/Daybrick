import { useState } from "react";
import { useNavigation } from "../../../app/navigation";
import { ChevronLeftIcon, DotsIcon } from "../../../components/icons/CommonIcons";
import { DateIcon, FlagIcon } from "../../../components/icons/PlanIcons";
import { stageTasks } from "../../../features/projects/progress";
import type { Project, Task } from "../../../features/plan/types";
import CardMenu from "../list/CardMenu";
import "../create/Create.css";

interface DetailHeadProps {
  project: Project;
  tasks: Task[];
  /** 단계·주차 편집 창 열기 (R13) */
  onEditStages: () => void;
}

/**
 * 상세 머리 (프로젝트 R4·R21, 목업 detail-head).
 * ← 뒤로 · 색 점 · 이름 · 종류 칩 · 오른쪽 `단계 편집`/`주차 편집` · `…` 메뉴(카드 메뉴와 같음, 삭제하면 목록으로).
 */
function DetailHead({ project, tasks, onEditStages }: DetailHeadProps) {
  const { canGoBack, goBack, navigate } = useNavigation();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const weekly = project.kind === "weekly";
  const taskCount = project.stages.reduce((n, s) => n + stageTasks(tasks, s.id).length, 0);
  const toList = () => navigate("projects");

  return (
    <header className="proj-detail__head">
      <button
        type="button"
        className="proj-icon-btn proj-detail__back"
        aria-label="뒤로"
        onClick={() => (canGoBack ? goBack() : toList())}
      >
        <ChevronLeftIcon size={18} />
      </button>
      <span className="proj-detail__dot" aria-hidden="true" />
      <h1 className="proj-detail__title" title={project.name}>
        {project.name}
      </h1>
      <span className="proj-detail__kind">{weekly ? "주차형" : "단계형"}</span>
      <span className="proj-detail__spacer" />
      <button type="button" className="proj-btn proj-btn--ghost proj-detail__edit" onClick={onEditStages}>
        {weekly ? <DateIcon size={13} /> : <FlagIcon size={13} />}
        {weekly ? "주차 편집" : "단계 편집"}
      </button>
      <button
        type="button"
        className="proj-icon-btn proj-detail__more"
        aria-label={`${project.name} 메뉴`}
        aria-expanded={menuAnchor !== null}
        onClick={(e) => setMenuAnchor(menuAnchor ? null : e.currentTarget)}
      >
        <DotsIcon size={15} />
      </button>
      {menuAnchor && (
        <CardMenu
          anchor={menuAnchor}
          project={project}
          taskCount={taskCount}
          onClose={() => setMenuAnchor(null)}
          onDeleted={toList}
        />
      )}
    </header>
  );
}

export default DetailHead;
