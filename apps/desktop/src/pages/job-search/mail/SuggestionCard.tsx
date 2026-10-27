import type { MailSuggestion } from "../../../features/job-search/mailApi";
import { BriefcaseIcon, CheckIcon } from "../popup/PopupIcons";
import { CalendarIcon } from "./MailIcons";
import { applicationName, CATEGORY_LABELS, dateTime, resultText, scheduleText, statusText } from "./mailFormat";

interface SuggestionCardProps {
  suggestion: MailSuggestion;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}

/** 대기 중 제안 하나 (R67, R68): 왼쪽 지원 건·메일 정보·근거 발췌, 오른쪽 분류·바꿀 상태·일정·[거절][승인] */
function SuggestionCard({ suggestion: s, busy, onApprove, onReject }: SuggestionCardProps) {
  const result = resultText(s.category);
  return (
    <article className="js-mail__sug">
      <div className="js-mail__sug-main">
        <div className="js-mail__sug-app">
          <BriefcaseIcon />
          {applicationName(s)}
        </div>
        <div className="js-mail__meta">
          <b>{s.subject || "(제목 없음)"}</b>
          <span>· {s.sender}</span>
          {s.receivedAt && <span>· {dateTime(s.receivedAt)}</span>}
        </div>
        {s.quote && <div className="js-mail__excerpt">“{s.quote}”</div>}
      </div>
      <div className="js-mail__change">
        <span className="js-mail__change-k">
          분류 · <b>{CATEGORY_LABELS[s.category]}</b>
        </span>
        <div className="js-mail__move">
          <span className="js-mail__chip">{statusText(s.fromStatus, null)}</span>
          <span className="js-mail__arrow">→</span>
          <span className={`js-mail__chip${s.toStatus === "closed" ? "" : " js-mail__chip--accent"}`}>
            {statusText(s.toStatus, s.stage)}
          </span>
          {result && (
            <span className={`js-mail__chip js-mail__chip--${s.category === "offer" ? "green" : "red"}`}>결과: {result}</span>
          )}
        </div>
        {s.schedule ? (
          <div className="js-mail__sched">
            <CalendarIcon />
            일정 추가: {scheduleText(s.schedule)}
          </div>
        ) : (
          <div className="js-mail__sched js-mail__sched--none">일정 없음</div>
        )}
        <div className="js-mail__btns">
          <button type="button" className="setup-btn setup-btn--sm" disabled={busy} onClick={onReject}>
            거절
          </button>
          <button type="button" className="setup-btn setup-btn--sm setup-btn--primary" disabled={busy} onClick={onApprove}>
            <CheckIcon />
            승인
          </button>
        </div>
      </div>
    </article>
  );
}

export default SuggestionCard;
