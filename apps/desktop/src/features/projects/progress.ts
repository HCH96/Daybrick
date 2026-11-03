/**
 * 프로젝트 진행 계산 (순수 함수). 진행률·끝난 단계·현재 단계·완료 여부는 저장하지 않고 그릴 때마다 계산한다 (프로젝트 D3).
 * tasks에는 플랜의 태스크 전체를 넘겨도 된다 (단계 id로 거른다).
 */
import type { PlanData, Project, Task } from "../plan/types";
import { currentWeekIndex } from "./weeks";

/** 그 단계에 속한 태스크 */
export function stageTasks(tasks: Task[], stageId: string): Task[] {
  return tasks.filter((t) => t.stageId === stageId);
}

/** 끝난 단계: 태스크가 1개 이상이고 모두 완료 (프로젝트 R16). 태스크가 없으면 끝나지 않은 것. */
export function isStageDone(tasks: Task[], stageId: string): boolean {
  const list = stageTasks(tasks, stageId);
  return list.length > 0 && list.every((t) => t.status === "done");
}

/**
 * 현재 단계 자리 (프로젝트 R17). 단계형은 앞에서부터 끝나지 않은 첫 단계(모두 끝났으면 마지막),
 * 주차형은 오늘이 속한 주차(시작 전 1주차, 지나면 마지막). 단계가 없으면 null.
 */
export function currentStage(project: Project, tasks: Task[], todayKey: string): number | null {
  if (project.stages.length === 0) return null;
  if (project.kind === "weekly") return currentWeekIndex(project, todayKey);
  const index = project.stages.findIndex((s) => !isStageDone(tasks, s.id));
  return index < 0 ? project.stages.length - 1 : index;
}

/**
 * 캐릭터 위치 (프로젝트 R23) = 앞에서부터 이어서 끝난 단계 수 + 그다음 단계 안의 완료 태스크 비율.
 * 0 ~ 단계 수 사이 값. 예: 5/5, 2/6, 0/0 → 1 + 2/6 = 1.33
 */
export function runnerPosition(project: Project, tasks: Task[]): number {
  let position = 0;
  for (const stage of project.stages) {
    const list = stageTasks(tasks, stage.id);
    const done = list.filter((t) => t.status === "done").length;
    if (list.length > 0 && done === list.length) {
      position += 1;
      continue;
    }
    return position + (list.length > 0 ? done / list.length : 0);
  }
  return position;
}

/** 모든 단계가 끝났으면 완료 (프로젝트 R18). 주차형도 기간과 상관없이 태스크로만 정한다 (R20). */
export function isProjectDone(project: Project, tasks: Task[]): boolean {
  return project.stages.length > 0 && project.stages.every((s) => isStageDone(tasks, s.id));
}

/** 진행 중 프로젝트 (저장 순서 그대로, 프로젝트 R7) */
export function activeProjects(data: PlanData): Project[] {
  return data.projects.filter((p) => !isProjectDone(p, data.tasks));
}

/** 완료된 프로젝트 (저장 순서 그대로) */
export function doneProjects(data: PlanData): Project[] {
  return data.projects.filter((p) => isProjectDone(p, data.tasks));
}
