import { useEffect, useMemo, useReducer, type ReactNode } from "react";
import { installDevNotify } from "./devNotify";
import { countUnread, newLocalId, pruneRead, sortForList } from "./logic";
import { registerNotifyReceiver } from "./notify";
import { notificationsReducer } from "./reducer";
import { loadNotificationsFile, saveNotificationsFile } from "./storage";
import type { NotificationsFile } from "./types";
import { useAutoSave } from "./useAutoSave";
import { NotificationsContext, type NotificationsStore } from "./useNotifications";
import { useServerNotifications } from "./useServerNotifications";

/**
 * 앱을 켤 때 notifications.json을 읽고, 확인한 지 30일 지난 알림을 바로 지운다 (R27).
 * 서버 사본도 같은 기준으로 지운다 (서버 행은 받아 올 때 서버에서 지움, D11).
 * 지운 것이 있으면 곧바로 저장해 파일에도 반영한다.
 */
async function loadAndPrune(): Promise<NotificationsFile> {
  const file = await loadNotificationsFile();
  const now = new Date();
  const local = pruneRead(file.local, now);
  const serverCopy = pruneRead(file.serverCopy, now);
  if (local.length === file.local.length && serverCopy.length === file.serverCopy.length) return file;
  const pruned: NotificationsFile = { ...file, local, serverCopy };
  await saveNotificationsFile(pruned);
  return pruned;
}

/**
 * 알림 데이터를 들고, notify()로 온 알림을 받아 합치고, 바뀌면 자동 저장한다 (R21).
 * 서버 알림은 서버 사본으로 받아 로컬 알림과 합쳐 보여준다 (R30, D3).
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notificationsReducer, { kind: "loading" });
  const ready = state.kind === "ready";
  useAutoSave(ready ? state.file : null);
  useServerNotifications(ready, dispatch);

  useEffect(() => {
    installDevNotify();
    let alive = true;
    loadAndPrune()
      .then((file) => {
        if (alive) dispatch({ type: "loaded", file });
      })
      .catch((e: unknown) => {
        console.error("알림 데이터 읽기 실패", e);
        if (alive) dispatch({ type: "load-failed", message: e instanceof Error ? e.message : String(e) });
      });
    return () => {
      alive = false;
    };
  }, []);

  // 파일을 다 읽은 뒤에 받는 쪽을 등록한다. 그 전에 온 알림은 notify.ts의 대기 줄에 남아 있다 (D9).
  useEffect(() => {
    if (!ready) return;
    return registerNotifyReceiver((input) => {
      dispatch({ type: "notify", input, id: newLocalId(), now: new Date().toISOString() });
    });
  }, [ready]);

  const local = state.kind === "ready" ? state.file.local : null;
  const serverCopy = state.kind === "ready" ? state.file.serverCopy : null;
  const all = useMemo(() => (local && serverCopy ? [...local, ...serverCopy] : []), [local, serverCopy]);
  const store = useMemo<NotificationsStore>(
    () => ({
      state,
      list: sortForList(all),
      unreadCount: countUnread(all),
      markRead: (id) => dispatch({ type: "mark-read", id, now: new Date().toISOString() }),
      markUnread: (id) => dispatch({ type: "mark-unread", id }),
      markAllRead: () => dispatch({ type: "mark-all-read", now: new Date().toISOString() }),
    }),
    [state, all],
  );

  return <NotificationsContext.Provider value={store}>{children}</NotificationsContext.Provider>;
}
