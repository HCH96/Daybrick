import type { SchedPillData } from "../../../features/plan/applicationEvents";
import SchedPill from "./SchedPill";

interface SchedLayerProps {
  week: SchedPillData[][]; // 월~일 7칸
  dragging: boolean;
  onOpenApplication: (applicationId: string) => void;
}

/** 날짜 칸 위쪽 지원 일정 층 (R31). 아래 막대 층과는 점선으로 나눈다. */
function SchedLayer({ week, dragging, onOpenApplication }: SchedLayerProps) {
  return (
    <div className="plan-sched">
      {week.map((pills, i) => (
        <div key={i} className="plan-sched__cell">
          {pills.map((pill) => (
            <SchedPill key={pill.key} pill={pill} dragging={dragging} onOpen={onOpenApplication} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default SchedLayer;
