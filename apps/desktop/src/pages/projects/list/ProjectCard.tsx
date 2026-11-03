import { memo, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { DotsIcon, GripIcon } from "../../../components/icons/CommonIcons";
import { fireByLastDay, formatLastWork } from "../../../features/projects/campfire";
import { currentStage, stageTasks } from "../../../features/projects/progress";
import type { ProjectTime } from "../../../features/projects/useProjectClock";
import { stageLabel, weekRange } from "../../../features/projects/weeks";
import type { Project, Task } from "../../../features/plan/types";
import { formatDateRange, formatDuration } from "../../../features/today/format";
import Campfire from "../common/Campfire";
import CardMenu from "./CardMenu";
import MiniTrack from "./MiniTrack";

interface ProjectCardProps {
  project: Project;
  tasks: Task[];
  time: ProjectTime;
  todayKey: string;
  /** 완료 묶음 안의 카드: 흐리게, 캐릭터는 결승선 (프로젝트 R6) */
  finished?: boolean;
  /** 끌기 (진행 중 카드만, 프로젝트 R7) */
  dragging?: boolean;
  dropBefore?: boolean;
  dropAfter?: boolean;
  cardRef?: (el: HTMLElement | null) => void;
  onPointerDown?: (e: ReactPointerEvent<HTMLElement>) => void;
  /** 카드를 누르면 상세 열기 (프로젝트 R4). `…` 버튼과 메뉴·팝업 안 클릭은 빼고 부른다 */
  onOpen?: (projectId: string) => void;
}

/** 이만큼 지난 카드는 글자를 흐리게 (잉걸불부터) */
const COLD_DAYS_FIRES = new Set(["ember", "out", "wood"]);

/**
 * 프로젝트 카드 한 줄 (프로젝트 R3, 목업 projects-cards의 .pcard, 높이 72px).
 * 끌기 손잡이 · 색 띠 · 이름 + 종류 + 현재 단계 · 작은 트랙 · 모닥불 + 마지막 작업 · 누적 · `…`.
 * 카드를 누르면 상세가 열린다 (끈 뒤의 클릭은 useReorder가 막는다, D13).
 */
function ProjectCard({
  project,
  tasks,
  time,
  todayKey,
  finished = false,
  dragging = false,
  dropBefore = false,
  dropAfter = false,
  cardRef,
  onPointerDown,
  onOpen,
}: ProjectCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const fire = fireByLastDay(time.lastDay, todayKey);
  const cold = COLD_DAYS_FIRES.has(fire);
  const projectTaskCount = project.stages.reduce((n, s) => n + stageTasks(tasks, s.id).length, 0);

  const classes = ["proj-card"];
  if (finished) classes.push("proj-card--finished");
  if (dragging) classes.push("proj-card--dragging");
  if (dropBefore) classes.push("proj-card--drop-before");
  if (dropAfter) classes.push("proj-card--drop-after");
  if (menuAnchor) classes.push("proj-card--active");

  return (
    <div ref={cardRef} className={classes.join(" ")} style={{ "--c": project.color } as CSSProperties}
      onPointerDown={(e) => {
        // 메뉴·팝업은 겹침 층에 그려져도 React 이벤트가 카드까지 올라오므로, 카드 안에서 누른 것만 끌기로 본다
        if (onPointerDown && e.currentTarget.contains(e.target as Node)) onPointerDown(e);
      }}
      onClick={(e) => {
        const target = e.target as Element;
        if (!onOpen || !e.currentTarget.contains(target) || target.closest(".proj-card__more")) return;
        onOpen(project.id);
      }}
    >
      <span className="proj-card__grip" aria-hidden="true">
        {!finished && <GripIcon size={14} />}
      </span>
      <div className="proj-card__name">
        <div className="proj-card__row">
          <b title={project.name}>{project.name}</b>
          <span className="proj-kind-chip">{project.kind === "stage" ? "단계형" : "주차형"}</span>
        </div>
        <CurrentLine project={project} tasks={tasks} todayKey={todayKey} finished={finished} />
      </div>
      <MiniTrack project={project} tasks={tasks} finished={finished} />
      <div className={cold ? "proj-card__last proj-card__last--cold" : "proj-card__last"}>
        <Campfire fire={fire} size={26} />
        <div>
          <small>마지막 작업</small>
          <span>{formatLastWork(time.lastDay, todayKey)}</span>
        </div>
      </div>
      <div className="proj-card__total">
        <small>누적</small>
        <span>{formatDuration(time.total)}</span>
      </div>
      <button
        type="button"
        className="proj-card__more"
        aria-label={`${project.name} 메뉴`}
        aria-expanded={menuAnchor !== null}
        onClick={(e) => setMenuAnchor(menuAnchor ? null : e.currentTarget)}
      >
        <DotsIcon size={15} />
      </button>
      {menuAnchor && (
        <CardMenu anchor={menuAnchor} project={project} taskCount={projectTaskCount} onClose={() => setMenuAnchor(null)} />
      )}
    </div>
  );
}

interface CurrentLineProps {
  project: Project;
  tasks: Task[];
  todayKey: string;
  finished: boolean;
}

/** `현재 <단계> · 완료/전체` (현재 단계의 태스크 수, 프로젝트 R17). 주차형은 그 주 기간도 붙인다. */
function CurrentLine({ project, tasks, todayKey, finished }: CurrentLineProps) {
  const count = project.stages.length;
  if (finished) {
    return (
      <span className="proj-card__cur">
        <em>완료</em> · 단계 {count}/{count}
      </span>
    );
  }
  const index = currentStage(project, tasks, todayKey);
  if (index === null) return <span className="proj-card__cur">단계 없음</span>;
  const list = stageTasks(tasks, project.stages[index].id);
  const done = list.filter((t) => t.status === "done").length;
  const range = weekRange(project, index);
  const label = project.kind === "weekly" ? stageLabel(project, index) : project.stages[index].name;
  return (
    <span className="proj-card__cur">
      현재 <em>{label}</em>
      {range && ` ${formatDateRange(range.start, range.end).replace(" – ", "–")}`} · {done}/{list.length}
    </span>
  );
}

export default memo(ProjectCard);
