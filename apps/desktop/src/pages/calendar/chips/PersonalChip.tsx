import type { CalItem } from "../../../features/calendar/items";
import type { ChipFrameProps } from "./CalChip";

interface PersonalChipProps extends ChipFrameProps {
  item: Extract<CalItem, { kind: "personal" }>;
}

/** 개인 일정 칩 (R17): 바탕 없이 점선 테두리 + 회색 글자, 시각이 있으면 앞에 */
function PersonalChip({ item, className, style, onClick, children }: PersonalChipProps) {
  return (
    <div className={`${className} cal-chip--personal`} style={style} title={item.title} onClick={onClick}>
      {item.time && <em>{item.time}</em>}
      <span>{item.title}</span>
      {children}
    </div>
  );
}

export default PersonalChip;
