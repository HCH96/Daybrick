import { invoke, isTauri } from "@tauri-apps/api/core";
import { createDefaultProperties } from "./defaultProperties";
import { isV1Data, migrateV1ToV2 } from "./migrate";
import type { ApplicationsData } from "./types";

const CURRENT_VERSION = 2;

/** 파일이 아직 없을 때 쓰는 빈 데이터 (기본 속성만 들어 있음) */
export function createEmptyData(): ApplicationsData {
  return { version: CURRENT_VERSION, properties: createDefaultProperties(), applications: [] };
}

/** 버전과 상관없이 겉모양(속성·카드 배열)만 확인한다 */
function hasDataShape(value: unknown): value is { version?: unknown; properties: unknown[]; applications: unknown[] } {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.properties) && Array.isArray(v.applications);
}

/**
 * 저장된 데이터를 읽는다. 파일이 없으면 빈 데이터를 돌려준다.
 * v1 파일이면 v2로 옮기고 곧바로 저장한다 (D20, 백업 없음).
 * 파일이 깨졌거나 모르는 버전이면 예외를 던진다. 이때 저장도 막아서 기존 파일을 덮어쓰지 않는다.
 * Tauri 밖(브라우저 미리보기)에서는 저장하지 않고 빈 데이터로 시작한다.
 */
export async function loadApplicationsData(): Promise<ApplicationsData> {
  if (!isTauri()) return createEmptyData();

  const raw = await invoke<string | null>("load_applications");
  if (raw === null) return createEmptyData();

  const parsed: unknown = JSON.parse(raw);
  if (!hasDataShape(parsed)) {
    throw new Error("applications.json 형식이 올바르지 않습니다.");
  }
  if (isV1Data(parsed)) {
    const migrated = migrateV1ToV2(parsed, () => crypto.randomUUID());
    await saveApplicationsData(migrated);
    return migrated;
  }
  if (parsed.version !== CURRENT_VERSION) {
    throw new Error(`지원하지 않는 파일 버전입니다: ${String(parsed.version)}`);
  }
  return parsed as ApplicationsData;
}

export async function saveApplicationsData(data: ApplicationsData): Promise<void> {
  if (!isTauri()) return;
  await invoke("save_applications", { json: JSON.stringify(data, null, 2) });
}
