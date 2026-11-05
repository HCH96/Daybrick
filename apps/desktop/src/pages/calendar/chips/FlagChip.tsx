import type { CSSProperties } from "react";
import { FlagIcon } from "../../../components/icons/CalendarIcons";
import type { CalItem } from "../../../features/calendar/items";
import type { ChipFrameProps } from "./CalChip";

interface FlagChipProps extends ChipFrameProps {
  item: Extract<CalItem, { kind: "flag" }>;
}

/** 체크포인트 깃발 칩 (R15–R16): 바탕 없이 프로젝트 색 깃발. 끝난 주차는 채운 깃발 + 체크, 글자 흐림 */
function FlagChip({ item, className, style, onClick, onMouseDown, children }: FlagChipProps) {
  const colored = { ...style, "--c": item.color } as CSSProperties;
  return (
    <div className={`${className} cal-chip--flag${item.done ? " cal-chip--ok" : ""}`} style={colored} title={item.label} onClick={onClick} onMouseDown={onMouseDown}>
      <FlagIcon done={item.done} className="cal-chip__flag" />
      <span>{item.label}</span>
      {children}
    </div>
  );
}

export default FlagChip;
