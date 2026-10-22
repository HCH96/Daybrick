import { withValue } from "./propertyOps";
import { reduceProperties, type PropertyAction } from "./propertyReducer";
import type { Application, ApplicationsData, PropertyValue } from "./types";

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
  | { type: "update-application"; id: string; patch: ApplicationPatch; now: string }
  | { type: "delete-application"; id: string }
  | { type: "set-value"; id: string; propertyId: string; value: PropertyValue; now: string }
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
    default: {
      // 나머지는 속성 정의 동작 (propertyReducer.ts)
      if (state.kind !== "ready") return state;
      const data = reduceProperties(state.data, action);
      return data === state.data ? state : { kind: "ready", data };
    }
  }
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
