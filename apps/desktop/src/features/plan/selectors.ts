/**
 * 플랜 데이터를 받아 결과만 돌려주는 순수 함수 모음.
 * 다른 기능(투데이·타이머·프로젝트)도 여기 함수로 태스크를 읽는다.
 */
import type { Category, PlanData, Task } from "./types";

/** 묶음 키에서 미분류를 가리키는 값 (카테고리 묶음은 그 id). 접힌 묶음 목록에도 이 값을 쓴다. */
export const NONE_GROUP_KEY = "none";

/** 왼쪽 목록의 묶음 하나 */
export interface TaskGroup {
  /** 카테고리 id, 미분류는 "none" */
  key: string;
  /** 미분류면 null */
  category: Category | null;
  /** 끝나지 않은 태스크 (정렬됨, R13) */
  open: Task[];
  /** 완료한 태스크 (최근에 끝낸 것 먼저, R15) */
  done: Task[];
}

/**
 * 카테고리 순서대로 묶음을 만들고, 미분류는 태스크가 있을 때만 맨 끝에 붙인다 (R10·R11).
 * 없는 카테고리를 가리키는 태스크도 미분류로 본다.
 * 있는 프로젝트 단계에 속한 태스크는 빼고(프로젝트 트리에서 따로 보인다, 프로젝트 D2), 없는 단계를 가리키면 미분류로 본다.
 */
export function groupTasksByCategory(data: PlanData): TaskGroup[] {
  const known = new Set(data.categories.map((c) => c.id));
  const stages = knownStageIds(data);
  const byKey = new Map<string, Task[]>();
  for (const task of data.tasks) {
    if (task.stageId !== null && stages.has(task.stageId)) continue;
    const key = task.categoryId !== null && known.has(task.categoryId) ? task.categoryId : NONE_GROUP_KEY;
    const list = byKey.get(key);
    if (list) list.push(task);
    else byKey.set(key, [task]);
  }

  const groups = data.categories.map((category) => makeGroup(category.id, category, byKey.get(category.id) ?? []));
  const none = byKey.get(NONE_GROUP_KEY);
  if (none && none.length > 0) groups.push(makeGroup(NONE_GROUP_KEY, null, none));
  return groups;
}

/** 지금 있는 모든 프로젝트 단계 id */
export function knownStageIds(data: PlanData): Set<string> {
  return new Set(data.projects.flatMap((p) => p.stages.map((s) => s.id)));
}

function makeGroup(key: string, category: Category | null, tasks: Task[]): TaskGroup {
  const open = sortGroupTasks(tasks.filter((t) => t.status !== "done"));
  const done = tasks
    .filter((t) => t.status === "done")
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  return { key, category, open, done };
}

/** 묶음 안 순서: 날짜 없음 먼저 → 시작일 순 → 같으면 만든 순 (R13). 받은 배열은 바꾸지 않는다. */
export function sortGroupTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.start !== b.start) {
      if (a.start === null) return -1;
      if (b.start === null) return 1;
      return a.start.localeCompare(b.start);
    }
    return a.createdAt.localeCompare(b.createdAt);
  });
}

/** 끝나지 않은 태스크 수 (묶음 머리 개수, R12) */
export function countOpen(tasks: Task[]): number {
  return tasks.filter((t) => t.status !== "done").length;
}

/** 그 날짜("YYYY-MM-DD")가 기간 안에 드는 태스크 (달력·투데이에서 쓴다) */
export function tasksOnDate(data: PlanData, key: string): Task[] {
  return data.tasks.filter((t) => t.start !== null && t.end !== null && t.start <= key && key <= t.end);
}

/** 체크리스트 진행도 (R14·R24·R38). 체크리스트가 없으면 0/0. */
export interface ChecklistProgress {
  done: number;
  total: number;
}

export function checklistProgress(task: Task): ChecklistProgress {
  const list = task.checklist ?? [];
  return { done: list.filter((item) => item.checked).length, total: list.length };
}

/** 기간("YYYY-MM-DD" start~end)과 하루라도 겹치는 태스크. 날짜 없는 태스크는 뺀다 (투데이 이번 주 진행 바). */
export function tasksInRange(data: PlanData, start: string, end: string): Task[] {
  return data.tasks.filter((t) => t.start !== null && t.end !== null && t.start <= end && start <= t.end);
}
