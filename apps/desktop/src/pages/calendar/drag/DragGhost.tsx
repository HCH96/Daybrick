import type { RefObject } from "react";
import { createPortal } from "react-dom";
import { ItemChip } from "../chips/CalChip";
import type { CalDragState } from "./useCalendarDrag";
import "./Drag.css";

const noop = () => {};

/**
 * 끄는 칩 (목업 part-drag 6-1의 .drag-float, R35). -1.5° 기울어 포인터를 따라 떠 있다.
 * 자리는 처음 값만 그리고, 움직이는 동안은 `useCalendarDrag`가 ref로 left·top을 바꾼다.
 */
function DragGhost({ drag, ghostRef }: { drag: CalDragState; ghostRef: RefObject<HTMLDivElement | null> }) {
  const { left, top, width } = drag.ghost;
  return createPortal(
    <div ref={ghostRef} className="cal-drag-ghost" style={{ left, top, width }} aria-hidden="true">
      <ItemChip item={drag.item} className="cal-chip" style={{}} onClick={noop} />
    </div>,
    document.body,
  );
}

export default DragGhost;
