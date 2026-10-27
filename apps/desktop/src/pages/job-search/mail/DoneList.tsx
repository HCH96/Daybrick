import type { MailSuggestion } from "../../../features/job-search/mailApi";
import { NO_DONE_SUGGESTIONS } from "../../../features/job-search/messages";
import { shortDate, statusText } from "./mailFormat";

/** 처리한 제안 최근 30일 (R68, R69): 승인·거절, 회사, 상태 변화, 메일 제목·보낸 사람, 처리한 날 */
function DoneList({ items }: { items: MailSuggestion[] }) {
  return (
    <section className="js-mail__panel js-mail__done" aria-label="처리한 제안">
      <h3 className="js-mail__panel-title">
        처리한 제안 <span className="js-mail__sub">최근 30일</span>
      </h3>
      {items.length === 0 && <p className="js-mail__sub">{NO_DONE_SUGGESTIONS}</p>}
      {items.map((s) => (
        <div key={s.id} className="js-mail__done-row">
          <span className={`js-mail__chip${s.state === "approved" ? " js-mail__chip--green" : ""}`}>
            {s.state === "approved" ? "승인" : "거절"}
          </span>
          <b>{s.company || "지원 건 없음"}</b>
          <span>
            {statusText(s.fromStatus, null)} → {statusText(s.toStatus, s.stage)}
          </span>
          <span className="js-mail__sub js-mail__done-mail">
            “{s.subject || "(제목 없음)"}” · {s.sender}
          </span>
          {s.handledAt && <span className="js-mail__when">{shortDate(s.handledAt)} 처리</span>}
        </div>
      ))}
    </section>
  );
}

export default DoneList;
