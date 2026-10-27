import type { SortedPosting } from "../../../features/job-search/sortPostings";
import PostingCard from "./PostingCard";

interface PostingGridProps {
  items: SortedPosting[];
  /** 이 시각 뒤에 수집된 공고에 "새" 표시 (R8). null이면 표시 없음 */
  newSince: string | null;
  /** 지금 프로필 버전. 채점 버전이 이보다 낮으면 "이전 프로필 기준" (R23) */
  profileVersion: number;
}

/** 공고 카드 3열 (R4) */
function PostingGrid({ items, newSince, profileVersion }: PostingGridProps) {
  const since = newSince ? new Date(newSince).getTime() : null;
  return (
    <div className="js-recommend__grid">
      {items.map(({ posting, days }) => (
        <PostingCard
          key={posting.id}
          posting={posting}
          days={days}
          isNew={since !== null && new Date(posting.collectedAt).getTime() > since}
          stale={posting.profileVersion < profileVersion}
        />
      ))}
    </div>
  );
}

export default PostingGrid;
