import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { loadPlanData } from "./storage";
import { reducer, type PlanState } from "./reducer";
import { usePlanAutoSave, type SaveStatus } from "./useAutoSave";

export interface PlanStore {
  state: PlanState;
  saveStatus: SaveStatus;
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

  const store = useMemo<PlanStore>(() => ({ state, saveStatus }), [state, saveStatus]);

  return <PlanContext.Provider value={store}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanStore {
  const store = useContext(PlanContext);
  if (!store) {
    throw new Error("usePlan은 PlanProvider 안에서만 쓸 수 있다.");
  }
  return store;
}
