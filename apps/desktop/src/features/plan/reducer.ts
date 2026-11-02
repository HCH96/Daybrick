import type { Category, ChecklistItem, PlanData, Task, TaskStatus } from "./types";

/** 데이터 상태: 읽는 중 / 준비됨 / 읽기 실패 */
export type PlanState =
  | { kind: "loading" }
  | { kind: "ready"; data: PlanData }
  | { kind: "error"; message: string };

/** 카테고리에서 고칠 수 있는 칸 */
export type CategoryPatch = Partial<Pick<Category, "name" | "color">>;

/** 태스크에서 상세 팝업으로 고칠 수 있는 칸 (R35·R36). 기간은 start·end를 같이 보낸다. */
export type TaskPatch = Partial<Pick<Task, "title" | "categoryId" | "status" | "start" | "end" | "memo">>;

/** 체크리스트 항목에서 고칠 수 있는 칸 (R38) */
export type CheckItemPatch = Partial<Pick<ChecklistItem, "text" | "checked">>;

/** 최근 쓴 색은 최대 8개까지 둔다 */
const RECENT_COLOR_LIMIT = 8;

/**
 * reducer에 보내는 동작. id·시각처럼 매번 달라지는 값은 보내는 쪽에서 만들어 넣는다.
 * (reducer는 같은 입력이면 항상 같은 결과를 내야 하기 때문)
 */
export type PlanAction =
  | { type: "loaded"; data: PlanData }
  | { type: "load-failed"; message: string }
  | { type: "add-category"; category: Category }
  | { type: "update-category"; id: string; patch: CategoryPatch }
  | { type: "move-category"; from: number; to: number }
  | { type: "delete-category"; id: string; now: string }
  | { type: "push-recent-color"; color: string }
  | { type: "add-task"; task: Task }
  | { type: "update-task"; id: string; patch: TaskPatch; now: string }
  | { type: "delete-task"; id: string }
  | { type: "cycle-status"; id: string; now: string }
  | { type: "create-checklist"; id: string; now: string }
  | { type: "delete-checklist"; id: string; now: string }
  | { type: "add-check-item"; id: string; item: ChecklistItem; index: number; now: string }
  | { type: "update-check-item"; id: string; itemId: string; patch: CheckItemPatch; now: string }
  | { type: "delete-check-item"; id: string; itemId: string; now: string }
  | { type: "move-check-item"; id: string; from: number; to: number; now: string }
  | { type: "toggle-collapsed"; key: string }
  | { type: "set-show-application-events"; value: boolean };

export function reducer(state: PlanState, action: PlanAction): PlanState {
  switch (action.type) {
    case "loaded":
      return { kind: "ready", data: action.data };
    case "load-failed":
      return { kind: "error", message: action.message };
    default:
      if (state.kind !== "ready") return state;
      return { kind: "ready", data: dataReducer(state.data, action) };
  }
}

/** 준비된 데이터에만 적용하는 동작 */
function dataReducer(data: PlanData, action: PlanAction): PlanData {
  switch (action.type) {
    case "add-category":
      return { ...data, categories: [...data.categories, action.category] };
    case "update-category":
      return {
        ...data,
        categories: data.categories.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)),
      };
    case "move-category":
      return { ...data, categories: moveItem(data.categories, action.from, action.to) };
    case "delete-category":
      // 그 안의 태스크는 지우지 않고 미분류로 옮긴다 (R9, D5)
      return {
        ...data,
        categories: data.categories.filter((c) => c.id !== action.id),
        tasks: data.tasks.map((t) =>
          t.categoryId === action.id ? { ...t, categoryId: null, updatedAt: action.now } : t,
        ),
        view: { ...data.view, collapsed: data.view.collapsed.filter((id) => id !== action.id) },
      };
    case "push-recent-color": {
      const rest = data.view.recentColors.filter((c) => c !== action.color);
      const recentColors = [action.color, ...rest].slice(0, RECENT_COLOR_LIMIT);
      return { ...data, view: { ...data.view, recentColors } };
    }
    case "add-task":
      return { ...data, tasks: [...data.tasks, action.task] };
    case "update-task": {
      const tasks = replaceTask(data.tasks, action.id, (t) => applyTaskPatch(t, action.patch, action.now));
      return tasks === data.tasks ? data : { ...data, tasks };
    }
    case "delete-task":
      return { ...data, tasks: data.tasks.filter((t) => t.id !== action.id) };
    case "cycle-status":
      // 시작 전 → 진행 중 → 완료 → 시작 전. 완료가 되면 완료한 때를 적고, 벗어나면 지운다 (R18, D13)
      return {
        ...data,
        tasks: data.tasks.map((t) => {
          if (t.id !== action.id) return t;
          const status = NEXT_STATUS[t.status];
          return { ...t, status, completedAt: status === "done" ? action.now : null, updatedAt: action.now };
        }),
      };
    case "create-checklist":
    case "delete-checklist":
    case "add-check-item":
    case "update-check-item":
    case "delete-check-item":
    case "move-check-item": {
      const tasks = replaceTask(data.tasks, action.id, (t) => applyChecklistAction(t, action));
      return tasks === data.tasks ? data : { ...data, tasks };
    }
    case "toggle-collapsed": {
      const { collapsed } = data.view;
      const next = collapsed.includes(action.key)
        ? collapsed.filter((k) => k !== action.key)
        : [...collapsed, action.key];
      return { ...data, view: { ...data.view, collapsed: next } };
    }
    case "set-show-application-events":
      // 지원 일정 보이기·숨기기 (R33). 같은 값이면 저장하지 않게 그대로 둔다.
      if (data.view.showApplicationEvents === action.value) return data;
      return { ...data, view: { ...data.view, showApplicationEvents: action.value } };
    default:
      return data;
  }
}

/**
 * 태스크에 고친 칸을 넣는다. 상태가 완료로 바뀌면 완료한 때를 적고, 완료에서 벗어나면 지운다 (D13과 같게).
 * 이미 완료인 태스크를 다시 완료로 고르면 완료한 때를 그대로 둔다.
 */
function applyTaskPatch(task: Task, patch: TaskPatch, now: string): Task {
  // 바뀐 칸이 없으면 그대로 둔다 (편집기가 열릴 때 같은 메모를 다시 보내도 저장하지 않게)
  const keys = Object.keys(patch) as (keyof TaskPatch)[];
  if (keys.every((k) => patch[k] === task[k])) return task;
  const next: Task = { ...task, ...patch, updatedAt: now };
  if (patch.status !== undefined && patch.status !== task.status) {
    next.completedAt = patch.status === "done" ? now : null;
  }
  return next;
}

type ChecklistAction = Extract<
  PlanAction,
  { type: "create-checklist" | "delete-checklist" | "add-check-item" | "update-check-item" | "delete-check-item" | "move-check-item" }
>;

/**
 * 체크리스트 동작 (R37·R38). 만들기는 빈 목록, 삭제는 null로 되돌린다.
 * 체크리스트가 없는데 항목을 다루려 하거나 바뀐 것이 없으면 그대로 돌려준다 (저장을 건너뛰게).
 */
function applyChecklistAction(task: Task, action: ChecklistAction): Task {
  const list = task.checklist;
  let next: ChecklistItem[] | null;
  switch (action.type) {
    case "create-checklist":
      if (list !== null) return task;
      next = [];
      break;
    case "delete-checklist":
      if (list === null) return task;
      next = null;
      break;
    case "add-check-item": {
      if (list === null) return task;
      const index = Math.max(0, Math.min(action.index, list.length));
      next = [...list.slice(0, index), action.item, ...list.slice(index)];
      break;
    }
    case "update-check-item": {
      if (list === null) return task;
      const { patch } = action;
      const keys = Object.keys(patch) as (keyof CheckItemPatch)[];
      let changed = false;
      next = list.map((item) => {
        if (item.id !== action.itemId || keys.every((k) => patch[k] === item[k])) return item;
        changed = true;
        return { ...item, ...patch };
      });
      if (!changed) return task;
      break;
    }
    case "delete-check-item":
      if (list === null || !list.some((item) => item.id === action.itemId)) return task;
      next = list.filter((item) => item.id !== action.itemId);
      break;
    case "move-check-item":
      if (list === null) return task;
      next = moveItem(list, action.from, action.to);
      if (next === list) return task;
      break;
  }
  return { ...task, checklist: next, updatedAt: action.now };
}

/** id가 같은 태스크 하나를 바꾼다. 바뀐 것이 없으면 같은 배열을 돌려준다 (저장을 건너뛰게). */
function replaceTask(tasks: Task[], id: string, change: (task: Task) => Task): Task[] {
  const index = tasks.findIndex((t) => t.id === id);
  if (index < 0) return tasks;
  const changed = change(tasks[index]);
  if (changed === tasks[index]) return tasks;
  const next = [...tasks];
  next[index] = changed;
  return next;
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = { todo: "doing", doing: "done", done: "todo" };

/** 배열에서 from 자리의 항목을 빼서 to 자리에 넣는다 (D15: 순서 = 배열 순서) */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= items.length || to < 0 || to >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
