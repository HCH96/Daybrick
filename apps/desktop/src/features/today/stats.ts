/** 시간 기록 계산 (순수 함수, R22·R40·R41). 합계는 저장하지 않고 구간에서 계산한다 (D3). */
import { addDays, parseDateKey, toDateKey } from "../../utils/date";
import { NONE_CATEGORY_COLOR } from "../plan/color";
import type { PlanData } from "../plan/types";
import { findStage } from "../projects/group";
import type { RunningTimer, TodayData } from "./types";

/** 태스크 하나의 시간 구간 (밀리초 시각) */
export interface Slice {
  taskId: string;
  start: number;
  end: number;
  /** 실행 중 타이머의 열린 구간(지금까지)이면 true (R31 빗금) */
  live?: boolean;
}

/** 끝난 기록 + 실행 중 타이머의 구간(열린 구간은 now까지)을 한 목록으로 */
export function collectSlices(data: TodayData, now: number): Slice[] {
  const slices: Slice[] = data.records.map((r) => ({ taskId: r.taskId, start: Date.parse(r.start), end: Date.parse(r.end) }));
  if (data.running) slices.push(...runningSlices(data.running, now));
  return slices;
}

function runningSlices(running: RunningTimer, now: number): Slice[] {
  return running.segments.map((s) => ({
    taskId: running.taskId,
    start: Date.parse(s.start),
    end: s.end === null ? now : Date.parse(s.end),
    live: s.end === null,
  }));
}

/** 그 시각이 든 날의 다음 자정(현지 시간) */
function nextMidnight(time: number): number {
  const d = new Date(time);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
}

/** 구간을 자정마다 잘라 날짜("YYYY-MM-DD")별로 모은다. 길이 0 이하 구간은 뺀다. */
export function splitByDay(slices: Slice[]): Map<string, Slice[]> {
  const byDay = new Map<string, Slice[]>();
  for (const slice of slices) {
    let start = slice.start;
    while (start < slice.end) {
      const end = Math.min(slice.end, nextMidnight(start));
      const key = toDateKey(new Date(start));
      const list = byDay.get(key);
      const part: Slice = { taskId: slice.taskId, start, end, live: slice.live };
      if (list) list.push(part);
      else byDay.set(key, [part]);
      start = end;
    }
  }
  return byDay;
}

function sum(slices: Slice[] | undefined): number {
  return (slices ?? []).reduce((total, s) => total + (s.end - s.start), 0);
}

/** 그날 모든 태스크의 기록 합 (지금 세션 포함, 밀리초) */
export function dayTotal(data: TodayData, dayKey: string, now: number): number {
  return sum(splitByDay(collectSlices(data, now)).get(dayKey));
}

/** 그날 이 태스크의 기록 합 (지금 세션 포함, 밀리초, R41) */
export function taskTotalOn(data: TodayData, taskId: string, dayKey: string, now: number): number {
  const slices = collectSlices(data, now).filter((s) => s.taskId === taskId);
  return sum(splitByDay(slices).get(dayKey));
}

/** 이번 세션에 흐른 시간 = 실행 중 타이머 구간 합 (일시정지 시간 빠짐, R40) */
export function sessionElapsed(running: RunningTimer, now: number): number {
  return runningSlices(running, now).reduce((total, s) => total + Math.max(0, s.end - s.start), 0);
}

// ── 오늘 요약 (R29–R31) ──

/** 그날 구간 목록 (자정에서 자른 것, 지금 세션 포함) */
export function daySlices(data: TodayData, dayKey: string, now: number): Slice[] {
  return splitByDay(collectSlices(data, now)).get(dayKey) ?? [];
}

/** 날짜별 기록 합(밀리초). 스트릭·달력이 쓴다 */
export function dayTotals(data: TodayData, now: number): Map<string, number> {
  const totals = new Map<string, number>();
  for (const [key, slices] of splitByDay(collectSlices(data, now))) totals.set(key, sum(slices));
  return totals;
}

/**
 * 묶음별 합 한 줄 (R29). 카테고리는 카테고리 id, 프로젝트 태스크는 프로젝트 하나로 묶어 "project:<id>" (프로젝트 R53).
 * 미분류·지운 태스크·없는 카테고리·단계는 id null 한 줄로 모은다
 */
export interface CategoryTotal {
  id: string | null;
  name: string;
  color: string;
  ms: number;
}

/** 그날 구간을 묶음(카테고리·프로젝트)별로 더해 큰 순으로 (R29, 프로젝트 R53) */
export function categoryTotals(day: Slice[], data: PlanData): CategoryTotal[] {
  const taskById = new Map(data.tasks.map((t) => [t.id, t]));
  const catById = new Map(data.categories.map((c) => [c.id, c]));
  const totals = new Map<string | null, CategoryTotal>();
  const groupOf = (taskId: string): Omit<CategoryTotal, "ms"> => {
    const task = taskById.get(taskId);
    if (!task) return { id: null, name: "미분류", color: NONE_CATEGORY_COLOR };
    const stage = task.stageId !== null ? findStage(data, task.stageId) : undefined;
    if (stage) return { id: `project:${stage.project.id}`, name: stage.project.name, color: stage.project.color };
    const cat = task.categoryId !== null ? catById.get(task.categoryId) : undefined;
    if (cat) return { id: cat.id, name: cat.name, color: cat.color };
    return { id: null, name: "미분류", color: NONE_CATEGORY_COLOR };
  };
  for (const s of day) {
    const group = groupOf(s.taskId);
    const row = totals.get(group.id) ?? { ...group, ms: 0 };
    row.ms += s.end - s.start;
    totals.set(group.id, row);
  }
  return [...totals.values()].filter((r) => r.ms > 0).sort((a, b) => b.ms - a.ms);
}

/** 타임라인 축: 08시–24시 (R31) */
export const TIMELINE_START_HOUR = 8;
const TIMELINE_HOURS = 24 - TIMELINE_START_HOUR;

/** 타임라인 막대 하나. left·width는 축 위 퍼센트 */
export interface TimelineBar {
  taskId: string;
  left: number;
  width: number;
  live: boolean;
}

function axisStart(dayKey: string): number {
  const d = parseDateKey(dayKey);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), TIMELINE_START_HOUR).getTime();
}

/** 그 시각의 축 위 위치(%). 08시 전이면 null, 24시는 100 */
export function timelinePosition(dayKey: string, time: number): number | null {
  const start = axisStart(dayKey);
  if (time < start) return null;
  return Math.min(100, ((time - start) / (TIMELINE_HOURS * 3_600_000)) * 100);
}

/** 그날 구간을 08–24시 축 위 막대로. 08시 전 부분은 08시부터 잘라 그린다 (R31) */
export function timelineBars(day: Slice[], dayKey: string): TimelineBar[] {
  const start = axisStart(dayKey);
  const bars: TimelineBar[] = [];
  for (const s of day) {
    const from = timelinePosition(dayKey, Math.max(s.start, start));
    const to = timelinePosition(dayKey, s.end);
    if (from === null || to === null || to <= from) continue;
    bars.push({ taskId: s.taskId, left: from, width: to - from, live: s.live === true });
  }
  return bars;
}

function reached(totals: Map<string, number>, key: string, goalMinutes: number): boolean {
  return (totals.get(key) ?? 0) >= goalMinutes * 60000;
}

/** 스트릭 (R30): 오늘이 목표 이상이면 오늘부터, 아니면 어제부터 거꾸로 목표 이상인 날이 이어진 수 */
export function streak(totals: Map<string, number>, todayKey: string, goalMinutes: number): number {
  let key = reached(totals, todayKey, goalMinutes) ? todayKey : addDays(todayKey, -1);
  let count = 0;
  while (reached(totals, key, goalMinutes)) {
    count += 1;
    key = addDays(key, -1);
  }
  return count;
}

/** 이번 달 달력 한 칸 (R30) */
export interface MonthLight {
  day: number;
  lit: boolean;
  today: boolean;
  future: boolean;
}

/** 이번 달 1일~말일: 목표를 채웠는가·오늘인가·아직 안 왔는가 (R30) */
export function monthLights(totals: Map<string, number>, todayKey: string, goalMinutes: number): MonthLight[] {
  const t = parseDateKey(todayKey);
  const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  const lights: MonthLight[] = [];
  for (let day = 1; day <= last; day++) {
    const key = toDateKey(new Date(t.getFullYear(), t.getMonth(), day));
    const future = key > todayKey;
    lights.push({ day, lit: !future && reached(totals, key, goalMinutes), today: key === todayKey, future });
  }
  return lights;
}
