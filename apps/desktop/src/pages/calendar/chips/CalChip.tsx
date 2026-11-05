import type { CSSProperties } from "react";
import type { ChipSlot } from "../../../features/calendar/monthLayout";
import AppChip from "./AppChip";
import FlagChip from "./FlagChip";
import PersonalChip from "./PersonalChip";
import TaskChip from "./TaskChip";
import "./Chips.css";

/** 칩 4종이 같이 받는 자리·모양 */
export interface ChipFrameProps {
  className: string; // "cal-chip" + 잘림 표시
  style: CSSProperties; // 주 줄 그리드 안 자리
}

/**
 * 주 줄(`.cal-week`) 그리드에 칩 하나를 놓는다 (D12). 1행은 날짜 숫자 자리라 칩 줄 row는 2행부터.
 * 잘린 쪽(주 경계·넘친 날)은 `cal-chip--cut-l`·`--cut-r`로 모서리를 펴고 옅게 한다.
 */
function CalChip({ slot }: { slot: ChipSlot }) {
  const cut = `${slot.cutLeft ? " cal-chip--cut-l" : ""}${slot.cutRight ? " cal-chip--cut-r" : ""}`;
  const frame: ChipFrameProps = {
    className: `cal-chip${cut}`,
    style: { gridColumn: `${slot.col + 1} / span ${slot.span}`, gridRow: slot.row + 2 },
  };
  const { item } = slot;
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

export default CalChip;
