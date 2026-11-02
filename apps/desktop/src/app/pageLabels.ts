import type { PageId } from "./types";

/**
 * 메뉴 이름. pages.ts와 카드/빈 상태 버튼이 함께 쓴다.
 * 화면 컴포넌트를 import하지 않으므로, 화면 안에서 써도 import가 서로 꼬이지 않는다.
 */
export const PAGE_LABELS: Record<PageId, string> = {
  home: "홈",
  plan: "플랜",
  scheduler: "스케줄러",
  applications: "지원 현황",
  "job-search": "구직 관리",
  timer: "타이머",
  settings: "설정",
};

/** 사이드바에 보일 영어 메뉴 이름. 화면 제목과 카드 버튼은 위의 한글 이름을 쓴다. */
export const NAV_LABELS: Record<PageId, string> = {
  home: "Home",
  plan: "Plan",
  scheduler: "Scheduler",
  applications: "Applications",
  "job-search": "Job Search",
  timer: "Timer",
  settings: "Settings",
};
