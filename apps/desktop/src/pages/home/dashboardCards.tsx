import type { ComponentType } from "react";
import type { PageId } from "../../app/types";
import CardState from "./CardState";
import ApplicationsSummaryCard from "./ApplicationsSummaryCard";
import NowCard from "./now/NowCard";
import UpcomingCard from "./upcoming/UpcomingCard";
import WeekFocusCard from "./week/WeekFocusCard";

/**
 * 카드가 벤토 그리드(12칸)에서 차지하는 크기.
 * - large: 7칸 × 2줄
 * - narrow: 5칸 × 1줄
 * - quarter: 4칸 × 1줄
 * 창이 좁으면(1280px 미만) 모두 6칸으로 바뀐다.
 */
export type CardSize = "large" | "narrow" | "quarter";

export interface DashboardCardDef {
  id: string;
  title: string;
  linkTo: PageId; // 카드에서 이동할 메뉴
  linkLabel: string; // 오른쪽 위 링크에 쓸 메뉴 이름 ("캘린더" → "캘린더 ›")
  size: CardSize;
  body: ComponentType; // 카드 본문
}

/**
 * 홈 카드 목록 (R15). 벤토 그리드에 이 순서대로 채워진다.
 *   [ 다가오는 7일 (large) ][ 지금 하는 것 (narrow) ]
 *   [                      ][ 이번 주 집중 (narrow) ]
 *   [ 프로젝트 진행 ][ 지원 현황 ][ 새 추천 공고 ] (quarter)
 * 단계마다 빈 상태 body를 실제 카드 본문으로 바꾼다.
 */
export const dashboardCards: DashboardCardDef[] = [
  {
    id: "upcoming",
    title: "다가오는 7일",
    linkTo: "calendar",
    linkLabel: "캘린더",
    size: "large",
    body: UpcomingCard,
  },
  {
    id: "now",
    title: "지금 하는 것",
    linkTo: "today",
    linkLabel: "투데이",
    size: "narrow",
    body: NowCard,
  },
  {
    id: "week-focus",
    title: "이번 주 집중",
    linkTo: "today",
    linkLabel: "투데이",
    size: "narrow",
    body: WeekFocusCard,
  },
  {
    id: "projects",
    title: "프로젝트 진행",
    linkTo: "projects",
    linkLabel: "프로젝트",
    size: "quarter",
    body: () => (
      <CardState
        kind="empty"
        linkTo="projects"
        message="진행 중인 프로젝트가 없어요"
        description="프로젝트마다 현재 주차·단계와 진행 막대가 보여요"
      />
    ),
  },
  {
    id: "applications",
    title: "지원 현황",
    linkTo: "applications",
    linkLabel: "지원 관리",
    size: "quarter",
    body: ApplicationsSummaryCard,
  },
  {
    id: "jobs",
    title: "새 추천 공고",
    linkTo: "job-search",
    linkLabel: "구직 관리",
    size: "quarter",
    body: () => (
      <CardState
        kind="empty"
        linkTo="job-search"
        message="새 추천 공고가 없어요"
        description="새로 들어온 공고 수와 점수 높은 공고 3개가 보여요"
      />
    ),
  },
];
