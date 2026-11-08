import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useServer } from "../server/useServer";
import { decide, type ServerSide } from "./compare";
import { KINDS } from "./kinds";
import { fetchDoc, pushDoc } from "./serverApi";
import { hashOf } from "./stableJson";
import { loadSyncFile, saveSyncFile } from "./syncFile";
import { SYNC_KINDS, type KindSync, type SyncFile, type SyncKind } from "./types";
import { useCloseFlush } from "./useCloseFlush";
import { SyncContext, type SyncBlocked, type SyncState } from "./useSync";
import { deviceName, failed, useUploadQueue } from "./useUploadQueue";

/**
 * 켤 때 종류 하나를 서버와 비교해 처리한다 (R13, R18, D11).
 * upload는 올리고, same은 rev·hash를 기록하고, ask-pull·choose는 "선택 필요"로 둔다 (고르기는 6단계).
 */
async function syncKindOnEnable(
  client: SupabaseClient,
  kind: SyncKind,
  prev: KindSync,
  device: string,
): Promise<KindSync> {
  const def = KINDS[kind];
  const local = await def.readLocal();
  if (local.kind === "unreadable") return { ...prev, state: "skipped", error: local.message };

  const fetched = await fetchDoc(client, kind);
  if (!fetched.ok) return failed(prev, fetched.error);
  const doc = fetched.doc;

  let server: ServerSide | null = null;
  if (doc) {
    try {
      const data = def.parse(doc.data);
      server = { rev: doc.rev, hash: await hashOf(data), empty: def.isEmpty(data) };
    } catch {
      return { ...prev, state: "error", error: "서버 내용을 읽지 못했습니다" };
    }
  }

  const localHash = await hashOf(local.data);
  const verdict = decide(server, { hash: localHash, empty: local.empty }, prev);

  if (verdict === "same" && doc) {
    return { rev: doc.rev, hash: localHash, syncedAt: doc.updatedAt, state: "ok", error: null };
  }
  if (verdict === "upload") {
    const pushed = await pushDoc(client, kind, local.data, def.fileVersion, doc ? doc.rev : null, device);
    if (pushed.ok) return { rev: pushed.rev, hash: localHash, syncedAt: pushed.updatedAt, state: "ok", error: null };
    if ("conflict" in pushed) return { ...prev, state: "choice", error: null };
    return failed(prev, pushed.error);
  }
  return { ...prev, state: "choice", error: null };
}

/** 앱 전체에 하나뿐인 동기화 관리자. sync.json을 읽고 켜기·끄기를 맡는다 */
export function SyncProvider({ children }: { children?: ReactNode }) {
  const { config, status, serverSession } = useServer();
  const [file, setFile] = useState<SyncFile | null>(null);
  const [busy, setBusy] = useState(false);
  // 켜기 흐름은 여러 번 await하므로 최신 값을 ref로도 들고 있는다
  const fileRef = useRef<SyncFile | null>(null);
  const busyRef = useRef(false);
  // sync.json 쓰기를 차례대로 한다 (늦게 시작한 쓰기가 먼저 끝나 옛 내용이 남지 않게)
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    void loadSyncFile().then((loaded) => {
      if (cancelled) return;
      fileRef.current = loaded;
      setFile(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const blocked: SyncBlocked = useMemo(() => {
    if (!config?.connection || status === "off") return "off";
    if (status === "app-update") return "app-update";
    if (status === "server-update") return "server-update";
    if (!serverSession) return "login";
    return null;
  }, [config, status, serverSession]);

  /** 메모리·화면·sync.json을 함께 바꾼다. 저장이 실패해도 이번 실행 동안은 메모리 값을 쓴다 */
  const commit = useCallback(async (next: SyncFile) => {
    fileRef.current = next;
    setFile(next);
    const saving = saveChainRef.current.then(async () => {
      try {
        await saveSyncFile(fileRef.current ?? next);
      } catch (e) {
        console.error("sync.json 저장 실패", e);
      }
    });
    saveChainRef.current = saving;
    await saving;
  }, []);

  const enable = useCallback(async () => {
    const current = fileRef.current;
    if (!current || busyRef.current || blocked !== null || !serverSession) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await commit({ ...current, enabled: true, userId: serverSession.userId });
      const device = await deviceName();
      for (const kind of SYNC_KINDS) {
        const latest = fileRef.current;
        if (!latest || !latest.enabled) break;
        const result = await syncKindOnEnable(serverSession.client, kind, latest.kinds[kind], device);
        const after = fileRef.current ?? latest;
        await commit({ ...after, kinds: { ...after.kinds, [kind]: result } });
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [blocked, serverSession, commit]);

  const disable = useCallback(async () => {
    const current = fileRef.current;
    if (!current || busyRef.current) return;
    await commit({ ...current, enabled: false });
  }, [commit]);

  // 자동 올리기 (R10–R12, R24, R26). 막혀 있으면 client가 null이라 "대기"만 남긴다
  const { notifySaved, uploadNow, uploading } = useUploadQueue({
    fileRef,
    commit,
    client: blocked === null && serverSession ? serverSession.client : null,
    enablingRef: busyRef,
    loaded: file !== null,
    // 켜기 흐름이 끝났을 때도 그 사이 저장된 종류를 올린다
    retryKey: `${status}:${busy}`,
  });
  const closeFlush = useCloseFlush(uploadNow);

  const value = useMemo<SyncState>(
    () => ({ file, blocked, enable, disable, busy, notifySaved, uploadNow, uploading, closeFlush }),
    [file, blocked, enable, disable, busy, notifySaved, uploadNow, uploading, closeFlush],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}
