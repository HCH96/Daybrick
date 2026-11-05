import { useState } from "react";
import MiniCalendar from "../../../components/common/MiniCalendar";
import Popover from "../../../components/common/Popover";
import { TrashIcon } from "../../../components/icons/DialogIcons";
import {
  canSaveForm,
  formDateError,
  formFromEvent,
  formToPatch,
  isSingleDay,
  setFormEnd,
  setFormStart,
  setFormTimeMode,
  type PersonalForm,
} from "../../../features/calendar/personalForm";
import { useCalendar } from "../../../features/calendar/store";
import type { PersonalEvent } from "../../../features/calendar/types";
import DeleteConfirmRow from "./DeleteConfirmRow";
import "./Personal.css";

interface PersonalEditPopoverProps {
  eventId: string;
  anchor: HTMLElement; // 누른 칩 (+N 목록에서 열면 "+N")
  onClose: () => void;
}

/**
 * 개인 일정 편집 팝오버 (목업 part-personal 5-3·5-4, R26·R28·R29, D9).
 * 저장소만 보고 동작하므로 회고 패널·플랜에서도 쓸 수 있다. 일정이 없어지면 그리지 않는다.
 */
function PersonalEditPopover({ eventId, anchor, onClose }: PersonalEditPopoverProps) {
  const { state } = useCalendar();
  const event = state.kind === "ready" ? state.data.events.find((e) => e.id === eventId) : undefined;
  if (!event) return null;
  return <EditBody key={event.id} event={event} anchor={anchor} onClose={onClose} />;
}

type Side = "start" | "end";

function EditBody({ event, anchor, onClose }: { event: PersonalEvent; anchor: HTMLElement; onClose: () => void }) {
  const { updateEvent, deleteEvent } = useCalendar();
  const [form, setForm] = useState<PersonalForm>(() => formFromEvent(event));
  const [picking, setPicking] = useState<{ side: Side; anchor: HTMLElement } | null>(null);
  const [confirming, setConfirming] = useState(false);

  const error = formDateError(form);
  const single = isSingleDay(form);
  const canSave = canSaveForm(form);

  const pick = (key: string) => {
    if (!picking) return;
    setForm((f) => (picking.side === "start" ? setFormStart(f, key) : setFormEnd(f, key)));
    setPicking(null);
  };

  const save = () => {
    if (!canSave) return;
    updateEvent(event.id, formToPatch(form));
    onClose();
  };

  const remove = () => {
    deleteEvent(event.id);
    onClose();
  };

  return (
    <Popover anchor={anchor} onClose={onClose} placement="bottom-start" width={300} ariaLabel="개인 일정 편집" className="cal-pe">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <input
          className="cal-pe__title"
          aria-label="제목"
          placeholder="제목"
          value={form.title}
          autoFocus
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />

        <div className="cal-pe__row">
          <label>날짜</label>
          <DateField label="시작일" value={form.start} active={picking?.side === "start"} onOpen={(a) => setPicking({ side: "start", anchor: a })} />
          –
          <DateField
            label="끝일"
            value={form.end}
            active={picking?.side === "end"}
            invalid={error !== null}
            onOpen={(a) => setPicking({ side: "end", anchor: a })}
          />
        </div>
        {error && <div className="cal-pe__error">{error}</div>}

        <div className="cal-pe__row">
          <label>시간</label>
          <span className={`cal-pe__seg${single ? "" : " cal-pe__seg--off"}`} role="group" aria-label="시간">
            <button
              type="button"
              className={form.timeMode === "none" ? "cal-pe__seg-on" : undefined}
              aria-pressed={form.timeMode === "none"}
              onClick={() => setForm((f) => setFormTimeMode(f, "none"))}
            >
              없음
            </button>
            <button
              type="button"
              className={form.timeMode === "time" ? "cal-pe__seg-on" : undefined}
              aria-pressed={form.timeMode === "time"}
              disabled={!single}
              onClick={() => setForm((f) => setFormTimeMode(f, "time"))}
            >
              시각
            </button>
          </span>
          {single && form.timeMode === "time" && (
            <input
              type="time"
              className="cal-pe__fld cal-pe__time"
              aria-label="시작 시각"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            />
          )}
        </div>
        {!single && <div className="cal-pe__caption">하루짜리만 시각을 넣을 수 있어요</div>}

        {confirming ? (
          <DeleteConfirmRow onCancel={() => setConfirming(false)} onConfirm={remove} />
        ) : (
          <div className="cal-pe__foot">
            <button type="button" className="cal-pe__btn cal-pe__btn--del" onClick={() => setConfirming(true)}>
              <TrashIcon />
              삭제
            </button>
            <button type="button" className="cal-pe__btn" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="cal-pe__btn cal-pe__btn--primary" disabled={!canSave}>
              저장
            </button>
          </div>
        )}
      </form>

      {picking && (
        <Popover
          anchor={picking.anchor}
          onClose={() => setPicking(null)}
          width={252}
          ariaLabel={picking.side === "start" ? "시작일 고르기" : "끝일 고르기"}
          className="cal-pe-date"
        >
          <MiniCalendar value={form[picking.side]} onSelect={pick} weekStartsOn={1} />
        </Popover>
      )}
    </Popover>
  );
}

interface DateFieldProps {
  label: string;
  value: string;
  active: boolean;
  invalid?: boolean;
  onOpen: (anchor: HTMLElement) => void;
}

/** "2026-11-05" 날짜 칸. 누르면 작은 달력이 열린다 */
function DateField({ label, value, active, invalid, onOpen }: DateFieldProps) {
  const cls = `cal-pe__fld${active ? " cal-pe__fld--focus" : ""}${invalid ? " cal-pe__fld--bad" : ""}`;
  return (
    <button
      type="button"
      className={cls}
      aria-label={`${label}: ${value}`}
      aria-expanded={active}
      onClick={(e) => onOpen(e.currentTarget)}
    >
      {value}
    </button>
  );
}

export default PersonalEditPopover;
