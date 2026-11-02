import type { PlanData } from "./types";

/** 데이터 상태: 읽는 중 / 준비됨 / 읽기 실패 */
export type PlanState =
  | { kind: "loading" }
  | { kind: "ready"; data: PlanData }
  | { kind: "error"; message: string };

/**
 * reducer에 보내는 동작. id·시각처럼 매번 달라지는 값은 보내는 쪽에서 만들어 넣는다.
 * (reducer는 같은 입력이면 항상 같은 결과를 내야 하기 때문)
 */
export type PlanAction = { type: "loaded"; data: PlanData } | { type: "load-failed"; message: string };

export function reducer(state: PlanState, action: PlanAction): PlanState {
  switch (action.type) {
    case "loaded":
      return { kind: "ready", data: action.data };
    case "load-failed":
      return { kind: "error", message: action.message };
    default:
      return state;
  }
}
