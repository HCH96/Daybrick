/** 끝내지 못한 태스크 계산 (R34–R37, 순수 함수) */
import { addDays, diffDays } from "../../utils/date";
import type { Task } from "../plan/types";

/** 기간이 있는 태스크 (미완료 태스크는 항상 기간이 있다) */
export type DatedTask = Task & { start: string; end: string };

/** 바뀔 기간 */
export interface Period {
  start: string;
  end: string;
}

function isOverdue(task: Task, todayKey: string): task is DatedTask {
  return task.start !== null && task.end !== null && task.end < todayKey && task.status !== "done";
}

/**
 * 미완료 태스크 (R34): 끝일이 오늘보다 앞이고 완료 아닌 태스크. 날짜 제한은 없다.
 * 많이 지난 순(끝일이 오래된 순), 같으면 시작일·만든 때 순.
 */
export function listOverdue(tasks: readonly Task[], todayKey: string): DatedTask[] {
  return tasks
    .filter((t): t is DatedTask => isOverdue(t, todayKey))
    .sort((a, b) => a.end.localeCompare(b.end) || a.start.localeCompare(b.start) || a.createdAt.localeCompare(b.createdAt));
}

/** 기간 길이(일). 하루짜리면 1 */
export function periodLength(task: Period): number {
  return diffDays(task.start, task.end) + 1;
}

/** 진행 중이면 끝일만 그날로 늘리고, 그 밖(시작 전)이면 길이 그대로 그날부터 시작하게 옮긴다 */
function moveTo(task: DatedTask, day: string): Period {
  if (task.status === "doing") return { start: task.start, end: day };
  return { start: day, end: addDays(day, periodLength(task) - 1) };
}

/** 오늘로 가져오기 (R36) */
export function bringToToday(task: DatedTask, todayKey: string): Period {
  return moveTo(task, todayKey);
}

/** 다른 날로 미루기 (R37). day는 오늘 이후의 날 (고르는 쪽이 막는다) */
export function postponeTo(task: DatedTask, day: string): Period {
  return moveTo(task, day);
}
