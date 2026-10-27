import { ddayLabel } from "../../../features/job-search/dday";
import { gradeLabel, gradeTone } from "../../../features/job-search/grade";
import type { RecommendPosting } from "../../../features/job-search/recommendApi";
import "./PostingCard.css";

interface PostingCardProps {
  posting: RecommendPosting;
  /** 남은 날 수. 상시면 null */
  days: number | null;
  isNew: boolean;
  /** 채점에 쓴 프로필이 지금 버전보다 낮다 (R23) */
  stale: boolean;
  /** 카드를 눌러 상세 팝업 열기 (11단계에서 붙인다) */
  onOpen?: () => void;
}

/** 공고 카드 (R4, R8, R23): 회사·"새"·사이트 / 제목 / 경력·고용 형태·근무지 / D-n · 점수·등급 */
function PostingCard({ posting, days, isNew, stale, onOpen }: PostingCardProps) {
  const dday = ddayLabel(days);
  const meta = [posting.experience, posting.employment.join(", ") || null, posting.location].filter(
    (m): m is string => m !== null,
  );
  return (
    <button
      type="button"
      className={`posting-card${isNew ? " posting-card--new" : ""}`}
      onClick={onOpen}
      disabled={!onOpen}
    >
      <div className="posting-card__top">
        <span className="posting-card__co">{posting.company ?? "회사 없음"}</span>
        {isNew && <span className="posting-card__new">새</span>}
        {posting.siteName && <span className="posting-card__site">{posting.siteName}</span>}
      </div>
      <div className="posting-card__title">{posting.title ?? "제목 없음"}</div>
      {meta.length > 0 && <div className="posting-card__meta">{meta.join(" · ")}</div>}
      <div className="posting-card__foot">
        <span className={`posting-card__dday posting-card__dday--${dday.kind}`}>{dday.text}</span>
        {stale && <span className="posting-card__stale">이전 프로필 기준</span>}
        <div className={`posting-card__score posting-card__score--${gradeTone(posting.grade)}`}>
          <b>
            {posting.score}
            <small>점</small>
          </b>
          <span>{gradeLabel(posting.grade)}</span>
        </div>
      </div>
    </button>
  );
}

export default PostingCard;
