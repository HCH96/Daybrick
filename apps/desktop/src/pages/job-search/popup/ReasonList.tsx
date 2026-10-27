import { NO_REASON } from "../../../features/job-search/messages";
import type { Reason } from "../../../features/job-search/postingParse";
import { AlertIcon } from "../recommend/RecommendIcons";
import { CheckIcon } from "./PopupIcons";

interface ReasonListProps {
  strengths: Reason[];
  gaps: Reason[];
}

function Items({ items, minus }: { items: Reason[]; minus: boolean }) {
  if (items.length === 0) return <p className="js-popup__empty">{NO_REASON}</p>;
  return (
    <div className="js-popup__reasons">
      {items.map((r, i) => (
        <div key={i} className={`js-popup__reason${minus ? " js-popup__reason--minus" : ""}`}>
          <div className="js-popup__reason-t">{r.point}</div>
          <div className="js-popup__ev">
            <span className="js-popup__src">공고</span>
            {r.posting || NO_REASON}
          </div>
          <div className="js-popup__ev">
            <span className="js-popup__src">프로필</span>
            {r.profile || NO_REASON}
          </div>
        </div>
      ))}
    </div>
  );
}

/** 강점(초록 선)·부족한 점(주황 선)과 항목마다 "공고"·"프로필" 근거 (R12) */
function ReasonList({ strengths, gaps }: ReasonListProps) {
  return (
    <section>
      <h3 className="js-popup__sec-title">
        <CheckIcon />
        강점
      </h3>
      <Items items={strengths} minus={false} />
      <h3 className="js-popup__sec-title js-popup__sec-title--gap">
        <AlertIcon />
        부족한 점
      </h3>
      <Items items={gaps} minus />
    </section>
  );
}

export default ReasonList;
