import { useMemo, useState } from "react";
import MiniCalendar from "../../../components/common/MiniCalendar";
import { sortEvents } from "../../../features/applications/schedule";
import { EVENT_KIND_LABELS } from "../../../features/applications/statuses";
import { useApplications } from "../../../features/applications/store";
import type { Application, EventKind } from "../../../features/applications/types";
import { toDateKey } from "../../../utils/date";
import ScheduleItemRow from "./ScheduleItemRow";
import "./SchedulePopover.css";

const KINDS: readonly EventKind[] = ["applied", "assignment-due", "coding-test", "interview"];

interface SchedulePopoverProps {
  application: Application;
}

/**
 * 📅 버튼으로 여는 전형 일정 창 (R25~R27).
 * - 종류 버튼을 고르고 달력 날짜를 누르면 바로 저장된다.
 * - 목록의 줄을 펼친 동안에는 달력 날짜를 누르면 그 일정의 날짜가 바뀐다.
 */
function SchedulePopover({ application }: SchedulePopoverProps) {
  const { addEvent, updateEvent, deleteEvent } = useApplications();
  const [kind, setKind] = useState<EventKind | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const events = useMemo(() => sortEvents(application.events), [application.events]);
  const marked = useMemo(() => new Set(application.events.map((e) => e.date)), [application.events]);
  const editing = events.find((e) => e.id === editingId) ?? null;
  const todayKey = toDateKey(new Date());

  const pickDate = (date: string) => {
    if (editing) updateEvent(application.id, { ...editing, date });
    else if (kind) addEvent(application.id, kind, date);
  };

  const title = editing
    ? "날짜를 누르면 이 일정의 날짜가 바뀝니다"
    : kind
      ? `날짜를 누르면 ${EVENT_KIND_LABELS[kind]} 일정이 저장됩니다`
      : "일정 종류를 고르고 날짜를 누르세요";

  return (
    <div className="sched">
      <h4 className="sched__title">{title}</h4>
      <div className="sched__kinds" role="group" aria-label="일정 종류">
        {KINDS.map((k) => {
          const on = editing ? editing.kind === k : kind === k;
          return (
            <button
              key={k}
              type="button"
              className={on ? "sched__kind sched__kind--on" : "sched__kind"}
              aria-pressed={on}
              onClick={() => {
                setKind(k);
                setEditingId(null);
              }}
            >
              {EVENT_KIND_LABELS[k]}
            </button>
          );
        })}
      </div>

      {/* 펼친 일정이 바뀌면 그 일정의 달로 다시 그린다 */}
      <MiniCalendar key={editingId ?? "new"} value={editing?.date ?? null} onSelect={pickDate} marked={marked} />

      <div className="sched__list">
        {events.length === 0 && <p className="sched__empty">저장된 일정이 없습니다</p>}
        {events.map((event) => (
          <ScheduleItemRow
            key={event.id}
            event={event}
            past={event.date < todayKey}
            editing={event.id === editingId}
            onToggle={() => setEditingId((id) => (id === event.id ? null : event.id))}
            onChange={(next) => updateEvent(application.id, next)}
            onDelete={() => {
              deleteEvent(application.id, event.id);
              if (editingId === event.id) setEditingId(null);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default SchedulePopover;
