import { AppKindIcon } from "../../../components/icons/CalendarIcons";
import type { CalItem } from "../../../features/calendar/items";
import type { ChipFrameProps } from "./CalChip";

interface AppChipProps extends ChipFrameProps {
  item: Extract<CalItem, { kind: "app" }>;
}

/** 지원 일정 칩 (R11–R14): 회색 바탕 + 배지 → 회사 → 시각 → 오른쪽 종류 아이콘 (면접만 보라) */
function AppChip({ item, className, style, onClick, onMouseDown, children }: AppChipProps) {
  const isInterview = item.eventKind === "interview";
  return (
    <div className={`${className} cal-chip--app`} style={style} title={item.text} onClick={onClick} onMouseDown={onMouseDown}>
      <i className={`cal-ini cal-ini--${item.badge}`}>{item.initial}</i>
      <span>{item.text}</span>
      {item.time && <em>{item.time}</em>}
      <AppKindIcon kind={item.eventKind} className={`cal-chip__kind${isInterview ? " cal-chip__kind--on" : ""}`} />
      {children}
    </div>
  );
}

export default AppChip;
