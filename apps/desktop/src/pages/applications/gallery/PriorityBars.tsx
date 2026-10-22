import type { PropertyOption } from "../../../features/applications/types";
import OptionChip from "../properties/OptionChip";
import "./PriorityBars.css";

/** 기본 우선순위 항목 id → 막대 단계. 새로 추가한 항목은 막대를 붙이지 않는다. */
const LEVELS: Record<string, "high" | "mid" | "low"> = {
  "priority-0": "high",
  "priority-1": "mid",
  "priority-2": "low",
};

/**
 * 우선순위 막대 3칸: 높음(빨강 3칸), 중간(주황 2칸), 낮음(회색 1칸). 값이 없으면 그리지 않는다.
 * 사용자가 새로 추가한 항목은 막대 없이 칩으로만 보여준다 (계획 "작은 규칙").
 */
function PriorityBars({ option }: { option: PropertyOption | null }) {
  if (!option) return null;
  const level = LEVELS[option.id];
  if (!level) return <OptionChip name={option.name} color={option.color} />;

  return (
    <span className={`priority priority--${level}`}>
      <span className="priority__bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {option.name}
    </span>
  );
}

export default PriorityBars;
