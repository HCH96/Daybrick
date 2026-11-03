import { useState } from "react";
import MiniCalendar from "../../../components/common/MiniCalendar";
import Popover from "../../../components/common/Popover";
import { formatDateRange } from "../../../features/today/format";
import { periodLength, postponeTo, type DatedTask, type Period } from "../../../features/today/overdue";
import { addDays, diffDays } from "../../../utils/date";

interface PostponePickerProps {
  /** "다른 날로" 버튼 */
  anchor: HTMLElement;
  task: DatedTask;
  todayKey: string;
  onPick: (period: Period) => void;
  onClose: () => void;
}

/**
 * 다른 날로 미루기 달력 (R37): 팝업 위에 뜨는 작은 창. 월요일 시작, 오늘까지는 흐리게 막는다.
 * 날을 고르면 그날부터 바뀔 기간을 옅은 보라로 칠하고, "이 날로 미루기"로 정한다.
 */
function PostponePicker({ anchor, task, todayKey, onPick, onClose }: PostponePickerProps) {
  const [day, setDay] = useState<string | null>(null);
  const next = day ? postponeTo(task, day) : null;

  // 바뀔 기간 중 오늘 뒤의 날만 칠한다 (오늘까지는 흐린 막힌 날이라)
  const highlighted = new Set<string>();
  if (next) {
    const days = diffDays(next.start, next.end);
    for (let i = 0; i <= days; i++) {
      const key = addDays(next.start, i);
      if (key > todayKey) highlighted.add(key);
    }
  }

  const note = task.status === "doing" ? "진행 중이라 끝일만 늘려요" : `시작 전이라 ${periodLength(task)}일 길이 그대로 옮겨요`;

  return (
    <Popover anchor={anchor} onClose={onClose} placement="bottom-start" width={320} ariaLabel="미룰 날 고르기" className="overdue-picker">
      <MiniCalendar value={day} onSelect={setDay} weekStartsOn={1} isDisabled={(key) => key <= todayKey} highlighted={highlighted} />
      <div className="overdue-picker__note">
        {next ? (
          <>
            {note} → <b>{formatDateRange(next.start, next.end)}</b>
          </>
        ) : (
          "미룰 날을 골라 주세요. 오늘까지는 고를 수 없어요."
        )}
      </div>
      <div className="overdue-picker__btns">
        <button type="button" className="overdue-btn overdue-btn--ghost" onClick={onClose}>
          취소
        </button>
        <button type="button" className="overdue-btn overdue-btn--primary" disabled={!next} onClick={() => next && onPick(next)}>
          이 날로 미루기
        </button>
      </div>
    </Popover>
  );
}

export default PostponePicker;
