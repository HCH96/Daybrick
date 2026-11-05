import { useState, type FormEvent } from "react";
import { useEscapeLayer } from "../../../components/common/useEscapeLayer";
import { PlusIcon } from "../../../components/icons/CommonIcons";
import { useCalendar } from "../../../features/calendar/store";
import "../personal/Personal.css";

/**
 * 패널 아래 [+ 개인 일정 추가] (목업 review-add·review-adding, R30·R48).
 * 누르면 입력 줄(제목, 없음/시각)로 바뀌고, Enter·[추가] → 그날 하루짜리 일정, Esc·[취소] → 버튼으로.
 * 패널이 다른 날짜로 바뀌면 key가 바뀌어 버튼으로 돌아간다.
 */
function ReviewAddRow({ day }: { day: string }) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="cal-review__foot">
      {adding ? (
        <AddForm day={day} onDone={() => setAdding(false)} />
      ) : (
        <button type="button" className="cal-review__add-btn" onClick={() => setAdding(true)}>
          <PlusIcon size={13} />
          개인 일정 추가
        </button>
      )}
    </div>
  );
}

function AddForm({ day, onDone }: { day: string; onDone: () => void }) {
  const { addEvent } = useCalendar();
  const [title, setTitle] = useState("");
  const [timeMode, setTimeMode] = useState<"none" | "time">("none");
  const [time, setTime] = useState("09:00");
  // 패널보다 나중에 열리므로 Esc는 이 입력 줄부터 닫는다
  useEscapeLayer(onDone);

  const canSave = title.trim() !== "" && (timeMode === "none" || time !== "");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    addEvent(title.trim(), day, day, timeMode === "time" ? time : null);
    onDone();
  };

  return (
    <form className="cal-review__add-form" onSubmit={submit}>
      <input
        className="cal-review__add-title"
        autoFocus
        value={title}
        placeholder="일정 제목"
        aria-label="일정 제목"
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          // 한글 조합 중 Enter는 글자 확정용
          if (e.key === "Enter" && e.nativeEvent.isComposing) e.preventDefault();
        }}
      />
      <div className="cal-review__add-line">
        <span className="cal-pe__seg" role="group" aria-label="시간">
          <button
            type="button"
            className={timeMode === "none" ? "cal-pe__seg-on" : undefined}
            aria-pressed={timeMode === "none"}
            onClick={() => setTimeMode("none")}
          >
            없음
          </button>
          <button
            type="button"
            className={timeMode === "time" ? "cal-pe__seg-on" : undefined}
            aria-pressed={timeMode === "time"}
            onClick={() => setTimeMode("time")}
          >
            시각
          </button>
        </span>
        {timeMode === "time" && (
          <input
            type="time"
            className="cal-pe__fld cal-pe__time"
            aria-label="시각"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        )}
      </div>
      <div className="cal-review__add-acts">
        <button type="button" className="cal-pe__btn" onClick={onDone}>
          취소
        </button>
        <button type="submit" className="cal-pe__btn cal-pe__btn--primary" disabled={!canSave}>
          추가
        </button>
      </div>
    </form>
  );
}

export default ReviewAddRow;
