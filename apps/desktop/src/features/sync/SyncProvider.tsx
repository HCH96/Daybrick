import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useServer } from "../server/useServer";
import { decide, type ServerSide } from "./compare";
import { KINDS } from "./kinds";
import { fetchDoc, pushDoc } from "./serverApi";
import {
  checkEmptyLocal,
  inspectChoice,
  keepLocal as keepLocalKind,
  takeServer as takeServerKind,
  type ChoiceInfo,
  type ResolveResult,
} from "./resolve";
import { hashOf } from "./stableJson";
import { loadSyncFile, saveSyncFile } from "./syncFile";
import { SYNC_KINDS, type KindSync, type SyncFile, type SyncKind } from "./types";
import { useCloseFlush } from "./useCloseFlush";
import { SyncContext, type SyncBlocked, type SyncState } from "./useSync";
import { deviceName, failed, useUploadQueue } from "./useUploadQueue";

/**
 * 켤 때 종류 하나를 서버와 비교해 처리한다 (R13, R18, D11).
 * upload는 올리고, same은 rev·hash를 기록하고, ask-pull·choose는 "선택 필요"로 둔다 (설정의 [고르기]로 고른다).
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

/** 계정을 바꿀 때 종류마다 마지막으로 맞춘 rev·hash를 비운다 (R16). 로컬·서버 데이터는 건드리지 않는다 */
function forgetServerSide(file: SyncFile, userId: string): SyncFile {
  const kinds = { ...file.kinds };
  for (const kind of SYNC_KINDS) {
    kinds[kind] = { rev: null, hash: null, syncedAt: null, state: "pending", error: null };
  }
  return { ...file, userId, kinds };
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

  const blocked: SyncBlocked = useMemo(() => {
    if (!config?.connection || status === "off") return "off";
    if (status === "app-update") return "app-update";
    if (status === "server-update") return "server-update";
    if (!serverSession) return "login";
    return null;
  }, [config, status, serverSession]);

  // 마지막으로 동기화한 계정과 지금 로그인한 계정이 다르면 자동으로 올리지 않고 묻는다 (R16)
  const accountMismatch =
    file !== null && file.enabled && serverSession !== null && file.userId !== serverSession.userId;

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

  // sync.json을 읽고, 꺼져 있던 사이 로컬 파일이 비었으면 "선택 필요"로 둔다 (R15)
  useEffect(() => {
    let cancelled = false;
    void loadSyncFile().then(async (loaded) => {
      if (cancelled) return;
      fileRef.current = loaded;
      setFile(loaded);
      if (!loaded.enabled) return;
      for (const kind of SYNC_KINDS) {
        const latest = fileRef.current;
        if (cancelled || !latest) return;
        const changed = await checkEmptyLocal(kind, latest.kinds[kind]);
        const after = fileRef.current;
        if (changed && after && !cancelled) await commit({ ...after, kinds: { ...after.kinds, [kind]: changed } });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [commit]);

  const enable = useCallback(async () => {
    const current = fileRef.current;
    if (!current || busyRef.current || blocked !== null || !serverSession) return;
    busyRef.current = true;
    setBusy(true);
    try {
      // 다른 계정의 rev·hash로 이 계정 서버와 비교하지 않게, 계정이 바뀌었으면 비우고 처음부터 비교한다 (R16)
      const base = current.userId === serverSession.userId ? current : forgetServerSide(current, serverSession.userId);
      await commit({ ...base, enabled: true, userId: serverSession.userId });
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

  // 기능 store의 다시 읽기 함수 (R23, D9)
  const reloadsRef = useRef(new Map<SyncKind, () => Promise<void>>());
  const registerReload = useCallback((kind: SyncKind, reload: () => Promise<void>) => {
    reloadsRef.current.set(kind, reload);
    return () => {
      if (reloadsRef.current.get(kind) === reload) reloadsRef.current.delete(kind);
    };
  }, []);

  // 막혀 있거나 계정이 다르면 null: 자동 올리기·고르기가 서버를 부르지 않고 "대기"만 남긴다 (R16, R24)
  const client = blocked === null && serverSession && !accountMismatch ? serverSession.client : null;

  const inspect = useCallback(
    async (kind: SyncKind): Promise<ChoiceInfo> => {
      const device = await deviceName();
      if (!client) return { localTime: null, localDevice: device, localEmpty: false, server: null, error: "로그인이 필요합니다." };
      return inspectChoice(client, kind, device);
    },
    [client],
  );

  /**
   * 고르기·받아오기를 한 종류씩 한다. 도는 동안은 busy라 켜기·자동 올리기가 끼어들지 않는다.
   * 결과 상태를 sync.json에 남기고, 실패 문구를 돌려준다.
   */
  const resolveWith = useCallback(
    async (kind: SyncKind, run: (c: SupabaseClient, prev: KindSync) => Promise<ResolveResult>): Promise<string | null> => {
      const current = fileRef.current;
      if (!current || !current.enabled || !client) return "동기화를 켜고 로그인한 뒤 다시 해 주세요.";
      if (busyRef.current) return "다른 동기화 작업이 끝난 뒤 다시 해 주세요.";
      busyRef.current = true;
      setBusy(true);
      try {
        const result = await run(client, current.kinds[kind]);
        const after = fileRef.current ?? current;
        await commit({ ...after, kinds: { ...after.kinds, [kind]: result.sync } });
        return result.message;
      } catch (e) {
        console.error("동기화 고르기 실패", e);
        return e instanceof Error ? e.message : "처리하지 못했습니다.";
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [client, commit],
  );

  const keepLocal = useCallback(
    (kind: SyncKind) => resolveWith(kind, async (c, prev) => keepLocalKind(c, kind, prev, await deviceName())),
    [resolveWith],
  );
  const takeServer = useCallback(
    (kind: SyncKind) => resolveWith(kind, (c, prev) => takeServerKind(c, kind, prev, reloadsRef.current.get(kind))),
    [resolveWith],
  );

  // 자동 올리기 (R10–R12, R24, R26). 막혀 있으면 client가 null이라 "대기"만 남긴다
  const { notifySaved, uploadNow, uploading } = useUploadQueue({
    fileRef,
    commit,
    client,
    enablingRef: busyRef,
    loaded: file !== null,
    // 켜기 흐름이 끝났을 때도 그 사이 저장된 종류를 올린다
    retryKey: `${status}:${busy}`,
  });
  const closeFlush = useCloseFlush(uploadNow);

  const value = useMemo<SyncState>(
    () => ({
      file,
      blocked,
      accountMismatch,
      enable,
      disable,
      busy,
      notifySaved,
      uploadNow,
      uploading,
      closeFlush,
      registerReload,
      inspect,
      keepLocal,
      takeServer,
    }),
    [file, blocked, accountMismatch, enable, disable, busy, notifySaved, uploadNow, uploading, closeFlush, registerReload, inspect, keepLocal, takeServer],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}
