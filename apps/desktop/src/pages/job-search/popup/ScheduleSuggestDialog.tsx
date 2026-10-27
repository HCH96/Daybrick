import { useState } from "react";
import Modal from "../../../components/common/Modal";
import { CloseIcon } from "../../../components/icons/DialogIcons";
import { CalendarIcon } from "../../../components/icons/NavIcons";
import {
  suggestDateLabel,
  type SuggestedEvent,
  type VagueEvent,
} from "../../../features/job-search/scheduleSuggest";
import { CheckIcon } from "./PopupIcons";
import "./ScheduleSuggestDialog.css";

interface ScheduleSuggestDialogProps {
  /** 완료 줄에 굵게 보이는 카드 이름 (`회사 · 제목`) */
  cardName: string;
  events: SuggestedEvent[];
  vague: VagueEvent[];
  /** 카드는 만들었지만 공고 지원 표시를 못 남겼을 때의 안내 */
  warning: string | null;
  /** 체크한 일정을 카드에 넣는다 */
  onAdd: (picked: SuggestedEvent[]) => void;
  /** 건너뛰기·X·Esc: 카드는 그대로 두고 일정만 넣지 않는다 */
  onSkip: () => void;
}

/** [지원하기] 뒤 일정 제안 창 (R54–R56, 목업 part-schedule.html): 600px, 모두 체크된 채 열린다 */
function ScheduleSuggestDialog({ cardName, events, vague, warning, onAdd, onSkip }: ScheduleSuggestDialogProps) {
  const [checked, setChecked] = useState<ReadonlySet<string>>(() => new Set(events.map((e) => e.key)));
  const picked = events.filter((e) => checked.has(e.key));

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <Modal onClose={onSkip} ariaLabel="일정 제안">
      <div className="js-sched">
        <div className="js-sched__head">
          <CalendarIcon />
          <h3>일정 제안</h3>
          <button type="button" className="js-popup__x" aria-label="닫기" onClick={onSkip}>
            <CloseIcon />
          </button>
        </div>
        <div className="js-sched__body">
          <div className="js-sched__done" role="status">
            <CheckIcon />
            <span>
              지원 관리에 <b>{cardName}</b> 카드를 만들었어요 (지원 준비)
            </span>
          </div>
          {warning && <p className="js-sched__warn">{warning}</p>}
          {events.length > 0 && (
            <p className="js-sched__title">공고에서 찾은 일정 · 체크한 항목만 전형 일정에 추가</p>
          )}
          <div className="js-sched__list">
            {events.map((e) => {
              const on = checked.has(e.key);
              return (
                <button
                  key={e.key}
                  type="button"
                  className="js-sched__row"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => toggle(e.key)}
                >
                  <span className={`js-sched__box${on ? " js-sched__box--on" : ""}`}>{on && <CheckIcon />}</span>
                  <span className="js-sched__main">
                    <b>{e.label}</b>
                    {e.raw && <span className="js-sched__raw">원문: {e.raw}</span>}
                  </span>
                  <span className="js-sched__date">{suggestDateLabel(e)}</span>
                </button>
              );
            })}
          </div>
          {vague.length > 0 && (
            <div className="js-sched__vague">
              <b>날짜가 정확하지 않아 제안하지 않은 일정</b>
              {vague.map((v, i) => (
                <div key={i}>
                  {v.label} — “{v.text}” · 카드 본문에만 적었어요
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="js-sched__foot">
          <button type="button" className="setup-btn" onClick={onSkip}>
            건너뛰기
          </button>
          <button
            type="button"
            className="setup-btn setup-btn--primary"
            disabled={picked.length === 0}
            onClick={() => onAdd(picked)}
          >
            선택한 {picked.length}개 추가
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ScheduleSuggestDialog;
