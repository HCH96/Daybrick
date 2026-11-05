import type { PageId } from "./types";

/**
 * 메뉴 이름. pages.ts와 카드/빈 상태 버튼이 함께 쓴다.
 * 화면 컴포넌트를 import하지 않으므로, 화면 안에서 써도 import가 서로 꼬이지 않는다.
 */
export const PAGE_LABELS: Record<PageId, string> = {
  home: "홈",
  plan: "플랜",
  projects: "프로젝트",
  calendar: "캘린더",
  applications: "지원 현황",
  "job-search": "구직 관리",
  today: "투데이",
  settings: "설정",
};

/**
 * 사이드바에 보일 영어 메뉴 이름. 화면 제목과 카드 버튼은 위의 한글 이름을 쓴다.
 * 예외: 플랜 화면 제목은 사이드바와 같은 `Plan`이라 이 값을 쓴다 (플랜 R1).
 * 홈 카드 버튼·알림 출처는 "플랜으로 가기"처럼 한글 이름을 그대로 쓴다.
 */
export const NAV_LABELS: Record<PageId, string> = {
  home: "Home",
  plan: "Plan",
  projects: "Projects",
  calendar: "Calendar",
  applications: "Applications",
  "job-search": "Job Search",
  today: "Today",
  settings: "Settings",
};
