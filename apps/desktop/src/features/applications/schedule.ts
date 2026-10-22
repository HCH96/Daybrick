import { daysUntil, getWeekDays, toDateKey } from "../../utils/date";
import { getDateValue } from "./properties";
import type { Application, PropertyDef, ScheduleEvent } from "./types";

/** 진행 중 = 종료가 아닌 카드 (R4) */
export function isActive(application: Application): boolean {
  return application.status !== "closed";
}

/** 이번 주(월~일)에 있는 진행 중 카드의 전형 일정 개수 (페이지 부제용) */
export function countEventsThisWeek(applications: readonly Application[], today: Date): number {
  const week = getWeekDays(today);
  const first = toDateKey(week[0].date);
  const last = toDateKey(week[6].date);
  // "YYYY-MM-DD"는 글자 순서와 날짜 순서가 같아서 문자열 비교로 범위를 확인할 수 있다.
  return applications
    .filter(isActive)
    .reduce((sum, app) => sum + app.events.filter((e) => e.date >= first && e.date <= last).length, 0);
}

/* ---------- 갤러리 탭과 정렬 (R4·R5) ---------- */

export type GalleryTab = "active" | "closed" | "all";

export function filterByTab(applications: readonly Application[], tab: GalleryTab): Application[] {
  switch (tab) {
    case "active":
      return applications.filter(isActive);
    case "closed":
      return applications.filter((a) => !isActive(a));
    case "all":
      return [...applications];
  }
}

/**
 * 마감일이 가까운 순으로 정렬한 새 배열을 돌려준다. 마감일이 없는 카드는 맨 뒤 (R5).
 * 마감일이 같거나 둘 다 없으면 먼저 만든 카드가 앞에 온다.
 * 마감일 속성을 지웠으면(deadlineProperty가 null) 만든 순서대로 둔다.
 */
export function sortByDeadline(applications: readonly Application[], deadlineProperty: PropertyDef | null): Application[] {
  return [...applications].sort((a, b) => {
    const da = getDateValue(a, deadlineProperty);
    const db = getDateValue(b, deadlineProperty);
    if (da !== db) {
      if (da === null) return 1;
      if (db === null) return -1;
      return da < db ? -1 : 1;
    }
    return a.createdAt.localeCompare(b.createdAt);
  });
}

/* ---------- 카드의 다음 일정 (R6·R24) ---------- */

/** 같은 날이면 시간이 없는 일정이 먼저, 그다음 시간 순 */
function eventSortKey(event: ScheduleEvent): string {
  return `${event.date} ${event.time ?? ""}`;
}

/**
 * 카드에 보여줄 다음 일정.
 * - event: 오늘 이후(오늘 포함) 가장 가까운 전형 일정 (보라색 D-day).
 *   "지원 완료" 일정은 상태가 지원 완료일 때만 포함한다.
 * - deadline: 지원 준비 카드의 마감일 (회색 "D-n 마감")
 * 둘 다 있으면 더 가까운 쪽. days는 오늘부터 남은 일 수 (0 = 당일).
 */
export type NextItem =
  | { kind: "event"; event: ScheduleEvent; days: number }
  | { kind: "deadline"; date: string; days: number };

export function getNextItem(application: Application, deadlineProperty: PropertyDef | null, today: Date): NextItem | null {
  const todayKey = toDateKey(today);

  // "지원 완료" 일정은 이미 한 일의 기록이라, 상태가 지원 완료일 때만 다음 일정으로 본다
  const upcoming = application.events
    .filter((e) => e.date >= todayKey)
    .filter((e) => e.kind !== "applied" || application.status === "applied")
    .sort((a, b) => eventSortKey(a).localeCompare(eventSortKey(b)))[0];

  const deadline = application.status === "preparing" ? getDateValue(application, deadlineProperty) : null;
  const deadlineUpcoming = deadline !== null && deadline >= todayKey ? deadline : null;

  if (upcoming && (deadlineUpcoming === null || upcoming.date <= deadlineUpcoming)) {
    return { kind: "event", event: upcoming, days: daysUntil(upcoming.date, today) };
  }
  if (deadlineUpcoming !== null) {
    return { kind: "deadline", date: deadlineUpcoming, days: daysUntil(deadlineUpcoming, today) };
  }
  return null;
}

/** 가장 늦은 전형 일정 (종료 카드의 "마지막 일정" 표시용). 없으면 null. */
export function getLastEvent(application: Application): ScheduleEvent | null {
  return (
    [...application.events].sort((a, b) => eventSortKey(b).localeCompare(eventSortKey(a)))[0] ?? null
  );
}
