import { invoke, isTauri } from "@tauri-apps/api/core";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { KINDS } from "./kinds";
import { pushDoc, type SyncError } from "./serverApi";
import { hashOf } from "./stableJson";
import { SYNC_KINDS, type KindSync, type SyncFile, type SyncKind } from "./types";

/** 로컬 저장 뒤 이만큼 모았다가 올린다 (D7) */
const GATHER_MS = 5_000;

/** network·auth는 연결·로그인이 돌아오면 다시 시도하므로 "대기", 그 밖은 "오류" (D11) */
export function failed(prev: KindSync, error: SyncError): KindSync {
  const state = error.type === "network" || error.type === "auth" ? "pending" : "error";
  return { ...prev, state, error: error.message };
}

/** 올린 기기 이름 (서버 행의 device). 한 번 읽으면 이번 실행 동안 다시 묻지 않는다 */
let deviceCache: Promise<string> | null = null;
export function deviceName(): Promise<string> {
  if (deviceCache) return deviceCache;
  deviceCache = (async () => {
    if (!isTauri()) return "브라우저 미리보기";
    try {
      return await invoke<string>("sync_device_name");
    } catch {
      return "PC";
    }
  })();
  return deviceCache;
}

/**
 * 대기 종류 하나를 올린다 (R13–R15, D8).
 * 못 읽으면 건너뜀 → 마지막 맞춘 해시와 같으면 "맞음"만 → 빈 데이터인데 서버 행이 있으면 "선택 필요"
 * → base_rev = 마지막 rev로 올림 (다르면 충돌 → "선택 필요", R14).
 */
async function uploadKind(client: SupabaseClient, kind: SyncKind, prev: KindSync, device: string): Promise<KindSync> {
  const def = KINDS[kind];
  const local = await def.readLocal();
  if (local.kind === "unreadable") return { ...prev, state: "skipped", error: local.message };

  const hash = await hashOf(local.data);
  if (prev.rev !== null && prev.hash === hash) return { ...prev, state: "ok", error: null };
  // 서버에 행이 있고 마지막으로 맞춘 내용과 다른데 로컬이 비었으면 덮지 않고 묻는다 (R15)
  if (local.empty && prev.rev !== null) return { ...prev, state: "choice", error: null };

  const pushed = await pushDoc(client, kind, local.data, def.fileVersion, prev.rev, device);
  if (pushed.ok) return { rev: pushed.rev, hash, syncedAt: pushed.updatedAt, state: "ok", error: null };
  if ("conflict" in pushed) return { ...prev, state: "choice", error: null };
  return failed(prev, pushed.error);
}

interface QueueDeps {
  fileRef: MutableRefObject<SyncFile | null>;
  commit: (next: SyncFile) => Promise<void>;
  /** 올릴 수 있을 때만 클라이언트 (막혀 있으면 null, D12) */
  client: SupabaseClient | null;
  /** 켜기 흐름이 도는 중인지 (그동안은 올리지 않는다) */
  enablingRef: MutableRefObject<boolean>;
  /** sync.json을 다 읽었는지 */
  loaded: boolean;
  /** 서버 상태 (연결이 돌아오면 대기 종류를 다시 올린다, R11) */
  retryKey: string;
}

export interface UploadQueue {
  notifySaved: (kind: SyncKind) => void;
  /** 타이머를 기다리지 않고 대기 종류를 올린다 (R30). 올리는 중이면 끝난 뒤 한 번 더 */
  uploadNow: () => Promise<void>;
  uploading: boolean;
}

/** 올릴 대상: "대기"이거나 이번 실행에서 저장된 종류. "선택 필요"는 자동으로 올리지 않는다 (R14) */
function targets(file: SyncFile, dirty: Set<SyncKind>): SyncKind[] {
  return SYNC_KINDS.filter((k) => file.kinds[k].state !== "choice" && (file.kinds[k].state === "pending" || dirty.has(k)));
}

/**
 * 자동 올리기 대기열 (R10, R11, R24, R26, D7).
 * 저장 알림 → 그 종류를 "대기"로 sync.json에 남기고 5초 타이머를 다시 건다 → 끝나면 한 종류씩 올린다.
 */
export function useUploadQueue({ fileRef, commit, client, enablingRef, loaded, retryKey }: QueueDeps): UploadQueue {
  const [uploading, setUploading] = useState(false);
  const clientRef = useRef(client);
  clientRef.current = client;
  const timerRef = useRef<number | undefined>(undefined);
  /** 이번 실행에서 저장됐지만 아직 올리지 않은 종류 (켜기 흐름이 상태를 덮어도 잃지 않게) */
  const dirtyRef = useRef(new Set<SyncKind>());
  const runningRef = useRef<Promise<void> | null>(null);
  const againRef = useRef(false);

  const runOnce = useCallback(async () => {
    const device = await deviceName();
    for (const kind of SYNC_KINDS) {
      const current = fileRef.current;
      const c = clientRef.current;
      // 꺼졌거나 막혔으면(로그인 풀림·서버 업데이트) 올리지 않고 "대기"만 남긴다 (R24)
      if (!current || !current.enabled || !c || enablingRef.current) return;
      if (!targets(current, dirtyRef.current).includes(kind)) continue;

      dirtyRef.current.delete(kind);
      let result = await uploadKind(c, kind, current.kinds[kind], device);
      // 올리는 사이 또 저장됐으면 다음 차례에 다시 올린다
      if (dirtyRef.current.has(kind) && result.state === "ok") result = { ...result, state: "pending" };
      const after = fileRef.current ?? current;
      await commit({ ...after, kinds: { ...after.kinds, [kind]: result } });
    }
  }, [fileRef, commit, enablingRef]);

  /** 한 번에 하나씩만 돈다. 도는 중에 부르면 끝난 뒤 한 번 더 돈다 */
  const run = useCallback((): Promise<void> => {
    window.clearTimeout(timerRef.current);
    if (runningRef.current) {
      againRef.current = true;
      return runningRef.current;
    }
    setUploading(true);
    const p = (async () => {
      try {
        do {
          againRef.current = false;
          await runOnce();
        } while (againRef.current);
      } catch (e) {
        console.error("동기화 올리기 실패", e);
      } finally {
        runningRef.current = null;
        setUploading(false);
      }
    })();
    runningRef.current = p;
    return p;
  }, [runOnce]);

  const notifySaved = useCallback(
    (kind: SyncKind) => {
      const current = fileRef.current;
      // 꺼져 있으면 아무것도 하지 않는다. 다시 켜면 켜기 흐름이 종류마다 비교한다 (R27)
      if (current && !current.enabled) return;
      dirtyRef.current.add(kind);
      if (current) {
        const prev = current.kinds[kind];
        if (prev.state !== "pending" && prev.state !== "choice") {
          void commit({ ...current, kinds: { ...current.kinds, [kind]: { ...prev, state: "pending", error: null } } });
        }
      }
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => void run(), GATHER_MS);
    },
    [fileRef, commit, run],
  );

  // 앱을 켰을 때·다시 로그인했을 때·연결이 돌아왔을 때 대기 종류를 바로 한 번 올린다 (R11, R26)
  const canUpload = client !== null;
  useEffect(() => {
    const current = fileRef.current;
    if (!loaded || !canUpload || !current || !current.enabled) return;
    if (targets(current, dirtyRef.current).length > 0) void run();
  }, [loaded, canUpload, retryKey, fileRef, run]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return { notifySaved, uploadNow: run, uploading };
}
