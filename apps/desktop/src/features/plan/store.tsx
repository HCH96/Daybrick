import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { loadPlanData } from "./storage";
import { reducer, type CategoryPatch, type CheckItemPatch, type PlanState, type TaskPatch } from "./reducer";
import { usePlanAutoSave, type SaveStatus } from "./useAutoSave";

export interface PlanStore {
  state: PlanState;
  saveStatus: SaveStatus;
  /** 카테고리를 목록 맨 끝에 만들고 그 id를 돌려준다 (R7). 데이터가 준비되지 않았으면 null. */
  addCategory: (name: string, color: string) => string | null;
  /** 카테고리 이름·색을 고친다 (R8) */
  updateCategory: (id: string, patch: CategoryPatch) => void;
  /** 카테고리 순서를 바꾼다. from·to는 카테고리 배열 자리 (R8, D15) */
  moveCategory: (from: number, to: number) => void;
  /** 카테고리를 지우고 그 안의 태스크는 미분류로 옮긴다 (R9, D5). 확인 창은 부르는 쪽에서 띄운다. */
  deleteCategory: (id: string) => void;
  /** 최근 쓴 색 맨 앞에 넣는다 (중복 제거, 최대 8개) */
  pushRecentColor: (color: string) => void;
  /**
   * 태스크를 만들고 그 id를 돌려준다. 상태는 "시작 전" (R16·R17·R19).
   * range를 주지 않으면 날짜 없는 태스크. 데이터가 준비되지 않았거나 제목이 비면 null.
   */
  addTask: (title: string, categoryId: string | null, range?: TaskRange) => string | null;
  /** 상세 팝업에서 제목·카테고리·상태·기간·메모를 고친다 (R35·R36). 완료로/완료에서 바뀌면 완료한 때도 맞춘다. */
  updateTask: (id: string, patch: TaskPatch) => void;
  /** 태스크를 지운다 (R40). 확인 창은 부르는 쪽에서 띄운다. */
  deleteTask: (id: string) => void;
  /** 상태를 시작 전 → 진행 중 → 완료 → 시작 전으로 돌린다 (R18, D13) */
  cycleStatus: (id: string) => void;
  /** 빈 체크리스트를 만든다 (R37). 이미 있으면 그대로. */
  createChecklist: (taskId: string) => void;
  /** 체크리스트를 통째로 없앤다 (R38). 확인 창은 부르는 쪽에서 띄운다. */
  deleteChecklist: (taskId: string) => void;
  /** 빈 항목을 index 자리에 넣고 그 id를 돌려준다 (R38). 체크리스트가 없거나 데이터가 준비되지 않았으면 null. */
  addCheckItem: (taskId: string, index: number) => string | null;
  /** 항목 글자·체크를 고친다 (R38) */
  updateCheckItem: (taskId: string, itemId: string, patch: CheckItemPatch) => void;
  /** 항목 하나를 지운다 (R38) */
  deleteCheckItem: (taskId: string, itemId: string) => void;
  /** 항목 순서를 바꾼다. from·to는 항목 배열 자리 (R38, D15) */
  moveCheckItem: (taskId: string, from: number, to: number) => void;
  /** 묶음 접기·펴기 (R12). key는 카테고리 id, 미분류는 "none" */
  toggleCollapsed: (key: string) => void;
  /** 달력의 지원 일정 보이기·숨기기 (R33). plan.json view 칸에 저장된다 (D10). */
  setShowApplicationEvents: (value: boolean) => void;
}

/** 태스크 기간 (둘 다 "YYYY-MM-DD") */
export interface TaskRange {
  start: string;
  end: string;
}

const PlanContext = createContext<PlanStore | null>(null);

/**
 * 플랜 데이터(카테고리·태스크·화면 설정) 전체를 들고, 바뀌면 자동 저장한다 (R5, D10).
 * 앱 전체가 같은 저장소를 보므로 어느 화면에서 바꾸든 다른 화면에 바로 반영된다.
 */
export function PlanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { kind: "loading" });
  const saveStatus = usePlanAutoSave(state.kind === "ready" ? state.data : null);

  useEffect(() => {
    let alive = true;
    loadPlanData()
      .then((data) => {
        if (alive) dispatch({ type: "loaded", data });
      })
      .catch((e: unknown) => {
        console.error("플랜 데이터 읽기 실패", e);
        if (alive) dispatch({ type: "load-failed", message: e instanceof Error ? e.message : String(e) });
      });
    return () => {
      alive = false;
    };
  }, []);

  const ready = state.kind === "ready";
  const store = useMemo<PlanStore>(
    () => ({
      state,
      saveStatus,
      addCategory: (name, color) => {
        if (!ready) return null;
        const id = crypto.randomUUID();
        dispatch({ type: "add-category", category: { id, name, color } });
        return id;
      },
      updateCategory: (id, patch) => {
        dispatch({ type: "update-category", id, patch });
      },
      moveCategory: (from, to) => {
        dispatch({ type: "move-category", from, to });
      },
      deleteCategory: (id) => {
        dispatch({ type: "delete-category", id, now: new Date().toISOString() });
      },
      pushRecentColor: (color) => {
        dispatch({ type: "push-recent-color", color });
      },
      addTask: (title, categoryId, range) => {
        const trimmed = title.trim();
        if (!ready || !trimmed) return null;
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        dispatch({
          type: "add-task",
          task: {
            id,
            title: trimmed,
            categoryId,
            status: "todo",
            start: range?.start ?? null,
            end: range?.end ?? null,
            memo: "",
            checklist: null,
            applicationId: null,
            createdAt: now,
            updatedAt: now,
            completedAt: null,
          },
        });
        return id;
      },
      updateTask: (id, patch) => {
        dispatch({ type: "update-task", id, patch, now: new Date().toISOString() });
      },
      deleteTask: (id) => {
        dispatch({ type: "delete-task", id });
      },
      cycleStatus: (id) => {
        dispatch({ type: "cycle-status", id, now: new Date().toISOString() });
      },
      createChecklist: (taskId) => {
        dispatch({ type: "create-checklist", id: taskId, now: new Date().toISOString() });
      },
      deleteChecklist: (taskId) => {
        dispatch({ type: "delete-checklist", id: taskId, now: new Date().toISOString() });
      },
      addCheckItem: (taskId, index) => {
        if (state.kind !== "ready") return null;
        const task = state.data.tasks.find((t) => t.id === taskId);
        if (!task || task.checklist === null) return null;
        const id = crypto.randomUUID();
        dispatch({
          type: "add-check-item",
          id: taskId,
          item: { id, text: "", checked: false },
          index,
          now: new Date().toISOString(),
        });
        return id;
      },
      updateCheckItem: (taskId, itemId, patch) => {
        dispatch({ type: "update-check-item", id: taskId, itemId, patch, now: new Date().toISOString() });
      },
      deleteCheckItem: (taskId, itemId) => {
        dispatch({ type: "delete-check-item", id: taskId, itemId, now: new Date().toISOString() });
      },
      moveCheckItem: (taskId, from, to) => {
        dispatch({ type: "move-check-item", id: taskId, from, to, now: new Date().toISOString() });
      },
      toggleCollapsed: (key) => {
        dispatch({ type: "toggle-collapsed", key });
      },
      setShowApplicationEvents: (value) => {
        dispatch({ type: "set-show-application-events", value });
      },
    }),
    [state, saveStatus, ready],
  );

  return <PlanContext.Provider value={store}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanStore {
  const store = useContext(PlanContext);
  if (!store) {
    throw new Error("usePlan은 PlanProvider 안에서만 쓸 수 있다.");
  }
  return store;
}
