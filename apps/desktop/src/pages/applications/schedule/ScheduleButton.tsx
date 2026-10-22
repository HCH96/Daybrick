import { useState } from "react";
import Popover from "../../../components/common/Popover";
import { SmallCalendarIcon } from "../../../components/icons/ViewIcons";
import { getNextItem } from "../../../features/applications/schedule";
import type { Application } from "../../../features/applications/types";
import NextEventLabel from "./NextEventLabel";
import SchedulePopover from "./SchedulePopover";
import "./SchedulePopover.css";

interface ScheduleButtonProps {
  application: Application;
}

/**
 * 상태 배지 옆 📅 버튼 (R24·R25). 옆에 앞으로 남은 전형 일정 하나만 보여준다.
 * 지원 마감은 아직 넣지 않는다 (수정1 2단계에서 카드와 같은 규칙으로 바꾼다).
 */
function ScheduleButton({ application }: ScheduleButtonProps) {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const next = getNextItem(application, new Date(), false);

  return (
    <>
      <button
        ref={setAnchor}
        type="button"
        className={open ? "cal-btn cal-btn--active" : "cal-btn"}
        aria-label="전형 일정"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <SmallCalendarIcon />
        <NextEventLabel item={next} />
      </button>
      {open && anchor && (
        <Popover anchor={anchor} onClose={() => setOpen(false)} width={320} ariaLabel="전형 일정">
          <SchedulePopover application={application} />
        </Popover>
      )}
    </>
  );
}

export default ScheduleButton;
