import { addDays, diffDays } from "../../utils/date";
import type { Task } from "./types";

/** 끌어 놓기 결과 기간. 둘 다 null이면 날짜 없음 (D2: 연속 기간 하나) */
export interface Period {
  start: string | null;
  end: string | null;
}

/**
 * 목록 태스크를 달력 day 칸에 놓기 (R22).
 * 날짜가 없으면 그날 하루짜리, 이미 기간이 있으면 길이를 유지한 채 시작일만 day로 옮긴다.
 */
export const placeOnDay = (task: Pick<Task, "start" | "end">, day: string): Period => {
  if (task.start === null || task.end === null) return { start: day, end: day };
  return { start: day, end: addDays(day, diffDays(task.start, task.end)) };
};

/** 기간을 days일 옮긴다 (음수면 앞으로). 길이는 그대로 (R25). 날짜 없으면 그대로 */
export const moveBy = (task: Pick<Task, "start" | "end">, days: number): Period => {
  if (task.start === null || task.end === null) return { start: null, end: null };
  return { start: addDays(task.start, days), end: addDays(task.end, days) };
};

/** 시작일을 day로 바꾼다. 끝일보다 뒤로는 못 가고 끝일에서 멈춘다 (R26) */
export const resizeStart = (task: Pick<Task, "start" | "end">, day: string): Period => {
  if (task.start === null || task.end === null) return { start: null, end: null };
  return { start: diffDays(day, task.end) < 0 ? task.end : day, end: task.end };
};

/** 끝일을 day로 바꾼다. 시작일보다 앞으로는 못 가고 시작일에서 멈춘다 (R26) */
export const resizeEnd = (task: Pick<Task, "start" | "end">, day: string): Period => {
  if (task.start === null || task.end === null) return { start: null, end: null };
  return { start: task.start, end: diffDays(task.start, day) < 0 ? task.start : day };
};

/** 두 기간이 같은지 (놓아도 바뀌는 게 없으면 저장하지 않는다) */
export const samePeriod = (a: Period, b: Period): boolean => a.start === b.start && a.end === b.end;
