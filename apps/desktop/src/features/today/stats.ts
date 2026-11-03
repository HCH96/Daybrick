/** 시간 기록 계산 (순수 함수, R22·R40·R41). 합계는 저장하지 않고 구간에서 계산한다 (D3). */
import { toDateKey } from "../../utils/date";
import type { RunningTimer, TodayData } from "./types";

/** 태스크 하나의 시간 구간 (밀리초 시각) */
export interface Slice {
  taskId: string;
  start: number;
  end: number;
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
      const part = { taskId: slice.taskId, start, end };
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
