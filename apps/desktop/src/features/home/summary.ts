/**
 * 홈 요약 줄 계산 (R23–R26, D7). 화면 없는 순수 함수.
 * 오늘 완료는 투데이 칸반과 같은 `tasksOnDate`, 다음 일정은 다가오는 7일(`buildUpcoming`) 결과,
 * 가까운 마감은 지원관리 달력과 같은 `groupEntriesByDate` 규칙을 그대로 쓴다 (D11).
 */
import { groupEntriesByDate } from "../applications/calendarEntries";
import type { ApplicationsData } from "../applications/types";
import { companyName } from "../plan/applicationEvents";
import { tasksOnDate } from "../plan/selectors";
import type { PlanData } from "../plan/types";
import { addDays, diffDays, toDateKey } from "../../utils/date";
import { shortDateLabel, type UpcomingDay } from "./upcoming";

const UNTITLED = "제목 없음";

/** "오늘 / 내일 / 11/12 (수)" (R25) */
export function shortDayLabel(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return "오늘";
  if (dateKey === addDays(todayKey, 1)) return "내일";
  return shortDateLabel(dateKey);
}

/** 오늘 완료 / 전체 (R24). 투데이 칸반과 같은 대상 = 오늘이 기간 안인 태스크 */
export function todayDone(plan: PlanData, todayKey: string): { done: number; total: number } {
  const tasks = tasksOnDate(plan, todayKey);
  return { done: tasks.filter((t) => t.status === "done").length, total: tasks.length };
}

export interface NextEvent {
  dateKey: string;
  time: string | null; // "HH:mm", 없으면 하루 종일
  title: string; // 개인: 제목, 지원: "회사 전형 종류" (예: "넥슨 면접")
}

/** Date → "HH:mm" */
function hhmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/**
 * 다가오는 7일 중 개인 일정·지원 전형에서 지금 이후 가장 가까운 하나 (R25).
 * 시각 없는 항목은 그날 하루 내내 "앞으로"다. 같은 날 안에서는 7일 카드의 순서(시각순 → 시각 없음)를 따른다.
 * 지금 시각과 같은 분에 시작하는 일정은 아직 "앞으로"로 본다.
 */
export function nextEvent(upcoming: readonly UpcomingDay[], now: Date): NextEvent | null {
  const nowKey = toDateKey(now);
  const nowTime = hhmm(now);
  for (const day of upcoming) {
    if (day.dateKey < nowKey) continue;
    for (const row of day.rows) {
      if (row.kind !== "app" && row.kind !== "personal") continue;
      if (day.dateKey === nowKey && row.time !== null && row.time < nowTime) continue;
      const title = row.kind === "app" ? `${row.title} ${row.sub}` : row.title;
      return { dateKey: day.dateKey, time: row.time, title };
    }
  }
  return null;
}

export interface NearestDeadline {
  dateKey: string;
  days: number; // 오늘부터 남은 날 (0 = 오늘)
  title: string; // "회사 전형 종류" (예: "넥슨 지원 마감")
}

/** 0 → "D-day", 2 → "D-2" (R26) */
export function ddayLabel(days: number): string {
  return days === 0 ? "D-day" : `D-${days}`;
}

/**
 * 지원 전형 일정 중 지원(서류) 마감·과제 마감에서 오늘 이후(오늘 포함) 가장 가까운 하나 (R26, D7). 기간 제한 없음.
 * 지원 마감은 지원관리 달력과 같이 "지원 준비" 카드만 센다. 같은 날이면 시각 없는 것 → 시각순.
 */
export function nearestDeadline(data: ApplicationsData, todayKey: string): NearestDeadline | null {
  const byId = new Map(data.applications.map((a) => [a.id, a]));
  let best: { date: string; time: string; title: string } | null = null;
  for (const list of groupEntriesByDate(data.applications).values()) {
    for (const entry of list) {
      if (entry.kind !== "application-due" && entry.kind !== "assignment-due") continue;
      if (entry.date < todayKey) continue;
      const time = entry.time ?? "";
      if (best && (entry.date > best.date || (entry.date === best.date && time >= best.time))) continue;
      const app = byId.get(entry.applicationId);
      const name = (app ? companyName(data, app.values) : "") || entry.title.trim() || UNTITLED;
      best = { date: entry.date, time, title: `${name} ${entry.label}` };
    }
  }
  if (!best) return null;
  return { dateKey: best.date, days: diffDays(todayKey, best.date), title: best.title };
}
