import { useState, type KeyboardEvent } from "react";
import { GOAL_MAX_MINUTES, GOAL_MIN_MINUTES } from "../../../features/today/reducer";

interface GoalEditorProps {
  goalMinutes: number;
  onSave: (minutes: number) => void;
  onCancel: () => void;
}

/** 숫자만 남긴다 (빈 칸은 0) */
function toNumber(text: string): number {
  const n = Number.parseInt(text, 10);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * 하루 목표 고치기 (R27): `[6]시간 [00]분` + 저장·취소. Enter 저장, Esc 취소.
 * 1분~24시간만 저장할 수 있고, 범위 밖이면 저장 버튼을 끈다.
 */
function GoalEditor({ goalMinutes, onSave, onCancel }: GoalEditorProps) {
  const [hours, setHours] = useState(String(Math.floor(goalMinutes / 60)));
  const [minutes, setMinutes] = useState(String(goalMinutes % 60).padStart(2, "0"));
  const h = toNumber(hours);
  const m = toNumber(minutes);
  const total = h * 60 + m;
  const valid = m < 60 && total >= GOAL_MIN_MINUTES && total <= GOAL_MAX_MINUTES;

  const save = () => {
    if (valid) onSave(total);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    }
  };

  return (
    <div className="goal-editor" onKeyDown={onKeyDown}>
      <span className="goal-editor__input">
        <input
          className="goal-editor__num"
          inputMode="numeric"
          maxLength={2}
          value={hours}
          onChange={(e) => setHours(e.target.value.replace(/\D/g, ""))}
          onFocus={(e) => e.target.select()}
          aria-label="목표 시간"
          autoFocus
        />
        <span className="goal-editor__unit">시간</span>
        <input
          className="goal-editor__num"
          inputMode="numeric"
          maxLength={2}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ""))}
          onFocus={(e) => e.target.select()}
          aria-label="목표 분"
        />
        <span className="goal-editor__unit">분</span>
      </span>
      <span className="goal-editor__actions">
        <button type="button" className="goal-editor__btn goal-editor__btn--primary" onClick={save} disabled={!valid}>
          저장
        </button>
        <button type="button" className="goal-editor__btn" onClick={onCancel}>
          취소
        </button>
      </span>
    </div>
  );
}

export default GoalEditor;
