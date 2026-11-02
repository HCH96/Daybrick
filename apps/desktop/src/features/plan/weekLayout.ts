import { addDays, diffDays } from "../../utils/date";
import type { Task } from "./types";

/** 주간 달력 막대 하나의 자리 */
export interface WeekBar {
  taskId: string;
  col: number; // 0(월) ~ 6(일), 주 안으로 자른 시작일
  span: number; // 1 ~ 7칸
  lane: number; // 0부터, 위에서 몇 번째 줄
  cutLeft: boolean; // 시작일이 이번 주보다 앞이라 왼쪽이 잘림
  cutRight: boolean; // 끝일이 이번 주보다 뒤라 오른쪽이 잘림
}

/**
 * 이번 주(weekStart = 월요일)에 걸린 태스크만 막대 자리로 바꾼다 (R23·R29).
 * 시작 칸 순 → 긴 것 먼저 → 만든 순으로 놓고, 겹치지 않는 가장 위 줄에 넣는다.
 * 날짜를 "YYYY-MM-DD" 문자열로 비교한다 (사전 순 = 날짜 순).
 */
export function layoutWeekBars(tasks: Task[], weekStart: string): WeekBar[] {
  const weekEnd = addDays(weekStart, 6);

  const placed = tasks
    .filter((t): t is Task & { start: string; end: string } => t.start !== null && t.end !== null)
    .filter((t) => t.start <= weekEnd && t.end >= weekStart)
    .map((t) => {
      const from = t.start < weekStart ? weekStart : t.start;
      const to = t.end > weekEnd ? weekEnd : t.end;
      return {
        task: t,
        col: diffDays(weekStart, from),
        span: diffDays(from, to) + 1,
        cutLeft: t.start < weekStart,
        cutRight: t.end > weekEnd,
      };
    })
    .sort((a, b) => a.col - b.col || b.span - a.span || a.task.createdAt.localeCompare(b.task.createdAt));

  // 줄마다 마지막으로 차지한 칸(끝 col)
  const laneEnds: number[] = [];
  return placed.map(({ task, col, span, cutLeft, cutRight }) => {
    let lane = laneEnds.findIndex((end) => end < col);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    laneEnds[lane] = col + span - 1;
    return { taskId: task.id, col, span, lane, cutLeft, cutRight };
  });
}

/** 막대가 차지한 줄 수 (막대가 없으면 0) */
export function countLanes(bars: WeekBar[]): number {
  return bars.reduce((max, bar) => Math.max(max, bar.lane + 1), 0);
}
