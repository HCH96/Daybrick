import type { CSSProperties } from "react";
import { STAGES, findStatus } from "../../../features/applications/statuses";
import type { StageId, StatusId } from "../../../features/applications/types";
import "./StatusBadge.css";

interface StatusBadgeProps {
  status: StatusId;
  stage: StageId | null;
}

/** 상태 배지: 알약 모양 + 앞에 점, 세부 단계가 있으면 "· 코딩테스트" (R6·R17) */
function StatusBadge({ status, stage }: StatusBadgeProps) {
  const def = findStatus(status);
  const stageLabel = def.hasStage && stage ? STAGES.find((s) => s.id === stage)?.label : undefined;
  // 상태마다 정해진 색을 CSS 변수로 넘긴다
  const style = { "--badge-color": def.color, "--badge-bg": def.softColor } as CSSProperties;

  return (
    <span className={status === "closed" ? "status-badge status-badge--closed" : "status-badge"} style={style}>
      {def.label}
      {stageLabel && <span className="status-badge__stage">{stageLabel}</span>}
    </span>
  );
}

export default StatusBadge;
