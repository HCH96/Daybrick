import { daysUntil, getWeekDays, toDateKey } from "../../utils/date";
import type { Application, ScheduleEvent } from "./types";

/** 진행 중 = 종료가 아닌 카드 (R4) */
export function isActive(application: Application): boolean {
  return application.status !== "closed";
}

/** 지원 마감 일정인지 (카드당 하나, R39) */
export function isApplicationDue(event: ScheduleEvent): boolean {
  return event.kind === "application-due";
}

/** 카드의 지원 마감 날짜. 없으면 null. (혹시 여러 개면 가장 이른 날) */
export function getApplicationDueDate(application: Application): string | null {
  const dates = application.events.filter(isApplicationDue).map((e) => e.date).sort();
  return dates[0] ?? null;
}

/** 카드가 세는 일정: 전형 일정 전부 + 지원 준비 카드의 지원 마감 (D21) */
function countedEvents(application: Application): ScheduleEvent[] {
  return application.events.filter((e) => !isApplicationDue(e) || application.status === "preparing");
}

/** 이번 주(월~일)에 있는 진행 중 카드의 일정 개수 (페이지 부제용, D21) */
export function countEventsThisWeek(applications: readonly Application[], today: Date): number {
  const week = getWeekDays(today);
  const first = toDateKey(week[0].date);
  const last = toDateKey(week[6].date);
  // "YYYY-MM-DD"는 글자 순서와 날짜 순서가 같아서 문자열 비교로 범위를 확인할 수 있다.
  return applications
    .filter(isActive)
    .reduce((sum, app) => sum + countedEvents(app).filter((e) => e.date >= first && e.date <= last).length, 0);
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
 * 카드 아래쪽 줄에 보이는 날짜(R38)가 가까운 순으로 정렬한 새 배열 (R5).
 * 날짜가 없는 카드("지원 완료", "예정된 일정 없음", 종료 카드)는 맨 뒤.
 * 날짜가 같거나 둘 다 없으면 먼저 만든 카드가 앞에 온다.
 */
export function sortByNextDate(applications: readonly Application[], today: Date): Application[] {
  const keys = new Map(
    applications.map((a) => [a.id, a.status === "closed" ? null : getNextItemDate(getNextItem(a, today))] as const),
  );
  return [...applications].sort((a, b) => {
    const da = keys.get(a.id) ?? null;
    const db = keys.get(b.id) ?? null;
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
 * 카드 아래쪽 줄과 📅 옆에 보여줄 다음 일정 (R38·R24).
 * - event: 오늘 이후(오늘 포함) 가장 가까운 전형 일정 (보라색 D-day)
 * - deadline: 지원 준비 카드의 지원 마감 (회색 "D-n 지원 마감")
 * - applied: 지원 완료 카드에 남은 전형 일정이 없을 때 (카드는 파랑 "지원 완료", 📅 옆은 비움)
 * days는 오늘부터 남은 일 수 (0 = 당일).
 */
export type NextItem =
  | { kind: "event"; event: ScheduleEvent; days: number }
  | { kind: "deadline"; date: string; days: number }
  | { kind: "applied" };

/** 다음 일정의 날짜 (정렬용). 날짜가 없으면 null. */
function getNextItemDate(item: NextItem | null): string | null {
  if (!item || item.kind === "applied") return null;
  return item.kind === "event" ? item.event.date : item.date;
}

/**
 * 상태별 다음 일정 (R38).
 * - 지원 준비: 지원 마감과 다음 전형 일정 중 더 가까운 것
 * - 지원 완료: 지원 마감은 보지 않는다. 남은 전형 일정, 없으면 applied
 * - 전형 준비·결과 대기·종료: 다음 전형 일정, 없으면 null (종료 카드 아래쪽 줄은 getLastEvent로 따로 그린다)
 */
export function getNextItem(application: Application, today: Date): NextItem | null {
  const todayKey = toDateKey(today);

  const upcoming = application.events
    .filter((e) => !isApplicationDue(e) && e.date >= todayKey)
    .sort((a, b) => eventSortKey(a).localeCompare(eventSortKey(b)))[0];

  const deadline = application.status === "preparing" ? getApplicationDueDate(application) : null;
  const deadlineUpcoming = deadline !== null && deadline >= todayKey ? deadline : null;

  if (upcoming && (deadlineUpcoming === null || upcoming.date <= deadlineUpcoming)) {
    return { kind: "event", event: upcoming, days: daysUntil(upcoming.date, today) };
  }
  if (deadlineUpcoming !== null) {
    return { kind: "deadline", date: deadlineUpcoming, days: daysUntil(deadlineUpcoming, today) };
  }
  if (application.status === "applied") return { kind: "applied" };
  return null;
}

/** 📅 창 목록 순서: 날짜·시간 순 (같은 날이면 시간 없는 일정이 먼저) */
export function sortEvents(events: readonly ScheduleEvent[]): ScheduleEvent[] {
  return [...events].sort((a, b) => eventSortKey(a).localeCompare(eventSortKey(b)));
}

/** 가장 늦은 전형 일정 (종료 카드의 "마지막 일정" 표시용, 지원 마감은 빼고, D21). 없으면 null. */
export function getLastEvent(application: Application): ScheduleEvent | null {
  return (
    application.events
      .filter((e) => !isApplicationDue(e))
      .sort((a, b) => eventSortKey(b).localeCompare(eventSortKey(a)))[0] ?? null
  );
}
