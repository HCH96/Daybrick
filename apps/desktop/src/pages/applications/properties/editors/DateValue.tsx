import { useState } from "react";
import MiniCalendar from "../../../../components/common/MiniCalendar";
import Popover from "../../../../components/common/Popover";
import type { PropertyValue } from "../../../../features/applications/types";
import { parseDateKey } from "../../../../utils/date";

interface DateValueProps {
  value: string | null; // "YYYY-MM-DD"
  label: string;
  onChange: (value: PropertyValue) => void;
}

function formatDate(key: string): string {
  const d = parseDateKey(key);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** 날짜 값: 직접 타이핑하지 않고 작은 달력에서 눌러 고른다 (R32). 고르면 바로 닫힌다. */
function DateValue({ value, label, onChange }: DateValueProps) {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        ref={setAnchor}
        type="button"
        className={value ? "prop-cell" : "prop-cell prop-cell--empty"}
        aria-label={`${label}: ${value ? formatDate(value) : "비어 있음"}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {value ? formatDate(value) : "비어 있음"}
      </button>
      {open && anchor && (
        <Popover anchor={anchor} onClose={() => setOpen(false)} width={252} ariaLabel={`${label} 고르기`} className="date-pop">
          <MiniCalendar
            value={value}
            onSelect={(key) => {
              onChange(key);
              setOpen(false);
            }}
          />
          {value && (
            <div className="date-pop__foot">
              <button
                type="button"
                className="pop-row"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                날짜 지우기
              </button>
            </div>
          )}
        </Popover>
      )}
    </>
  );
}

export default DateValue;
