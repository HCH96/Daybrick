import type { CSSProperties } from "react";
import type { ProjectRowView } from "../../../features/home/projectRows";
import { formatClock } from "../../../features/today/format";

interface ProjectRowProps {
  row: ProjectRowView;
  onOpen: () => void;
}

/**
 * 프로젝트 한 줄 (R40, 목업 dash.html dash-projects의 .pj).
 * 윗줄: 색 점 · 이름 · 누적 시간 / 아랫줄: 현재 자리 · 프로젝트 색 진행 막대. 누르면 프로젝트 화면으로.
 */
function ProjectRow({ row, onOpen }: ProjectRowProps) {
  const percent = `${(row.progress * 100).toFixed(1)}%`;
  return (
    <button
      type="button"
      className="home-proj"
      style={{ "--c": row.color } as CSSProperties}
      onClick={onOpen}
      aria-label={`${row.name}, ${row.position}, 진행 ${Math.round(row.progress * 100)}%, 누적 ${formatClock(row.totalMs)}`}
    >
      <span className="home-proj__top">
        <i className="home-proj__dot" aria-hidden="true" />
        <span className="home-proj__name" title={row.name}>
          {row.name}
        </span>
        <span className="home-proj__time">{formatClock(row.totalMs)}</span>
      </span>
      <span className="home-proj__bottom">
        <span className="home-proj__pos" title={row.position}>
          {row.position}
        </span>
        <span className="home-proj__bar" aria-hidden="true">
          <i style={{ width: percent }} />
        </span>
      </span>
    </button>
  );
}

export default ProjectRow;
