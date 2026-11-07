import { badgeColor, badgeInitial } from "../../../features/calendar/badge";
import type { SortedPosting } from "../../../features/job-search/sortPostings";

/** 이 점수 이상이면 밝은 글자, 미만이면 흐린 글자 */
const HIGH_SCORE = 80;
/** D-7 이하면 주황 */
const SOON_DAYS = 7;

interface PostingRowProps {
  item: SortedPosting;
  onOpen: () => void;
}

/**
 * 새 추천 공고 한 줄 (R45, 목업 dash.html dash-jobs의 .jb).
 * 회사 이니셜 배지 · 회사 / 제목 · D-n · 점수. 누르면 구직 관리 추천 탭으로.
 */
function PostingRow({ item, onOpen }: PostingRowProps) {
  const { posting, days } = item;
  const company = posting.company?.trim() || "회사 없음";
  const title = posting.title?.trim() || "제목 없음";
  const dday = days === null ? "상시" : days === 0 ? "D-day" : `D-${days}`;
  const soon = days !== null && days <= SOON_DAYS;
  return (
    <button
      type="button"
      className="home-job"
      onClick={onOpen}
      aria-label={`${company} ${title}, ${dday}, ${posting.score}점`}
    >
      <i className={`home-job__ini home-job__ini--${badgeColor(company)}`} aria-hidden="true">
        {badgeInitial(company)}
      </i>
      <span className="home-job__tx">
        <span className="home-job__co">{company}</span>
        <span className="home-job__ti" title={title}>
          {title}
        </span>
      </span>
      <span className={`home-job__dd${soon ? " home-job__dd--soon" : ""}`}>{dday}</span>
      <span className={`home-job__score${posting.score >= HIGH_SCORE ? "" : " home-job__score--mid"}`}>
        {posting.score}
      </span>
    </button>
  );
}

export default PostingRow;
