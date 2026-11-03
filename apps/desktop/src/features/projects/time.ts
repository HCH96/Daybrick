/**
 * 프로젝트별 시간 합계 (순수 함수, 프로젝트 R26·R28·R35·R54). 투데이 시간 기록을 읽기만 한다.
 * 태스크 id → 단계 → 프로젝트로 묶는다. 시간 값은 모두 밀리초.
 */
import type { PlanData } from "../plan/types";
import { collectSlices, splitByDay, type Slice } from "../today/stats";
import type { TodayData } from "../today/types";

/** "작업한 날" 기준: 그날 프로젝트 기록이 1분 이상 (프로젝트 D4) */
export const WORK_DAY_MIN_MS = 60_000;

/** 태스크 id → 프로젝트 id (있는 단계에 속한 태스크만) */
export function taskProjectMap(plan: PlanData): Map<string, string> {
  const stageToProject = new Map<string, string>();
  for (const project of plan.projects) {
    for (const stage of project.stages) stageToProject.set(stage.id, project.id);
  }
  const map = new Map<string, string>();
  for (const task of plan.tasks) {
    const projectId = task.stageId === null ? undefined : stageToProject.get(task.stageId);
    if (projectId) map.set(task.id, projectId);
  }
  return map;
}

/** 프로젝트별 시간 구간 (끝난 기록 + 실행 중 타이머는 now까지) */
export function projectSlices(plan: PlanData, today: TodayData, now: number): Map<string, Slice[]> {
  const owner = taskProjectMap(plan);
  const byProject = new Map<string, Slice[]>();
  for (const slice of collectSlices(today, now)) {
    const projectId = owner.get(slice.taskId);
    if (!projectId) continue;
    const list = byProject.get(projectId);
    if (list) list.push(slice);
    else byProject.set(projectId, [slice]);
  }
  return byProject;
}

/** 구간 합 (누적 시간, 프로젝트 R28) */
export function projectTotal(slices: Slice[] | undefined): number {
  return (slices ?? []).reduce((total, s) => total + Math.max(0, s.end - s.start), 0);
}

/** 프로젝트별 날짜별 합: 프로젝트 id → ("YYYY-MM-DD" → 밀리초). 자정에서 나눈다. */
export function dayTotalsByProject(plan: PlanData, today: TodayData, now: number): Map<string, Map<string, number>> {
  const result = new Map<string, Map<string, number>>();
  for (const [projectId, slices] of projectSlices(plan, today, now)) {
    const days = new Map<string, number>();
    for (const [day, parts] of splitByDay(slices)) days.set(day, projectTotal(parts));
    result.set(projectId, days);
  }
  return result;
}

/** 1분 이상 작업한 마지막 날 (프로젝트 R26, D4). 없으면 null. */
export function lastWorkDay(days: Map<string, number> | undefined): string | null {
  let last: string | null = null;
  for (const [day, ms] of days ?? []) {
    if (ms >= WORK_DAY_MIN_MS && (last === null || day > last)) last = day;
  }
  return last;
}
