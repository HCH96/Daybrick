/**
 * 최근 활동 잔디 계산 (순수 함수, 프로젝트 R54–R59, D3·D4).
 * 입력은 날짜 → 밀리초 지도("YYYY-MM-DD" → ms). "작업한 날"은 1분 이상 (D4).
 * 투데이 스트릭(하루 목표를 채운 날)과는 다른 값이다.
 */
import { addDays, diffDays, parseDateKey, startOfWeek } from "../../utils/date";
import { WORK_DAY_MIN_MS } from "./time";

/** 이번 주 포함 16주 */
export const HEAT_WEEKS = 16;
/** 최근 4주 작업한 날을 세는 기간 */
export const RECENT_DAYS = 28;

const MINUTE = 60_000;

export type HeatLevel = 0 | 1 | 2 | 3 | 4;

/** 잔디 한 칸 */
export interface HeatCell {
  day: string;
  minutes: number;
  level: HeatLevel;
  today: boolean;
  future: boolean;
}

type DayMap = ReadonlyMap<string, number>;

/** 진하기: 0분 / 1시간 미만 / 2시간 미만 / 4시간 미만 / 4시간 이상 */
export function heatLevel(minutes: number): HeatLevel {
  if (minutes < 1) return 0;
  if (minutes < 60) return 1;
  if (minutes < 120) return 2;
  if (minutes < 240) return 3;
  return 4;
}

/** 잔디 첫 칸(15주 전 월요일) */
export function heatStart(todayKey: string): string {
  return addDays(startOfWeek(todayKey), -7 * (HEAT_WEEKS - 1));
}

/** 잔디 마지막 칸(이번 주 일요일) */
export function heatEnd(todayKey: string): string {
  return addDays(startOfWeek(todayKey), 6);
}

/** 프로젝트별 날짜 지도에서 한 프로젝트(또는 null이면 모두)의 날짜별 합 */
export function sumDays(byProject: ReadonlyMap<string, DayMap>, projectId: string | null): Map<string, number> {
  const result = new Map<string, number>();
  for (const [id, days] of byProject) {
    if (projectId !== null && id !== projectId) continue;
    for (const [day, ms] of days) result.set(day, (result.get(day) ?? 0) + ms);
  }
  return result;
}

/** 16주 × 7일 칸, 주마다 월요일부터 (세로 7칸이 한 주) */
export function heatCells(days: DayMap, todayKey: string): HeatCell[] {
  const start = heatStart(todayKey);
  const cells: HeatCell[] = [];
  for (let i = 0; i < HEAT_WEEKS * 7; i++) {
    const day = addDays(start, i);
    const future = day > todayKey;
    const minutes = future ? 0 : Math.floor((days.get(day) ?? 0) / MINUTE);
    cells.push({ day, minutes, level: future ? 0 : heatLevel(minutes), today: day === todayKey, future });
  }
  return cells;
}

/** 위쪽 달 이름: 그 달 1일이 든 주의 열(1부터) */
export function heatMonths(todayKey: string): { column: number; label: string }[] {
  const start = heatStart(todayKey);
  const months: { column: number; label: string }[] = [];
  for (let w = 0; w < HEAT_WEEKS; w++) {
    for (let d = 0; d < 7; d++) {
      const date = parseDateKey(addDays(start, w * 7 + d));
      if (date.getDate() === 1) months.push({ column: w + 1, label: `${date.getMonth() + 1}월` });
    }
  }
  return months;
}

export function worked(days: DayMap, day: string): boolean {
  return (days.get(day) ?? 0) >= WORK_DAY_MIN_MS;
}

/** 연속 작업일: 오늘 기록이 있으면 오늘까지, 없으면 어제까지 센다 (R57) */
export function streak(days: DayMap, todayKey: string): number {
  let day = worked(days, todayKey) ? todayKey : addDays(todayKey, -1);
  let count = 0;
  while (worked(days, day)) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}

/** 지금까지 가장 긴 연속 작업일 (오늘 이후 날짜는 보지 않는다) */
export function longestStreak(days: DayMap, todayKey: string): number {
  const list = [...days.keys()].filter((d) => d <= todayKey && worked(days, d)).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of list) {
    run = prev !== null && diffDays(prev, day) === 1 ? run + 1 : 1;
    if (run > best) best = run;
    prev = day;
  }
  return best;
}

/** from부터 to까지(둘 다 포함) 작업한 날 수 */
export function workedDaysBetween(days: DayMap, from: string, to: string): number {
  let count = 0;
  for (const [day, ms] of days) if (from <= day && day <= to && ms >= WORK_DAY_MIN_MS) count++;
  return count;
}

/** 최근 28일(오늘 포함) 중 작업한 날 */
export function recentDays(days: DayMap, todayKey: string): number {
  return workedDaysBetween(days, addDays(todayKey, -(RECENT_DAYS - 1)), todayKey);
}

/** from부터 to까지 합계(밀리초) */
export function totalBetween(days: DayMap, from: string, to: string): number {
  let total = 0;
  for (const [day, ms] of days) if (from <= day && day <= to) total += ms;
  return total;
}

/** 그날 프로젝트별 시간 (1분 이상, 많은 순) — 칸 말풍선·원 반짝임 (R59) */
export function dayBreakdown(byProject: ReadonlyMap<string, DayMap>, day: string): { projectId: string; ms: number }[] {
  const list: { projectId: string; ms: number }[] = [];
  for (const [projectId, days] of byProject) {
    const ms = days.get(day) ?? 0;
    if (ms >= WORK_DAY_MIN_MS) list.push({ projectId, ms });
  }
  return list.sort((a, b) => b.ms - a.ms);
}
