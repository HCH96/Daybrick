import { markAllRead, markRead, markUnread, mergeNotification } from "./logic";
import type { NotificationsFile, NotifyInput } from "./types";

/** 알림 데이터 상태: 읽는 중 / 준비됨 / 읽기 실패 (실패하면 저장을 막는다) */
export type NotificationsState =
  | { kind: "loading" }
  | { kind: "ready"; file: NotificationsFile }
  | { kind: "error"; message: string };

/**
 * reducer에 보내는 동작. id·시각처럼 매번 달라지는 값은 보내는 쪽에서 만들어 넣는다.
 * 지금은 로컬 알림만 다룬다 (서버 사본·대기 기록은 7·8단계에서 넓힘).
 */
export type NotificationsAction =
  | { type: "loaded"; file: NotificationsFile }
  | { type: "load-failed"; message: string }
  | { type: "notify"; input: NotifyInput; id: string; now: string }
  | { type: "mark-read"; id: string; now: string }
  | { type: "mark-unread"; id: string }
  | { type: "mark-all-read"; now: string };

export function notificationsReducer(state: NotificationsState, action: NotificationsAction): NotificationsState {
  switch (action.type) {
    case "loaded":
      return { kind: "ready", file: action.file };
    case "load-failed":
      return { kind: "error", message: action.message };
    case "notify":
      if (state.kind !== "ready") return state;
      return withLocal(state.file, mergeNotification(state.file.local, action.input, new Date(action.now), () => action.id));
    case "mark-read":
      if (state.kind !== "ready") return state;
      return withLocal(state.file, markRead(state.file.local, action.id, new Date(action.now)));
    case "mark-unread":
      if (state.kind !== "ready") return state;
      return withLocal(state.file, markUnread(state.file.local, action.id));
    case "mark-all-read":
      if (state.kind !== "ready") return state;
      return withLocal(state.file, markAllRead(state.file.local, new Date(action.now)));
  }
}

function withLocal(file: NotificationsFile, local: NotificationsFile["local"]): NotificationsState {
  return { kind: "ready", file: { ...file, local } };
}
