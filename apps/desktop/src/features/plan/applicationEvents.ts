import { groupEntriesByDate } from "../applications/calendarEntries";
import type { ApplicationsData, EventKind } from "../applications/types";
import { addDays } from "../../utils/date";

/** 플랜 달력 위쪽에 그릴 지원 일정 알약 하나 (R31) */
export interface SchedPillData {
  key: string;
  applicationId: string;
  kind: EventKind;
  kindLabel: string; // "코딩테스트" 등
  text: string; // 알약 글자: 회사 → 카드 제목 → "제목 없음"
  heading: string; // 풍선 머리: "회사 · 카드 제목" (둘 중 있는 것만)
  date: string; // "YYYY-MM-DD"
  time: string | null; // "HH:mm"
}

const UNTITLED = "제목 없음";

/** 카드의 회사 이름: 역할이 "company"인 속성에서 고른 항목 이름. 없으면 "" */
function companyName(data: ApplicationsData, values: Record<string, unknown>): string {
  const prop = data.properties.find((p) => p.role === "company");
  if (!prop) return "";
  const value = values[prop.id];
  if (typeof value !== "string" || value === "") return "";
  return prop.options.find((o) => o.id === value)?.name.trim() ?? "";
}

/**
 * 이번 주 7일(월~일)의 지원 일정 알약 목록 (R31, D8).
 * 일정 고르기·순서는 지원관리 달력의 `groupEntriesByDate`를 그대로 쓴다 (지원 마감은 "지원 준비" 카드만).
 */
export function buildWeekSchedule(data: ApplicationsData, weekStart: string): SchedPillData[][] {
  const byDate = groupEntriesByDate(data.applications);
  const byId = new Map(data.applications.map((a) => [a.id, a]));
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    return (byDate.get(day) ?? []).map((entry) => {
      const app = byId.get(entry.applicationId);
      const company = app ? companyName(data, app.values) : "";
      const title = entry.title.trim();
      return {
        key: entry.key,
        applicationId: entry.applicationId,
        kind: entry.kind,
        kindLabel: entry.label,
        text: company || title || UNTITLED,
        heading: [company, title].filter(Boolean).join(" · ") || UNTITLED,
        date: entry.date,
        time: entry.time,
      };
    });
  });
}
