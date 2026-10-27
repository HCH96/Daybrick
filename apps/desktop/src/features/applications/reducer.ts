import { withValue } from "./propertyOps";
import { reduceProperties, type PropertyAction } from "./propertyReducer";
import { changeStatus } from "./transitions";
import type {
  Application,
  ApplicationsData,
  PropertyOption,
  PropertyValue,
  ScheduleEvent,
  StageId,
  StatusId,
} from "./types";

/** 다른 기능이 카드를 만들 때 같이 더하는 선택 항목 (예: 처음 보는 회사 이름) */
export interface NewOption {
  propertyId: string;
  option: PropertyOption;
}

/** 데이터 상태: 읽는 중 / 준비됨 / 읽기 실패 */
export type DataState =
  | { kind: "loading" }
  | { kind: "ready"; data: ApplicationsData }
  | { kind: "error"; message: string };

/** 카드에서 고칠 수 있는 칸들. id·만든 날은 바꾸지 않고, 고친 날은 reducer가 채운다. */
export type ApplicationPatch = Partial<Pick<Application, "title" | "status" | "stage" | "values" | "events" | "body">>;

/**
 * reducer에 보내는 동작. id·시각처럼 매번 달라지는 값은 보내는 쪽에서 만들어 넣는다.
 * (reducer는 같은 입력이면 항상 같은 결과를 내야 하기 때문)
 */
export type Action =
  | { type: "loaded"; data: ApplicationsData }
  | { type: "load-failed"; message: string }
  | { type: "create-application"; application: Application }
  | { type: "create-from-job"; application: Application; options: NewOption[] }
  | { type: "update-application"; id: string; patch: ApplicationPatch; now: string }
  | { type: "delete-application"; id: string }
  | { type: "set-value"; id: string; propertyId: string; value: PropertyValue; now: string }
  | { type: "change-status"; id: string; status: StatusId; stage: StageId | null; now: string }
  | { type: "add-event"; id: string; event: ScheduleEvent; now: string }
  | { type: "update-event"; id: string; event: ScheduleEvent; now: string }
  | { type: "delete-event"; id: string; eventId: string; now: string }
  | PropertyAction;

export function reducer(state: DataState, action: Action): DataState {
  switch (action.type) {
    case "loaded":
      return { kind: "ready", data: action.data };
    case "load-failed":
      return { kind: "error", message: action.message };
    case "create-application":
      if (state.kind !== "ready") return state;
      return withApplications(state.data, [...state.data.applications, action.application]);
    case "create-from-job": {
      // 구직 관리 [지원하기] (job-search R54): 새 선택 항목과 카드를 한 번에 더한다 (항목 없이 값만 남지 않게)
      if (state.kind !== "ready") return state;
      let data = state.data;
      for (const { propertyId, option } of action.options) {
        data = reduceProperties(data, { type: "add-option", propertyId, option });
      }
      return withApplications(data, [...data.applications, action.application]);
    }
    case "update-application": {
      if (state.kind !== "ready") return state;
      let changed = false;
      const applications = state.data.applications.map((a) => {
        if (a.id !== action.id) return a;
        changed = true;
        return { ...a, ...action.patch, updatedAt: action.now };
      });
      return changed ? withApplications(state.data, applications) : state;
    }
    case "delete-application": {
      if (state.kind !== "ready") return state;
      const applications = state.data.applications.filter((a) => a.id !== action.id);
      if (applications.length === state.data.applications.length) return state;
      return withApplications(state.data, applications);
    }
    case "set-value": {
      // 값 하나만 바꾼다. 화면이 값 목록 전체를 보내면 같은 때 고친 다른 값을 덮을 수 있어서 따로 둔다.
      if (state.kind !== "ready") return state;
      let changed = false;
      const applications = state.data.applications.map((a) => {
        if (a.id !== action.id) return a;
        if (action.value === null ? !(action.propertyId in a.values) : a.values[action.propertyId] === action.value) return a;
        changed = true;
        return { ...a, values: withValue(a.values, action.propertyId, action.value), updatedAt: action.now };
      });
      return changed ? withApplications(state.data, applications) : state;
    }
    case "change-status": {
      // 상태 규칙(R20~R22)은 transitions.ts. 같은 상태를 다시 고르면 아무것도 바꾸지 않는다.
      if (state.kind !== "ready") return state;
      return mapApplication(state, action.id, (a) => {
        const next = changeStatus(a, action.status, action.stage);
        return next === a ? a : { ...next, updatedAt: action.now };
      });
    }
    case "add-event": {
      // 지원 마감은 카드당 하나라, 이미 있으면 새로 넣지 않고 그 날짜만 바꾼다 (R39). 다른 종류는 여러 개 (R27).
      if (state.kind !== "ready") return state;
      const { event } = action;
      return mapApplication(state, action.id, (a) => {
        const due = event.kind === "application-due" ? a.events.find((e) => e.kind === "application-due") : undefined;
        if (due) {
          if (due.date === event.date) return a;
          return { ...a, events: a.events.map((e) => (e.id === due.id ? { ...e, date: event.date } : e)), updatedAt: action.now };
        }
        return { ...a, events: [...a.events, event], updatedAt: action.now };
      });
    }
    case "update-event": {
      // 같은 id의 일정을 통째로 바꾼다 (R26). 바뀐 칸이 없으면 그대로 둔다.
      if (state.kind !== "ready") return state;
      const { event } = action;
      return mapApplication(state, action.id, (a) => {
        const old = a.events.find((e) => e.id === event.id);
        if (!old || (old.date === event.date && old.time === event.time && old.memo === event.memo && old.kind === event.kind)) {
          return a;
        }
        return { ...a, events: a.events.map((e) => (e.id === event.id ? event : e)), updatedAt: action.now };
      });
    }
    case "delete-event": {
      if (state.kind !== "ready") return state;
      return mapApplication(state, action.id, (a) => {
        const events = a.events.filter((e) => e.id !== action.eventId);
        return events.length === a.events.length ? a : { ...a, events, updatedAt: action.now };
      });
    }
    default: {
      // 나머지는 속성 정의 동작 (propertyReducer.ts)
      if (state.kind !== "ready") return state;
      const data = reduceProperties(state.data, action);
      return data === state.data ? state : { kind: "ready", data };
    }
  }
}

/** 카드 하나를 바꾼다. update가 같은 카드를 돌려주면 상태를 그대로 둔다. */
function mapApplication(
  state: Extract<DataState, { kind: "ready" }>,
  id: string,
  update: (application: Application) => Application,
): DataState {
  let changed = false;
  const applications = state.data.applications.map((a) => {
    if (a.id !== id) return a;
    const next = update(a);
    if (next !== a) changed = true;
    return next;
  });
  return changed ? withApplications(state.data, applications) : state;
}

function withApplications(data: ApplicationsData, applications: Application[]): DataState {
  return { kind: "ready", data: { ...data, applications } };
}

/** 새 카드: 상태 "지원 준비", 나머지 속성은 모두 없음 (R2) */
export function createApplication(now: Date): Application {
  const iso = now.toISOString();
  return {
    id: crypto.randomUUID(),
    title: "",
    status: "preparing",
    stage: null,
    values: {},
    events: [],
    body: "",
    createdAt: iso,
    updatedAt: iso,
  };
}
