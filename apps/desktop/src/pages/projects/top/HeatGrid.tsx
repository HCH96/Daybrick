import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { HEAT_WEEKS, type HeatCell } from "../../../features/projects/heat";

interface HeatGridProps {
  cells: HeatCell[];
  months: { column: number; label: string }[];
  /** 프로젝트로 거를 때 그 색 (없으면 강조색) */
  color: string | null;
  /** 실제 타이머가 프로젝트 태스크로 도는 중이면 오늘 칸이 숨 쉰다 (R56) */
  ticking: boolean;
  hoverDay: string | null;
  onHoverDay: (day: string | null) => void;
  /** 마우스가 올라간 칸 옆에 띄울 말풍선 (R59) */
  tip: ReactNode;
}

const DAY_LABELS = ["월", "", "수", "", "금", "", ""];
/** 칸 16px + 간격 4px */
const STEP = 20;
const TIP_WIDTH = 208;
const GRID_WIDTH = HEAT_WEEKS * STEP - 4;

/** 오늘 칸의 진하기가 오르는 순간 번호를 올린다 (같은 날·같은 거르기일 때만, R56·D9) */
function useTodayBump(cell: HeatCell | undefined, mode: string): number {
  const [bump, setBump] = useState(0);
  const prev = useRef<{ day: string; mode: string; level: number } | null>(null);
  useEffect(() => {
    if (!cell) return;
    const last = prev.current;
    if (last && last.day === cell.day && last.mode === mode && cell.level > last.level) setBump((n) => n + 1);
    prev.current = { day: cell.day, mode, level: cell.level };
  }, [cell, mode]);
  return bump;
}

/** 잔디 16주 × 7일 (프로젝트 R54·R56): 세로 7칸이 한 주(월요일 위), 앞으로 올 날은 비움 */
function HeatGrid({ cells, months, color, ticking, hoverDay, onHoverDay, tip }: HeatGridProps) {
  const todayCell = cells.find((c) => c.today);
  const bump = useTodayBump(todayCell, color ?? "");
  const hoverIndex = hoverDay === null ? -1 : cells.findIndex((c) => c.day === hoverDay);
  const style = color ? ({ "--hc": color } as CSSProperties) : undefined;

  let tipStyle: CSSProperties | undefined;
  if (hoverIndex >= 0) {
    const column = Math.floor(hoverIndex / 7);
    const row = hoverIndex % 7;
    tipStyle = {
      left: Math.max(0, Math.min(column * STEP - TIP_WIDTH / 2 + 8, GRID_WIDTH - TIP_WIDTH)),
      top: (row + 1) * STEP + 2,
    };
  }

  return (
    <div className="proj-heat__box">
      <div className="proj-heat__months">
        {months.map((m) => (
          <span key={`${m.column}-${m.label}`} style={{ gridColumn: m.column }}>
            {m.label}
          </span>
        ))}
      </div>
      <div className="proj-heat__days">
        {DAY_LABELS.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div
        className={`proj-heat__grid${ticking ? " is-ticking" : ""}`}
        style={style}
        onPointerLeave={() => onHoverDay(null)}
      >
        {cells.map((cell) => {
          const cls = ["proj-heat__cell"];
          if (cell.future) cls.push("is-future");
          else if (cell.level > 0) cls.push(`l${cell.level}`);
          if (cell.today) cls.push("is-today");
          if (cell.today && bump > 0) cls.push("is-bump");
          if (cell.day === hoverDay) cls.push("is-hover");
          return (
            <i
              key={cell.today ? `${cell.day}-${bump}` : cell.day}
              className={cls.join(" ")}
              onPointerEnter={cell.future ? () => onHoverDay(null) : () => onHoverDay(cell.day)}
            />
          );
        })}
        {tipStyle && tip && (
          <div className="proj-heat__tip-pos" style={tipStyle}>
            {tip}
          </div>
        )}
      </div>
    </div>
  );
}

export default HeatGrid;
