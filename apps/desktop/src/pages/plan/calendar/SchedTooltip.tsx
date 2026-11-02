import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { SchedPillData } from "../../../features/plan/applicationEvents";
import { formatChipDay } from "../../../features/plan/format";

interface SchedTooltipProps {
  pill: SchedPillData;
  anchor: DOMRect; // 마우스를 올린 알약의 화면 위치
}

const TIP_WIDTH = 230;
const GAP = 6;

/**
 * 지원 일정 알약에 마우스를 올리면 뜨는 풍선 (목업 cal-events 제안).
 * 달력 몸통은 세로 스크롤 영역이라 잘리지 않게 body에 포털로 띄운다.
 */
function SchedTooltip({ pill, anchor }: SchedTooltipProps) {
  const left = Math.max(8, Math.min(anchor.left, window.innerWidth - TIP_WIDTH - 8));
  const style: CSSProperties = { left, top: anchor.bottom + GAP, width: TIP_WIDTH };
  const when = [formatChipDay(pill.date), pill.time].filter(Boolean).join(" ");

  return createPortal(
    <div className="plan-ev-tip" role="tooltip" style={style}>
      <b>{pill.heading}</b>
      {pill.kindLabel} · {when}
    </div>,
    document.body,
  );
}

export default SchedTooltip;
