import { invoke, isTauri } from "@tauri-apps/api/core";
import { readPreview, writePreview } from "../../dev/previewStore";
import type { ServerConfig, ServerConnection, ServerStatus } from "./types";

const SERVER_STATUSES: readonly ServerStatus[] = [
  "connected",
  "off",
  "login-needed",
  "server-update",
  "app-update",
  "paused",
  "unreachable",
];

/** 파일이 없거나 깨졌을 때 쓰는 기본값: 연결 없음, 첫 실행 안내 아직 안 닫음 */
export function createDefaultServerConfig(): ServerConfig {
  return { version: 1, connection: null, welcomeDismissed: false, lastCheck: null };
}

/** Tauri 밖(브라우저 미리보기)에서는 파일 대신 메모리에 둔다 */
let memoryConfig: ServerConfig | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseConnection(value: unknown): ServerConnection | null {
  if (!isRecord(value)) return null;
  const { url, anonKey, connectedAt } = value;
  if (typeof url !== "string" || typeof anonKey !== "string" || typeof connectedAt !== "string") {
    return null;
  }
  return { url, anonKey, connectedAt };
}

function parseLastCheck(value: unknown): ServerConfig["lastCheck"] {
  if (!isRecord(value)) return null;
  const { status, at } = value;
  if (typeof at !== "string" || !SERVER_STATUSES.includes(status as ServerStatus)) return null;
  return { status: status as ServerStatus, at };
}

/** JSON 문자열을 ServerConfig로 바꾼다. 형식이 틀리면 기본값을 돌려준다. */
function parseServerConfig(raw: string): ServerConfig {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return createDefaultServerConfig();
  }
  if (!isRecord(parsed) || parsed.version !== 1) return createDefaultServerConfig();
  return {
    version: 1,
    connection: parseConnection(parsed.connection),
    welcomeDismissed: parsed.welcomeDismissed === true,
    lastCheck: parseLastCheck(parsed.lastCheck),
  };
}

/** 저장된 연결 정보를 읽는다. 파일이 없거나 깨졌으면 기본값. */
export async function loadServerConfig(): Promise<ServerConfig> {
  if (!isTauri()) {
    const preview = readPreview("server");
    return memoryConfig ?? (preview === null ? createDefaultServerConfig() : parseServerConfig(preview));
  }
  const raw = await invoke<string | null>("load_server_config");
  return raw === null ? createDefaultServerConfig() : parseServerConfig(raw);
}

export async function saveServerConfig(config: ServerConfig): Promise<void> {
  if (!isTauri()) {
    memoryConfig = config;
    writePreview("server", JSON.stringify(config));
    return;
  }
  await invoke("save_server_config", { json: JSON.stringify(config, null, 2) });
}

/** 이 PC에 저장한 연결 정보를 지운다 (서버 데이터는 그대로). */
export async function clearServerConnection(): Promise<void> {
  if (!isTauri()) {
    memoryConfig = null;
    return;
  }
  await invoke("clear_server_connection");
}
