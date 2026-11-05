import type { CSSProperties, MouseEvent, ReactNode } from "react";
import type { CalItem } from "../../../features/calendar/items";
import type { ChipSlot } from "../../../features/calendar/monthLayout";
import type { ChipDrag } from "../drag/useCalendarDrag";
import AppChip from "./AppChip";
import FlagChip from "./FlagChip";
import PersonalChip from "./PersonalChip";
import TaskChip from "./TaskChip";
import "./Chips.css";

/**
 * 칩을 눌렀을 때 (R19). 종류에 따라 여는 창은 CalendarPage가 정한다.
 * anchor = 누른 칩(+N 목록에서 눌렀으면 "+N"). 개인 일정 편집 팝오버가 그 옆에 뜬다 (R28)
 */
export type CalOpenHandler = (item: CalItem, anchor: HTMLElement) => void;

/** 칩 4종이 같이 받는 자리·모양 */
export interface ChipFrameProps {
  className: string; // "cal-chip" + 잘림 표시
  style: CSSProperties; // 주 줄 그리드 안 자리 (+N 목록에서는 비움)
  onClick: (e: MouseEvent<HTMLElement>) => void;
  onMouseDown?: (e: MouseEvent<HTMLElement>) => void; // 끌기 시작 (주 줄 칩만, 6단계)
  children?: ReactNode; // 칩 오른쪽 끝에 붙일 것 (+N 목록의 기간)
}

/** 항목 종류에 맞는 칩 하나 (달력 칸과 +N 목록이 같이 쓴다) */
export function ItemChip({ item, ...frame }: ChipFrameProps & { item: CalItem }) {
  switch (item.kind) {
    case "task":
      return <TaskChip item={item} {...frame} />;
    case "app":
      return <AppChip item={item} {...frame} />;
    case "flag":
      return <FlagChip item={item} {...frame} />;
    case "personal":
      return <PersonalChip item={item} {...frame} />;
  }
}

/**
 * 주 줄(`.cal-week`) 그리드에 칩 하나를 놓는다 (D12). 1행은 날짜 숫자 자리라 칩 줄 row는 2행부터.
 * 잘린 쪽(주 경계·넘친 날)은 `cal-chip--cut-l`·`--cut-r`로 모서리를 펴고 옅게 한다.
 * drag가 있으면 누른 채 끌어 옮기고(R35), 끄는 중·놓은 뒤·막힌 칩 모양을 붙인다 (R36·R37).
 */
function CalChip({ slot, onOpen, drag }: { slot: ChipSlot; onOpen: CalOpenHandler; drag?: ChipDrag }) {
  const key = slot.item.key;
  let cls = `cal-chip${slot.cutLeft ? " cal-chip--cut-l" : ""}${slot.cutRight ? " cal-chip--cut-r" : ""}`;
  if (drag?.dragKey === key) cls += " cal-chip--drag-src";
  if (drag?.bounceKey === key) cls += " cal-chip--bounce";
  if (drag?.shakeKey === key) cls += " cal-chip--shake";
  return (
    <ItemChip
      item={slot.item}
      className={cls}
      style={{ gridColumn: `${slot.col + 1} / span ${slot.span}`,gridRow: slot.row + 2 }}
      onClick={(e) => onOpen(slot.item, e.currentTarget)}
      onMouseDown={drag ? (e) => drag.onChipDown(slot.item, e) : undefined}
    />
  );
}

export default CalChip;
