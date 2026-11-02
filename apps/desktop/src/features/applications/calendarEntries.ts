import { EVENT_KIND_LABELS } from "./statuses";
import type { Application, EventKind, StatusId } from "./types";

/** 큰 달력의 날짜 칸에 그릴 일정 하나 (전형 일정 또는 지원 준비 카드의 지원 마감) */
export interface CalendarEntry {
  key: string; // React key (카드 안에서 겹치지 않음)
  applicationId: string;
  title: string; // 카드 제목 (비어 있을 수 있음)
  kind: EventKind; // 일정 종류 (플랜 달력 알약의 아이콘·색)
  label: string; // 일정 종류 ("면접", "지원 마감" 등)
  date: string; // "YYYY-MM-DD"
  time: string | null;
  status: StatusId; // 카드의 현재 상태 (색)
  isDeadline: boolean; // 지원 준비 카드의 지원 마감 (흐린 점선 칸, R8)
}

/**
 * 모든 카드의 전형 일정을 날짜별로 모은다 (R7). 종료 카드의 일정도 남긴다 (R10).
 * 지원 마감 일정은 지원 준비 카드일 때만 넣는다 (R8, D21).
 * 상태 자체는 일정으로 만들지 않는다 (R9).
 * 같은 날 안에서는 시간 없는 일정 → 시간 순, 지원 마감은 맨 뒤.
 */
export function groupEntriesByDate(applications: readonly Application[]): Map<string, CalendarEntry[]> {
  const entries: CalendarEntry[] = [];
  for (const app of applications) {
    for (const event of app.events) {
      const isDeadline = event.kind === "application-due";
      if (isDeadline && app.status !== "preparing") continue;
      entries.push({
        key: event.id,
        applicationId: app.id,
        title: app.title,
        kind: event.kind,
        label: EVENT_KIND_LABELS[event.kind],
        date: event.date,
        time: event.time,
        status: app.status,
        isDeadline,
      });
    }
  }

  const sortKey = (e: CalendarEntry) => `${e.isDeadline ? 1 : 0} ${e.time ?? ""}`;
  const byDate = new Map<string, CalendarEntry[]>();
  for (const entry of entries) {
    const list = byDate.get(entry.date);
    if (list) list.push(entry);
    else byDate.set(entry.date, [entry]);
  }
  // sort는 안정 정렬이라 같은 키면 카드 순서(만든 순)를 지킨다
  for (const list of byDate.values()) list.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  return byDate;
}
