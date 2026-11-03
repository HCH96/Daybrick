/**
 * 태스크가 속한 묶음의 이름·색 (프로젝트 D2, R45–R53).
 * 플랜 달력 막대·끄는 모습·상세 팝업, 투데이 화면이 카테고리 이름·색 대신 이 값을 쓴다.
 */
import { NONE_CATEGORY_COLOR } from "../plan/color";
import { sortGroupTasks } from "../plan/selectors";
import type { PlanData, Project, Task } from "../plan/types";
import { stageLabel } from "./weeks";

export type TaskGroupInfo =
  | { kind: "category"; name: string; color: string }
  | { kind: "stage"; name: string; projectName: string; color: string }
  | { kind: "none"; name: string; color: string };

/** 미분류 묶음 (카테고리·단계 없음, 또는 없는 카테고리·단계를 가리킴) */
export const NONE_GROUP_INFO: TaskGroupInfo = { kind: "none", name: "미분류", color: NONE_CATEGORY_COLOR };

/** 플랜 트리 접힌 묶음 목록(view.collapsed)에 쓰는 프로젝트 묶음 키 (프로젝트 R45) */
export function projectFoldKey(projectId: string): string {
  return `project:${projectId}`;
}

/** "<프로젝트> › <단계>" (주차형 단계는 "N주차 · 이름") */
export function projectStageName(project: Project, index: number): string {
  return `${project.name} › ${stageLabel(project, index)}`;
}

/** 단계 id → 그 프로젝트와 단계 자리. 없는 단계면 undefined */
export function findStage(data: PlanData, stageId: string): { project: Project; index: number } | undefined {
  for (const project of data.projects) {
    const index = project.stages.findIndex((s) => s.id === stageId);
    if (index >= 0) return { project, index };
  }
  return undefined;
}

/** 단계 묶음 안 순서: 끝나지 않은 것은 플랜 R13 순서, 완료는 최근에 끝낸 것 먼저 (플랜 묶음과 같게, 프로젝트 R48) */
export function splitStageTasks(tasks: Task[]): { open: Task[]; done: Task[] } {
  const open = sortGroupTasks(tasks.filter((t) => t.status !== "done"));
  const done = tasks
    .filter((t) => t.status === "done")
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  return { open, done };
}

/**
 * 태스크 묶음 정보: 프로젝트 단계면 `{ kind: "stage", name: "<프로젝트> › <단계>", color: 프로젝트 색 }`,
 * 카테고리면 그 이름·색, 없으면 미분류 회색. 없는 단계·카테고리를 가리키면 미분류로 본다 (D10).
 */
export function taskGroupInfo(data: PlanData, task: Task): TaskGroupInfo {
  if (task.stageId !== null) {
    const found = findStage(data, task.stageId);
    if (found) {
      const { project, index } = found;
      return { kind: "stage", name: projectStageName(project, index), projectName: project.name, color: project.color };
    }
  }
  if (task.categoryId !== null) {
    const category = data.categories.find((c) => c.id === task.categoryId);
    if (category) return { kind: "category", name: category.name, color: category.color };
  }
  return NONE_GROUP_INFO;
}
