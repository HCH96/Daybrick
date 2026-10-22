import type { ComponentType } from "react";
import type { PageId } from "./types";
import { NAV_LABELS, PAGE_LABELS } from "./pageLabels";
import {
  ApplicationsIcon,
  CalendarIcon,
  HomeIcon,
  SchedulerIcon,
  TimerIcon,
} from "../components/icons/NavIcons";
import { makePlaceholderPage } from "../pages/PlaceholderPage";
import HomePage from "../pages/home/HomePage";
import ApplicationsPage from "../pages/applications/ApplicationsPage";

export interface PageDef {
  id: PageId;
  label: string; // 화면 제목 등에 쓰는 한글 이름
  navLabel: string; // 사이드바에 보일 영어 이름
  icon: ComponentType; // 메뉴 아이콘
  component: ComponentType; // 이 메뉴를 눌렀을 때 보여줄 화면
}

/**
 * 메뉴와 화면 목록. 사이드바는 이 순서대로 그린다.
 * 기능을 만들면 해당 항목의 makePlaceholderPage(...)를 실제 화면 컴포넌트로 바꾼다.
 */
export const pages: PageDef[] = [
  {
    id: "home",
    label: PAGE_LABELS.home,
    navLabel: NAV_LABELS.home,
    icon: HomeIcon,
    component: HomePage,
  },
  {
    id: "calendar",
    label: PAGE_LABELS.calendar,
    navLabel: NAV_LABELS.calendar,
    icon: CalendarIcon,
    component: makePlaceholderPage("캘린더", "캘린더 계획"),
  },
  {
    id: "scheduler",
    label: PAGE_LABELS.scheduler,
    navLabel: NAV_LABELS.scheduler,
    icon: SchedulerIcon,
    component: makePlaceholderPage("스케줄러", "일정 관리"),
  },
  {
    id: "applications",
    label: PAGE_LABELS.applications,
    navLabel: NAV_LABELS.applications,
    icon: ApplicationsIcon,
    component: ApplicationsPage,
  },
  {
    id: "timer",
    label: PAGE_LABELS.timer,
    navLabel: NAV_LABELS.timer,
    icon: TimerIcon,
    component: makePlaceholderPage("타이머", "집중 타이머"),
  },
];

export function findPage(id: PageId): PageDef {
  const page = pages.find((p) => p.id === id);
  if (!page) {
    throw new Error(`등록되지 않은 화면: ${id}`);
  }
  return page;
}
