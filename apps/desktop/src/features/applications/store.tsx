import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { loadApplicationsData } from "./storage";
import { createApplication, reducer, type ApplicationPatch, type DataState } from "./reducer";
import type { PropertyAction } from "./propertyReducer";
import { createStageEvent } from "./transitions";
import type { EventKind, PropertyValue, ScheduleEvent, StageId, StatusId } from "./types";
import { toDateKey } from "../../utils/date";
import { useAutoSave, type SaveStatus } from "./useAutoSave";

export interface ApplicationsStore {
  state: DataState;
  saveStatus: SaveStatus;
  /** 새 카드를 만들고 그 id를 돌려준다. 데이터가 준비되지 않았으면 null. */
  createApplication: () => string | null;
  /** 카드 일부를 고친다. 고친 날은 지금 시각으로 바뀐다. 0.5초 뒤 자동 저장 (R15) */
  updateApplication: (id: string, patch: ApplicationPatch) => void;
  /** 카드를 지운다 (R16). 확인 창은 부르는 쪽에서 띄운다. */
  deleteApplication: (id: string) => void;
  /** 카드 하나의 속성 값 하나를 바꾼다. null = 없음 (R31) */
  setValue: (id: string, propertyId: string, value: PropertyValue) => void;
  /** 상태를 바꾼다. 지원 완료면 오늘 일정·지원일을 채운다 (R18~R21, transitions.ts) */
  changeStatus: (id: string, status: StatusId, stage: StageId | null) => void;
  /** 전형 준비 세부 단계의 날짜를 고르면 그 전형 일정을 만든다 (R22) */
  addStageEvent: (id: string, stage: StageId, date: string) => void;
  /** 📅 창에서 종류·날짜로 일정을 추가한다. 같은 종류도 여러 개 가능 (R25·R27) */
  addEvent: (id: string, kind: EventKind, date: string) => void;
  /** 저장된 일정의 날짜·시간·메모를 고친다 (R26) */
  updateEvent: (id: string, event: ScheduleEvent) => void;
  /** 저장된 일정을 지운다 (R26) */
  deleteEvent: (id: string, eventId: string) => void;
  /** 속성 정의를 바꾼다 (추가·이름·종류·삭제·항목). 모든 카드에 함께 반영된다 (R28~R30) */
  changeProperties: (action: PropertyAction) => void;
}

const ApplicationsContext = createContext<ApplicationsStore | null>(null);

/** 지원 관리 데이터 전체를 들고, 바뀌면 자동 저장한다. 홈과 지원 관리 화면이 같은 데이터를 본다. */
export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { kind: "loading" });
  const saveStatus = useAutoSave(state.kind === "ready" ? state.data : null);

  useEffect(() => {
    let alive = true;
    loadApplicationsData()
      .then((data) => {
        if (alive) dispatch({ type: "loaded", data });
      })
      .catch((e: unknown) => {
        console.error("지원 관리 데이터 읽기 실패", e);
        if (alive) dispatch({ type: "load-failed", message: e instanceof Error ? e.message : String(e) });
      });
    return () => {
      alive = false;
    };
  }, []);

  const ready = state.kind === "ready";
  const store = useMemo<ApplicationsStore>(
    () => ({
      state,
      saveStatus,
      createApplication: () => {
        if (!ready) return null;
        const application = createApplication(new Date());
        dispatch({ type: "create-application", application });
        return application.id;
      },
      updateApplication: (id, patch) => {
        dispatch({ type: "update-application", id, patch, now: new Date().toISOString() });
      },
      deleteApplication: (id) => {
        dispatch({ type: "delete-application", id });
      },
      setValue: (id, propertyId, value) => {
        dispatch({ type: "set-value", id, propertyId, value, now: new Date().toISOString() });
      },
      changeStatus: (id, status, stage) => {
        const now = new Date();
        dispatch({
          type: "change-status",
          id,
          status,
          stage,
          today: toDateKey(now),
          eventId: crypto.randomUUID(),
          now: now.toISOString(),
        });
      },
      addStageEvent: (id, stage, date) => {
        if (state.kind !== "ready") return;
        const application = state.data.applications.find((a) => a.id === id);
        if (!application) return;
        const event = createStageEvent(application, stage, date, crypto.randomUUID());
        if (event) dispatch({ type: "add-event", id, event, now: new Date().toISOString() });
      },
      addEvent: (id, kind, date) => {
        const event: ScheduleEvent = { id: crypto.randomUUID(), kind, date, time: null, memo: "" };
        dispatch({ type: "add-event", id, event, now: new Date().toISOString() });
      },
      updateEvent: (id, event) => {
        dispatch({ type: "update-event", id, event, now: new Date().toISOString() });
      },
      deleteEvent: (id, eventId) => {
        dispatch({ type: "delete-event", id, eventId, now: new Date().toISOString() });
      },
      changeProperties: (action) => {
        dispatch(action);
      },
    }),
    [state, saveStatus, ready],
  );

  return <ApplicationsContext.Provider value={store}>{children}</ApplicationsContext.Provider>;
}

export function useApplications(): ApplicationsStore {
  const store = useContext(ApplicationsContext);
  if (!store) {
    throw new Error("useApplications는 ApplicationsProvider 안에서만 쓸 수 있다.");
  }
  return store;
}
