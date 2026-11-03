/** 주차형 프로젝트의 주 계산 (순수 함수, 프로젝트 R11·R17). 주차는 월요일 기준이다. */
import { addDays, diffDays } from "../../utils/date";
import type { Project } from "../plan/types";

/** 날짜 범위 (둘 다 "YYYY-MM-DD", 끝 포함) */
export interface DayRange {
  start: string;
  end: string;
}

/** index번째(0부터) 주차의 월요일~일요일. 단계형이거나 시작 주가 없으면 null. */
export function weekRange(project: Project, index: number): DayRange | null {
  if (project.kind !== "weekly" || project.startWeek === null) return null;
  const start = addDays(project.startWeek, index * 7);
  return { start, end: addDays(start, 6) };
}

/**
 * 오늘이 속한 주차 자리 (프로젝트 R17). 시작 전이면 0(1주차), 기간이 지났으면 마지막 주차.
 * 단계형이거나 주차가 없으면 null.
 */
export function currentWeekIndex(project: Project, todayKey: string): number | null {
  if (project.kind !== "weekly" || project.startWeek === null || project.stages.length === 0) return null;
  const index = Math.floor(diffDays(project.startWeek, todayKey) / 7);
  return Math.max(0, Math.min(project.stages.length - 1, index));
}

/** 단계 이름표. 주차형은 "N주차 · 이름" / 이름이 없으면 "N주차", 단계형은 이름 그대로. */
export function stageLabel(project: Project, index: number): string {
  const name = project.stages[index]?.name ?? "";
  if (project.kind !== "weekly") return name;
  const week = `${index + 1}주차`;
  return name ? `${week} · ${name}` : week;
}
