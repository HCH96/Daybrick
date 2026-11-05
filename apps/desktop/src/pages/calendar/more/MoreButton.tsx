import { useState } from "react";
import type { DayMore } from "../../../features/calendar/monthLayout";
import type { CalOpenHandler } from "../chips/CalChip";
import MoreList from "./MoreList";

interface MoreButtonProps {
  more: DayMore;
  date: Date; // 그 칸의 날짜
  onOpen: CalOpenHandler;
}

/** 넘친 날의 4번째 줄 "+N" (R5, D13). 누르면 칸 아래에 그날 일정 목록을 연다 (다시 누르면 닫힘) */
function MoreButton({ more, date, onOpen }: MoreButtonProps) {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        ref={setAnchor}
        type="button"
        className={`cal-week-more${open ? " cal-week-more--open" : ""}`}
        style={{ gridColumn: more.col + 1, gridRow: 5 }}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        +{more.count}
      </button>
      {open && anchor && (
        <MoreList anchor={anchor} date={date} items={more.items} onClose={() => setOpen(false)} onOpen={onOpen} />
      )}
    </>
  );
}

export default MoreButton;
