import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { loadPlanData } from "./storage";
import { reducer, type CategoryPatch, type PlanState } from "./reducer";
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
