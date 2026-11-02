import type { ComponentType } from "react";
import type { PageId } from "./types";
import { NAV_LABELS, PAGE_LABELS } from "./pageLabels";
import {
  ApplicationsIcon,
  HomeIcon,
  JobSearchIcon,
  PlanIcon,
  SchedulerIcon,
  SettingsIcon,
  TimerIcon,
} from "../components/icons/NavIcons";
import { makePlaceholderPage } from "../pages/PlaceholderPage";
import HomePage from "../pages/home/HomePage";
import PlanPage from "../pages/plan/PlanPage";
import ApplicationsPage from "../pages/applications/ApplicationsPage";
import JobSearchPage from "../pages/job-search/JobSearchPage";
import SettingsPage from "../pages/settings/SettingsPage";

export interface PageDef {
  id: PageId;
  label: string; // 화면 제목 등에 쓰는 한글 이름
  navLabel: string; // 사이드바에 보일 영어 이름
  icon: ComponentType; // 메뉴 아이콘
  component: ComponentType; // 이 메뉴를 눌렀을 때 보여줄 화면
  position?: "bottom"; // "bottom"이면 사이드바 맨 아래(버전 표시 위)에 그린다
}

/**
 * 메뉴와 화면 목록. 사이드바는 이 순서대로 그린다 (position이 "bottom"인 항목은 맨 아래에 따로).
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
    id: "plan",
    label: PAGE_LABELS.plan,
    navLabel: NAV_LABELS.plan,
    icon: PlanIcon,
    component: PlanPage,
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
    id: "job-search",
    label: PAGE_LABELS["job-search"],
    navLabel: NAV_LABELS["job-search"],
    icon: JobSearchIcon,
    component: JobSearchPage,
  },
  {
    id: "timer",
    label: PAGE_LABELS.timer,
    navLabel: NAV_LABELS.timer,
    icon: TimerIcon,
    component: makePlaceholderPage("타이머", "집중 타이머"),
  },
  {
    id: "settings",
    label: PAGE_LABELS.settings,
    navLabel: NAV_LABELS.settings,
    icon: SettingsIcon,
    component: SettingsPage,
    position: "bottom",
  },
];

export function findPage(id: PageId): PageDef {
  const page = pages.find((p) => p.id === id);
  if (!page) {
    throw new Error(`등록되지 않은 화면: ${id}`);
  }
  return page;
}
