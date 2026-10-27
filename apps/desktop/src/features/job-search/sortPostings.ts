import { daysLeft } from "./dday";
import type { RecommendPosting } from "./recommendApi";

/** 추천 목록 정렬 (R5): 적합도 높은 순(기본) · 마감 임박 순 */
export type RecommendSort = "score" | "deadline";

export const SORT_OPTIONS: readonly { id: RecommendSort; label: string }[] = [
  { id: "score", label: "적합도 높은 순" },
  { id: "deadline", label: "마감 임박 순" },
];

export interface SortedPosting {
  posting: RecommendPosting;
  /** 남은 날 수. 상시면 null */
  days: number | null;
}

/** 상시 공고는 마감 임박 순에서 맨 뒤 */
function deadlineKey(days: number | null): number {
  return days ?? Number.MAX_SAFE_INTEGER;
}

/** 마감이 지난 공고를 빼고 정렬한다 (R5). 숨김·지원한 공고는 서버에서 이미 뺐다 (R16) */
export function sortPostings(postings: readonly RecommendPosting[], sort: RecommendSort, now: Date): SortedPosting[] {
  const list = postings
    .map((posting) => ({ posting, days: daysLeft(posting.deadlineDate, now) }))
    .filter((p) => p.days === null || p.days >= 0);
  const byScore = (a: SortedPosting, b: SortedPosting) => b.posting.score - a.posting.score;
  const byDeadline = (a: SortedPosting, b: SortedPosting) => deadlineKey(a.days) - deadlineKey(b.days);
  return list.sort((a, b) => (sort === "score" ? byScore(a, b) || byDeadline(a, b) : byDeadline(a, b) || byScore(a, b)));
}
