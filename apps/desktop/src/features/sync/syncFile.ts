import { invoke, isTauri } from "@tauri-apps/api/core";
import { SYNC_KINDS, type KindState, type KindSync, type SyncFile, type SyncKind } from "./types";

const SYNC_FILE_VERSION = 1;
const KIND_STATES: readonly KindState[] = ["ok", "pending", "choice", "error", "skipped"];

function createEmptyKind(): KindSync {
  return { rev: null, hash: null, syncedAt: null, state: "ok", error: null };
}

/** 꺼짐, 계정 없음, 종류마다 rev·hash null, state "ok" */
export function createDefaultSyncFile(): SyncFile {
  const kinds = {} as Record<SyncKind, KindSync>;
  for (const kind of SYNC_KINDS) kinds[kind] = createEmptyKind();
  return { version: SYNC_FILE_VERSION, enabled: false, userId: null, kinds };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/** 종류 하나의 상태를 읽는다. 칸이 틀리면 그 칸만 기본값으로 둔다. */
function readKind(value: unknown): KindSync {
  if (!isRecord(value)) return createEmptyKind();
  const state = KIND_STATES.find((s) => s === value.state) ?? "ok";
  return {
    rev: typeof value.rev === "number" && Number.isFinite(value.rev) ? value.rev : null,
    hash: stringOrNull(value.hash),
    syncedAt: stringOrNull(value.syncedAt),
    state,
    error: stringOrNull(value.error),
  };
}

/** sync.json 문자열을 상태로 바꾼다. 깨졌거나 모르는 버전이면 기본값. */
function parseSyncFile(raw: string): SyncFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return createDefaultSyncFile();
  }
  if (!isRecord(parsed) || parsed.version !== SYNC_FILE_VERSION) return createDefaultSyncFile();

  const kindsRaw = isRecord(parsed.kinds) ? parsed.kinds : {};
  const kinds = {} as Record<SyncKind, KindSync>;
  for (const kind of SYNC_KINDS) kinds[kind] = readKind(kindsRaw[kind]);
  return {
    version: SYNC_FILE_VERSION,
    enabled: parsed.enabled === true,
    userId: stringOrNull(parsed.userId),
    kinds,
  };
}

/** Tauri 밖(브라우저 미리보기)에서 쓰는 메모리 저장 */
let memoryFile: SyncFile = createDefaultSyncFile();

/**
 * sync.json을 읽는다. 없거나 깨졌으면 꺼진 기본값을 돌려준다.
 * 깨진 sync.json 때문에 앱이 멈추지 않게 예외를 던지지 않는다.
 */
export async function loadSyncFile(): Promise<SyncFile> {
  if (!isTauri()) return memoryFile;
  try {
    const raw = await invoke<string | null>("load_sync_state");
    if (raw === null) return createDefaultSyncFile();
    return parseSyncFile(raw);
  } catch {
    return createDefaultSyncFile();
  }
}

export async function saveSyncFile(file: SyncFile): Promise<void> {
  if (!isTauri()) {
    memoryFile = file;
    return;
  }
  await invoke("save_sync_state", { json: JSON.stringify(file, null, 2) });
}
