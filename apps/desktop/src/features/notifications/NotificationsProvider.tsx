import { useEffect, useMemo, useReducer, type ReactNode } from "react";
import { installDevNotify } from "./devNotify";
import { countUnread, newLocalId, pruneRead, sortForList } from "./logic";
import { registerNotifyReceiver } from "./notify";
import { notificationsReducer } from "./reducer";
import { loadNotificationsFile, saveNotificationsFile } from "./storage";
import type { NotificationsFile } from "./types";
import { useAutoSave } from "./useAutoSave";
import { NotificationsContext, type NotificationsStore } from "./useNotifications";

/**
 * 앱을 켤 때 notifications.json을 읽고, 확인한 지 30일 지난 알림을 바로 지운다 (R27).
 * 지운 것이 있으면 곧바로 저장해 파일에도 반영한다.
 */
async function loadAndPrune(): Promise<NotificationsFile> {
  const file = await loadNotificationsFile();
  const local = pruneRead(file.local, new Date());
  if (local.length === file.local.length) return file;
  const pruned: NotificationsFile = { ...file, local };
  await saveNotificationsFile(pruned);
  return pruned;
}

/** 알림 데이터를 들고, notify()로 온 알림을 받아 합치고, 바뀌면 자동 저장한다 (R21). */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notificationsReducer, { kind: "loading" });
  const ready = state.kind === "ready";
  useAutoSave(ready ? state.file : null);

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
  const store = useMemo<NotificationsStore>(
    () => ({
      state,
      list: local ? sortForList(local) : [],
      unreadCount: local ? countUnread(local) : 0,
      markRead: (id) => dispatch({ type: "mark-read", id, now: new Date().toISOString() }),
      markUnread: (id) => dispatch({ type: "mark-unread", id }),
      markAllRead: () => dispatch({ type: "mark-all-read", now: new Date().toISOString() }),
    }),
    [state, local],
  );

  return <NotificationsContext.Provider value={store}>{children}</NotificationsContext.Provider>;
}
