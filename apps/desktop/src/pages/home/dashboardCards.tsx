import type { ComponentType } from "react";
import type { PageId } from "../../app/types";
import EmptyState from "../../components/common/EmptyState";
import WeeklyFocusEmpty from "./WeeklyFocusEmpty";

/**
 * 카드가 벤토 그리드(12칸)에서 차지하는 크기.
 * - large: 7칸 × 2줄
 * - wide: 7칸 × 1줄
 * - narrow: 5칸 × 1줄
 * 창이 좁으면(1280px 미만) 모두 6칸으로 바뀐다.
 */
export type CardSize = "large" | "wide" | "narrow";

export interface DashboardCardDef {
  id: string;
  title: string;
  linkTo: PageId; // 카드에서 이동할 메뉴
  size: CardSize;
  body: ComponentType; // 지금은 빈 상태 컴포넌트
}

/**
 * 홈 카드 목록. 벤토 그리드에 이 순서대로 채워진다.
 *   [ 오늘 할 일 (large) ][ 오늘 일정 (narrow) ]
 *   [                    ][ 오늘 집중 시간 (narrow) ]
 *   [ 지원 현황 (wide)    ][ 이번 주 집중 (narrow) ]
 * 기능을 만들면 해당 카드의 body를 실제 카드 본문 컴포넌트로 바꾼다.
 */
export const dashboardCards: DashboardCardDef[] = [
  {
    id: "today-todos",
    title: "오늘 할 일",
    linkTo: "calendar",
    size: "large",
    body: () => (
      <EmptyState linkTo="calendar" description="캘린더 기능을 만들면 여기에 오늘 할 일이 보여요" />
    ),
  },
  {
    id: "today-schedule",
    title: "오늘 일정",
    linkTo: "scheduler",
    size: "narrow",
    body: () => (
      <EmptyState linkTo="scheduler" description="스케줄러 기능을 만들면 여기에 오늘 일정이 보여요" />
    ),
  },
  {
    id: "focus-time",
    title: "오늘 집중 시간",
    linkTo: "timer",
    size: "narrow",
    body: () => (
      <EmptyState linkTo="timer" description="타이머 기능을 만들면 여기에 오늘 집중한 시간이 보여요" />
    ),
  },
  {
    id: "applications",
    title: "지원 현황",
    linkTo: "applications",
    size: "wide",
    body: () => (
      <EmptyState
        linkTo="applications"
        description="지원 관리 기능을 만들면 여기에 상태별 지원 개수가 보여요"
      />
    ),
  },
  {
    id: "weekly-focus",
    title: "이번 주 집중",
    linkTo: "timer",
    size: "narrow",
    body: WeeklyFocusEmpty,
  },
];
