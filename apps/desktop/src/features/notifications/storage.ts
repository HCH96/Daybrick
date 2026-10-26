import { invoke, isTauri } from "@tauri-apps/api/core";
import type { NotificationsFile } from "./types";

const CURRENT_VERSION = 1;

/** 파일이 아직 없을 때 쓰는 빈 데이터 */
export function createEmptyFile(): NotificationsFile {
  return { version: CURRENT_VERSION, local: [], serverCopy: [], pendingAcks: [] };
}

/** 겉모양(배열 세 개)만 확인한다. 알림 하나하나의 항목까지는 보지 않는다. */
function hasFileShape(value: unknown): value is { version?: unknown; local: unknown[]; serverCopy: unknown[]; pendingAcks: unknown[] } {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.local) && Array.isArray(v.serverCopy) && Array.isArray(v.pendingAcks);
}

/** Tauri 밖(브라우저 미리보기)에서는 파일 대신 메모리에만 둔다. */
let memoryFile: NotificationsFile | null = null;

/**
 * 저장된 알림 데이터를 읽는다. 파일이 없으면 빈 데이터를 돌려준다.
 * 파일이 깨졌거나 모르는 버전이면 예외를 던진다. 이때 저장도 막아서 기존 파일을 덮어쓰지 않는다.
 */
export async function loadNotificationsFile(): Promise<NotificationsFile> {
  if (!isTauri()) return memoryFile ?? createEmptyFile();

  const raw = await invoke<string | null>("load_notifications");
  if (raw === null) return createEmptyFile();

  const parsed: unknown = JSON.parse(raw);
  if (!hasFileShape(parsed)) {
    throw new Error("notifications.json 형식이 올바르지 않습니다.");
  }
  if (parsed.version !== CURRENT_VERSION) {
    throw new Error(`지원하지 않는 알림 파일 버전입니다: ${String(parsed.version)}`);
  }
  return parsed as NotificationsFile;
}

export async function saveNotificationsFile(file: NotificationsFile): Promise<void> {
  if (!isTauri()) {
    memoryFile = file;
    return;
  }
  await invoke("save_notifications", { json: JSON.stringify(file, null, 2) });
}
