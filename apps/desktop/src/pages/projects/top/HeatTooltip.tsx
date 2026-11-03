import type { CSSProperties } from "react";
import { formatBubbleTime } from "../../../features/projects/bubbleScale";
import { parseDateKey } from "../../../utils/date";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const MINUTE = 60_000;

export interface HeatTipRow {
  projectId: string;
  name: string;
  color: string;
  ms: number;
}

interface HeatTooltipProps {
  day: string;
  rows: HeatTipRow[];
}

/** "11월 3일 (화)" */
function dayLabel(day: string): string {
  const d = parseDateKey(day);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
}

/** 잔디 칸 말풍선 (프로젝트 R59): 날짜(요일)·합계, 프로젝트별 색 점·이름·시간·비율 막대 */
function HeatTooltip({ day, rows }: HeatTooltipProps) {
  const total = rows.reduce((sum, r) => sum + r.ms, 0);
  return (
    <div className="proj-heat__tip" role="tooltip">
      <b>
        {dayLabel(day)}
        <span>{formatBubbleTime(Math.floor(total / MINUTE))}</span>
      </b>
      {rows.map((row) => (
        <div key={row.projectId} className="proj-heat__tip-row" style={{ "--c": row.color } as CSSProperties}>
          <span className="proj-heat__dot" />
          <span className="proj-heat__tip-name">{row.name}</span>
          <em>{formatBubbleTime(Math.floor(row.ms / MINUTE))}</em>
          <div className="proj-heat__tip-bar">
            <i style={{ width: `${total > 0 ? Math.round((row.ms / total) * 100) : 0}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default HeatTooltip;
