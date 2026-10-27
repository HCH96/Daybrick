/** 구직 관리 탭 id와 이름 (계획 index.md의 작은 규칙: 탭 id). 알림의 갈 곳(tab)도 이 id를 쓴다. */
export type JobSearchTabId = "recommend" | "profile" | "filters" | "sources" | "mail" | "settings";

export const JOB_SEARCH_TABS: readonly { id: JobSearchTabId; label: string }[] = [
  { id: "recommend", label: "추천 공고" },
  { id: "profile", label: "프로필" },
  { id: "filters", label: "필터" },
  { id: "sources", label: "수집 사이트" },
  { id: "mail", label: "메일 제안" },
  { id: "settings", label: "설정" },
];

export function isJobSearchTab(value: string): value is JobSearchTabId {
  return JOB_SEARCH_TABS.some((tab) => tab.id === value);
}
