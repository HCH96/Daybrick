import { useEffect, useRef, useState } from "react";
import { SmallCloseIcon } from "../../../components/icons/CommonIcons";
import { EVENT_KIND_LABELS } from "../../../features/applications/statuses";
import type { ScheduleEvent } from "../../../features/applications/types";
import { parseDateKey } from "../../../utils/date";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** "10/25 (일)" */
function formatShortDate(key: string): string {
  const d = parseDateKey(key);
  return `${d.getMonth() + 1}/${d.getDate()} (${WEEKDAYS[d.getDay()]})`;
}

interface ScheduleItemRowProps {
  event: ScheduleEvent;
  /** 오늘보다 지난 일정이면 흐리게 */
  past: boolean;
  /** 시간·메모 칸이 펼쳐진 줄 (달력을 누르면 이 일정의 날짜가 바뀐다) */
  editing: boolean;
  onToggle: () => void;
  onChange: (event: ScheduleEvent) => void;
  onDelete: () => void;
}

/** 📅 창의 일정 한 줄: 누르면 시간·메모 칸이 펼쳐지고, ✕로 지운다 (R26) */
function ScheduleItemRow({ event, past, editing, onToggle, onChange, onDelete }: ScheduleItemRowProps) {
  const classes = ["sched-item"];
  if (past) classes.push("sched-item--past");
  if (editing) classes.push("sched-item--edit");

  return (
    <div className={classes.join(" ")}>
      <button type="button" className="sched-item__main" aria-expanded={editing} onClick={onToggle}>
        <span className={`sched-item__kind sched-kind--${event.kind}`}>{EVENT_KIND_LABELS[event.kind]}</span>
        <span className="sched-item__date">
          {formatShortDate(event.date)}
          {event.time && ` ${event.time}`}
          {event.memo && <span className="sched-item__memo"> · {event.memo}</span>}
        </span>
      </button>
      <button type="button" className="sched-item__delete" aria-label="일정 지우기" onClick={onDelete}>
        <SmallCloseIcon />
      </button>
      {editing && <EditFields event={event} onChange={onChange} />}
    </div>
  );
}

/** 펼친 줄의 시간·메모 칸. 메모는 입력 중엔 이 칸에만 두고, 칸을 떠나거나 Enter·창 닫기 때 저장한다. */
function EditFields({ event, onChange }: { event: ScheduleEvent; onChange: (event: ScheduleEvent) => void }) {
  const [memo, setMemo] = useState(event.memo);
  // 창이 닫혀 칸이 사라질 때도 마지막 메모를 저장하려고 최신 값을 ref에 둔다
  const latest = useRef({ event, memo, onChange });
  latest.current = { event, memo, onChange };

  const commitMemo = () => {
    const { event: ev, memo: m, onChange: change } = latest.current;
    const trimmed = m.trim();
    if (trimmed !== ev.memo) change({ ...ev, memo: trimmed });
  };

  useEffect(() => commitMemo, []);

  return (
    <div className="sched-item__fields">
      {/* 시계 버튼은 브라우저 기본 시간 칸의 것을 쓴다 (누르면 시간 고르는 창) */}
      <input
        type="time"
        className="sched-field sched-field--time"
        aria-label="시간"
        value={event.time ?? ""}
        onChange={(e) => onChange({ ...event, time: e.target.value === "" ? null : e.target.value })}
      />
      <input
        className="sched-field sched-field--memo"
        aria-label="메모"
        placeholder="메모 (예: 1차 면접)"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        onBlur={commitMemo}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) commitMemo();
        }}
      />
    </div>
  );
}

export default ScheduleItemRow;
