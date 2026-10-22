import type { CSSProperties } from "react";
import { ChevronDownIcon } from "../../../components/icons/CommonIcons";
import { STAGES, findStatus } from "../../../features/applications/statuses";
import type { StageId, StatusId } from "../../../features/applications/types";
import "./StatusBadge.css";

interface StatusBadgeProps {
  status: StatusId;
  stage: StageId | null;
  /** big: 상세 팝업 제목 아래의 큰 배지 (R17) */
  size?: "normal" | "big";
  /** 누를 수 있다는 표시(▾)를 붙인다 */
  chevron?: boolean;
}

/** 상태 배지: 알약 모양 + 앞에 점, 세부 단계가 있으면 "· 코딩테스트" (R6·R17) */
function StatusBadge({ status, stage, size = "normal", chevron = false }: StatusBadgeProps) {
  const def = findStatus(status);
  const stageLabel = def.hasStage && stage ? STAGES.find((s) => s.id === stage)?.label : undefined;
  // 상태마다 정해진 색을 CSS 변수로 넘긴다
  const style = { "--badge-color": def.color, "--badge-bg": def.softColor } as CSSProperties;

  const classes = ["status-badge"];
  if (status === "closed") classes.push("status-badge--closed");
  if (size === "big") classes.push("status-badge--big");

  return (
    <span className={classes.join(" ")} style={style}>
      {def.label}
      {stageLabel && <span className="status-badge__stage">{stageLabel}</span>}
      {chevron && (
        <span className="status-badge__chev">
          <ChevronDownIcon size={14} />
        </span>
      )}
    </span>
  );
}

export default StatusBadge;
