import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { usePlan } from "../plan/store";
import { loadTodayData } from "./storage";
import { reducer, type TodayState } from "./reducer";
import { runStartFlow } from "./startFlow";
import { useTodayAutoSave, type SaveStatus } from "./useAutoSave";

export interface TodayStore {
  state: TodayState;
  saveStatus: SaveStatus;
  /** 시작 흐름(R26)을 거쳐 타이머를 시작하고 태스크를 진행 중으로 (R16). 이미 도는 타이머가 있으면 무시 (R17). */
  requestStart: (taskId: string) => void;
  /** 일시정지 (R18) */
  pause: () => void;
  /** 재개 (R18) */
  resume: () => void;
  /** 완료: 기록하고 태스크를 완료로 (R19, D2) */
  complete: () => void;
  /** 중단: 기록하고 태스크를 시작 전으로 (R20) */
  stop: () => void;
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
  const { updateTask } = usePlan();

  // 비동기 시작 흐름 뒤에도 최신 상태를 보도록 담아 둔다
  const stateRef = useRef(state);
  stateRef.current = state;
  // 시작 흐름이 도는 동안 두 번째 시작 요청을 막는다 (R17)
  const startingRef = useRef(false);

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

  const store = useMemo<TodayStore>(() => {
    const canStart = () => stateRef.current.kind === "ready" && stateRef.current.data.running === null;

    /** 완료·중단 공통: 구간을 기록으로 옮기고 태스크 상태를 바꾼다 */
    const finish = (status: "done" | "todo") => {
      const current = stateRef.current;
      if (current.kind !== "ready" || current.data.running === null) return;
      const { taskId, segments } = current.data.running;
      dispatch({ type: "finish", now: new Date().toISOString(), recordIds: segments.map(() => crypto.randomUUID()) });
      updateTask(taskId, { status });
    };

    return {
      state,
      saveStatus,
      requestStart: (taskId) => {
        if (startingRef.current || !canStart()) return;
        startingRef.current = true;
        void runStartFlow(taskId, (id) => {
          if (!canStart()) return; // 시작 전 단계를 거치는 사이 다른 타이머가 시작됐으면 그만둔다
          dispatch({ type: "start", taskId: id, now: new Date().toISOString() });
          updateTask(id, { status: "doing" });
        }).finally(() => {
          startingRef.current = false;
        });
      },
      pause: () => dispatch({ type: "pause", now: new Date().toISOString() }),
      resume: () => dispatch({ type: "resume", now: new Date().toISOString() }),
      complete: () => finish("done"),
      stop: () => finish("todo"),
    };
  }, [state, saveStatus, updateTask]);

  return <TodayContext.Provider value={store}>{children}</TodayContext.Provider>;
}

export function useToday(): TodayStore {
  const store = useContext(TodayContext);
  if (!store) {
    throw new Error("useToday는 TodayProvider 안에서만 쓸 수 있다.");
  }
  return store;
}
