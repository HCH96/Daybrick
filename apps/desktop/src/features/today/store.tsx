import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { loadTodayData } from "./storage";
import { reducer, type TodayState } from "./reducer";
import { useTodayAutoSave, type SaveStatus } from "./useAutoSave";

export interface TodayStore {
  state: TodayState;
  saveStatus: SaveStatus;
}

const TodayContext = createContext<TodayStore | null>(null);

/**
 * 투데이 데이터(시간 기록·실행 중 타이머·하루 목표) 전체를 들고, 바뀌면 자동 저장한다 (D8).
 * 앱 전체가 공유하는 타이머 저장소라서 투데이 화면을 떠나도 살아 있다 (R23).
 * 태스크는 PlanProvider의 것을 쓰므로 반드시 그 안쪽에 둔다.
 */
export function TodayProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { kind: "loading" });
  const saveStatus = useTodayAutoSave(state.kind === "ready" ? state.data : null);

  useEffect(() => {
    let alive = true;
    loadTodayData()
      .then((data) => {
        if (alive) dispatch({ type: "loaded", data });
      })
      .catch((e: unknown) => {
        console.error("투데이 데이터 읽기 실패", e);
        if (alive) dispatch({ type: "load-failed", message: e instanceof Error ? e.message : String(e) });
      });
    return () => {
      alive = false;
    };
  }, []);

  const store = useMemo<TodayStore>(() => ({ state, saveStatus }), [state, saveStatus]);

  return <TodayContext.Provider value={store}>{children}</TodayContext.Provider>;
}

export function useToday(): TodayStore {
  const store = useContext(TodayContext);
  if (!store) {
    throw new Error("useToday는 TodayProvider 안에서만 쓸 수 있다.");
  }
  return store;
}
