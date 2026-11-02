import type { Category, PlanData, Task, TaskStatus } from "./types";

/** 데이터 상태: 읽는 중 / 준비됨 / 읽기 실패 */
export type PlanState =
  | { kind: "loading" }
  | { kind: "ready"; data: PlanData }
  | { kind: "error"; message: string };

/** 카테고리에서 고칠 수 있는 칸 */
export type CategoryPatch = Partial<Pick<Category, "name" | "color">>;

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
  | { type: "cycle-status"; id: string; now: string }
  | { type: "toggle-collapsed"; key: string };

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
    case "toggle-collapsed": {
      const { collapsed } = data.view;
      const next = collapsed.includes(action.key)
        ? collapsed.filter((k) => k !== action.key)
        : [...collapsed, action.key];
      return { ...data, view: { ...data.view, collapsed: next } };
    }
    default:
      return data;
  }
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
