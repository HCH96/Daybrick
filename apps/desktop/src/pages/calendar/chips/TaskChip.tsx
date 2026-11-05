import type { CSSProperties } from "react";
import type { CalItem } from "../../../features/calendar/items";
import type { ChipFrameProps } from "./CalChip";

interface TaskChipProps extends ChipFrameProps {
  item: Extract<CalItem, { kind: "task" }>;
}

/** 태스크 칩 (R9–R10): 카테고리·프로젝트 색 바탕 + 왼쪽 3px 띠, 완료는 흐리게 */
function TaskChip({ item, className, style, onClick, children }: TaskChipProps) {
  const colored = { ...style, "--c": item.color } as CSSProperties;
  return (
    <div className={`${className} cal-chip--task${item.done ? " cal-chip--done" : ""}`} style={colored} title={item.title} onClick={onClick}>
      <span>{item.title}</span>
      {children}
    </div>
  );
}

export default TaskChip;
