import { markAllRead, markRead, markUnread, mergeNotification } from "./logic";
import { addPending, applyPending, removeSent } from "./pendingAcks";
import type { AppNotification, NotificationsFile, NotifyInput, PendingAck } from "./types";

/** 알림 데이터 상태: 읽는 중 / 준비됨 / 읽기 실패 (실패하면 저장을 막는다) */
export type NotificationsState =
  | { kind: "loading" }
  | { kind: "ready"; file: NotificationsFile }
  | { kind: "error"; message: string };

/**
 * reducer에 보내는 동작. id·시각처럼 매번 달라지는 값은 보내는 쪽에서 만들어 넣는다.
 * 확인 동작은 로컬 알림과 서버 사본을 함께 바꾸고, 서버 알림의 변화는 대기 기록(pendingAcks)에 쌓는다 (R33, D16).
 */
export type NotificationsAction =
  | { type: "loaded"; file: NotificationsFile }
  | { type: "load-failed"; message: string }
  | { type: "notify"; input: NotifyInput; id: string; now: string }
  | { type: "mark-read"; id: string; now: string }
  | { type: "mark-unread"; id: string; now: string }
  | { type: "mark-all-read"; now: string }
  /** 서버에서 전체를 다시 받았다: 서버 사본을 통째로 바꾼다 (R30, R32). 대기 기록이 우선 */
  | { type: "server-loaded"; list: AppNotification[] }
  /** 실시간으로 받은 행: 같은 id를 바꾸거나 새로 넣는다 (R31). 대기 기록이 우선 */
  | { type: "server-upsert"; notification: AppNotification }
  /** 서버 쓰기에 성공한 대기 기록을 지운다 (R33) */
  | { type: "acks-sent"; sent: PendingAck[] };

export function notificationsReducer(state: NotificationsState, action: NotificationsAction): NotificationsState {
  if (action.type === "loaded") return { kind: "ready", file: action.file };
  if (action.type === "load-failed") return { kind: "error", message: action.message };
  if (state.kind !== "ready") return state;
  const file = state.file;
  switch (action.type) {
    case "notify":
      return ready({ ...file, local: mergeNotification(file.local, action.input, new Date(action.now), () => action.id) });
    case "mark-read": {
      const now = new Date(action.now);
      return changeRead(file, (list) => markRead(list, action.id, now), action.now);
    }
    case "mark-unread":
      return changeRead(file, (list) => markUnread(list, action.id), action.now);
    case "mark-all-read": {
      const now = new Date(action.now);
      return changeRead(file, (list) => markAllRead(list, now), action.now);
    }
    case "server-loaded":
      return ready({ ...file, serverCopy: applyPending(action.list, file.pendingAcks) });
    case "server-upsert": {
      const [notification] = applyPending([action.notification], file.pendingAcks);
      return ready({ ...file, serverCopy: upsertById(file.serverCopy, notification) });
    }
    case "acks-sent":
      return ready({ ...file, pendingAcks: removeSent(file.pendingAcks, action.sent) });
  }
}

function ready(file: NotificationsFile): NotificationsState {
  return { kind: "ready", file };
}

/**
 * 로컬 알림과 서버 사본에 같은 확인 변화를 적용한다.
 * 서버 사본에서 readAt이 바뀐 알림은 대기 기록에 쌓아 두었다가 서버에 쓴다 (먼저 로컬 사본을 바꾼다).
 */
function changeRead(
  file: NotificationsFile,
  change: (list: readonly AppNotification[]) => AppNotification[],
  at: string,
): NotificationsState {
  const local = change(file.local);
  const serverCopy = change(file.serverCopy);
  let pendingAcks = file.pendingAcks;
  serverCopy.forEach((n, i) => {
    if (n.readAt !== file.serverCopy[i].readAt) pendingAcks = addPending(pendingAcks, { id: n.id, readAt: n.readAt, at });
  });
  return ready({ ...file, local, serverCopy, pendingAcks });
}

function upsertById(list: readonly AppNotification[], notification: AppNotification): AppNotification[] {
  const index = list.findIndex((n) => n.id === notification.id);
  if (index < 0) return [notification, ...list];
  return list.map((n, i) => (i === index ? notification : n));
}
