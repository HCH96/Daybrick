import type { TodayData } from "./types";

/** 데이터 상태: 읽는 중 / 준비됨 / 읽기 실패 (플랜과 같은 흐름) */
export type TodayState =
  | { kind: "loading" }
  | { kind: "ready"; data: TodayData }
  | { kind: "error"; message: string };

/**
 * reducer에 보내는 동작. id·시각처럼 매번 달라지는 값은 보내는 쪽에서 만들어 넣는다.
 * 타이머 동작(시작·일시정지·끝내기 등)은 3단계부터 더한다.
 */
export type TodayAction = { type: "loaded"; data: TodayData } | { type: "load-failed"; message: string };

export function reducer(state: TodayState, action: TodayAction): TodayState {
  switch (action.type) {
    case "loaded":
      return { kind: "ready", data: action.data };
    case "load-failed":
      return { kind: "error", message: action.message };
    default:
      return state;
  }
}
