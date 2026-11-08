import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { loadCalendarData } from "./storage";
import { useSyncReload } from "../sync/useSync";
import { normalizeTime, reducer, type CalendarState } from "./reducer";
import type { PersonalEventPatch } from "./types";
import { useCalendarAutoSave, type SaveStatus } from "./useAutoSave";

export interface CalendarStore {
  state: CalendarState;
  saveStatus: SaveStatus;
  /**
   * 개인 일정을 만든다 (R21). 제목이 공백뿐이면 만들지 않고 null을 돌려준다.
   * 기간 일정(start ≠ end)이면 time은 버린다 (R26). 만든 일정의 id를 돌려준다.
   */
  addEvent: (title: string, start: string, end: string, time?: string | null) => string | null;
  /** 칸 몇 개를 바꾼다. 제목이 비거나 시작일이 끝일보다 늦어지면 무시한다 */
  updateEvent: (id: string, patch: PersonalEventPatch) => void;
  /** 시작일·끝일을 함께 days일 옮긴다 (음수면 앞으로) */
  moveEvent: (id: string, days: number) => void;
  deleteEvent: (id: string) => void;
}

const CalendarContext = createContext<CalendarStore | null>(null);

/**
 * 개인 일정(calendar.json) 전체를 들고, 바뀌면 자동 저장한다 (D7).
 * 플랜 주간 달력도 개인 일정을 보므로 PlanProvider 안쪽에 둔다.
 */
export function CalendarProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { kind: "loading" });
  const saveStatus = useCalendarAutoSave(state.kind === "ready" ? state.data : null);

  useEffect(() => {
    let alive = true;
    loadCalendarData()
      .then((data) => {
        if (alive) dispatch({ type: "loaded", data });
      })
      .catch((e: unknown) => {
        console.error("캘린더 데이터 읽기 실패", e);
        if (alive) dispatch({ type: "load-failed", message: e instanceof Error ? e.message : String(e) });
      });
    return () => {
      alive = false;
    };
  }, []);

  // 서버 내용을 받아 파일이 바뀌면 다시 읽는다 (동기화 R23). 자동 저장이 같은 내용을 써도 해시가 같아 다시 올라가지 않는다
  useSyncReload("calendar", async () => {
    const data = await loadCalendarData();
    dispatch({ type: "loaded", data });
  });

  const store = useMemo<CalendarStore>(
    () => ({
      state,
      saveStatus,
      addEvent: (title, start, end, time = null) => {
        const trimmed = title.trim();
        if (trimmed === "" || state.kind !== "ready") return null;
        const [from, to] = start <= end ? [start, end] : [end, start];
        const now = new Date().toISOString();
        const id = crypto.randomUUID();
        dispatch({
          type: "add",
          event: { id, title: trimmed, start: from, end: to, time: normalizeTime(from, to, time), createdAt: now, updatedAt: now },
        });
        return id;
      },
      updateEvent: (id, patch) => dispatch({ type: "update", id, patch, now: new Date().toISOString() }),
      moveEvent: (id, days) => dispatch({ type: "move", id, days, now: new Date().toISOString() }),
      deleteEvent: (id) => dispatch({ type: "delete", id }),
    }),
    [state, saveStatus],
  );

  return <CalendarContext.Provider value={store}>{children}</CalendarContext.Provider>;
}

export function useCalendar(): CalendarStore {
  const store = useContext(CalendarContext);
  if (!store) {
    throw new Error("useCalendar는 CalendarProvider 안에서만 쓸 수 있다.");
  }
  return store;
}
