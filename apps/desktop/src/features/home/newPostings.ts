import type { RecommendPosting } from "../job-search/recommendApi";
import { sortPostings, type SortedPosting } from "../job-search/sortPostings";

/** 홈 카드에 보일 새 공고 수 */
export const NEW_POSTINGS_TOP = 3;

export interface NewPostingsView {
  /** 새 공고 전체 수 (마감 지난 공고 제외) */
  count: number;
  /** 점수 높은 순 상위 3개 */
  top: SortedPosting[];
}

/**
 * 홈 "새 추천 공고" (R44–R45, D10, D11).
 * 새 공고 = 추천 탭을 마지막으로 떠난 시각(openedAt) 뒤에 수집된 공고 (구직 관리 PostingGrid와 같은 기준, 구직 관리 R8).
 * openedAt이 없으면(탭을 연 적 없음) 0개. 마감 지난 공고는 빼고(구직 관리 R5) 적합도 높은 순으로 고른다.
 */
export function newPostings(postings: readonly RecommendPosting[], openedAt: string | null, now: Date): NewPostingsView {
  if (!openedAt) return { count: 0, top: [] };
  const since = new Date(openedAt).getTime();
  if (Number.isNaN(since)) return { count: 0, top: [] };
  const fresh = sortPostings(postings, "score", now).filter((p) => new Date(p.posting.collectedAt).getTime() > since);
  return { count: fresh.length, top: fresh.slice(0, NEW_POSTINGS_TOP) };
}
