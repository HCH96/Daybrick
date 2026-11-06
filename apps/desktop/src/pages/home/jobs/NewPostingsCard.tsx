import { useOpenTarget } from "../../../app/pageIntent";
import { newPostings } from "../../../features/home/newPostings";
import { NOT_COLLECTED_YET } from "../../../features/job-search/messages";
import { useTodayKey } from "../../../features/today/useTodayKey";
import { formatRelativeTime } from "../../../utils/relativeTime";
import CardState from "../CardState";
import PostingRow from "./PostingRow";
import { useHomeRecommend } from "./useHomeRecommend";
import "./Jobs.css";

/** "마지막 수집 3시간 전" (수집한 적 없으면 "아직 수집 안 함") */
function collectLine(lastCollectAt: string | null, now: Date): string {
  return `마지막 수집 ${lastCollectAt ? formatRelativeTime(lastCollectAt, now) : NOT_COLLECTED_YET}`;
}

/**
 * 홈 "새 추천 공고" 카드 본문 (R43–R47, 목업 dash.html dash-jobs·part-empty.html empty-jobs-zero·empty-jobs-off).
 * 새 공고 수와 점수 높은 순 3개. 0개면 마지막 수집 시각, 서버가 연결되지 않았으면 연결 안내.
 */
function NewPostingsCard() {
  const state = useHomeRecommend();
  const openTarget = useOpenTarget();
  // 자정이 지나면 D-n을 다시 계산한다 (R28)
  useTodayKey();

  if (state.kind === "loading") return <CardState kind="loading" />;
  if (state.kind === "off") {
    return <CardState kind="empty" linkTo="job-search" message="서버를 연결하면 추천 공고가 보여요" />;
  }
  if (state.kind === "error") return <CardState kind="error" message="추천 공고를 불러오지 못했어요" />;

  const now = new Date();
  const view = newPostings(state.postings, state.openedAt, now);
  const foot = collectLine(state.lastCollectAt, now);
  if (view.count === 0) {
    return <CardState kind="empty" linkTo="job-search" message="새 추천 공고가 없어요" description={foot} hideButton />;
  }

  const openRecommend = () => openTarget({ page: "job-search", tab: "recommend" });
  return (
    <div className="home-jobs">
      <div className="home-jobs__n">
        새 공고 <b>{view.count}</b>개
      </div>
      {view.top.map((item) => (
        <PostingRow key={item.posting.id} item={item} onOpen={openRecommend} />
      ))}
      <div className="home-jobs__foot">{foot}</div>
    </div>
  );
}

export default NewPostingsCard;
