import { invoke, isTauri } from "@tauri-apps/api/core";
import { createDefaultProperties } from "./defaultProperties";
import { isV1Data, migrateV1ToV2 } from "./migrate";
import type { ApplicationsData } from "./types";

/** 지금 앱이 읽고 쓰는 applications.json 버전 */
export const APPLICATIONS_FILE_VERSION = 2;

/** 파일이 아직 없을 때 쓰는 빈 데이터 (기본 속성만 들어 있음) */
export function createEmptyData(): ApplicationsData {
  return { version: APPLICATIONS_FILE_VERSION, properties: createDefaultProperties(), applications: [] };
}

/** 버전과 상관없이 겉모양(속성·카드 배열)만 확인한다 */
function hasDataShape(value: unknown): value is { version?: unknown; properties: unknown[]; applications: unknown[] } {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.properties) && Array.isArray(v.applications);
}

/** 검사와 v1 → v2 옮기기를 함께 한다. migrated가 true면 v1 파일을 옮긴 것이다. */
function parseWithMigration(raw: string): { data: ApplicationsData; migrated: boolean } {
  const parsed: unknown = JSON.parse(raw);
  if (!hasDataShape(parsed)) {
    throw new Error("applications.json 형식이 올바르지 않습니다.");
  }
  if (isV1Data(parsed)) {
    return { data: migrateV1ToV2(parsed, () => crypto.randomUUID()), migrated: true };
  }
  if (parsed.version !== APPLICATIONS_FILE_VERSION) {
    throw new Error(`지원하지 않는 파일 버전입니다: ${String(parsed.version)}`);
  }
  return { data: parsed as ApplicationsData, migrated: false };
}

/**
 * applications.json 내용(문자열)을 검사해 지원 데이터로 바꾼다.
 * v1이면 메모리에서만 v2로 옮기고 저장하지는 않는다.
 * 깨졌거나 모르는 버전이면 예외를 던진다. 동기화가 서버 내용을 검사할 때도 쓴다.
 */
export function parseApplicationsData(raw: string): ApplicationsData {
  return parseWithMigration(raw).data;
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

  const { data, migrated } = parseWithMigration(raw);
  if (migrated) await saveApplicationsData(data);
  return data;
}

export async function saveApplicationsData(data: ApplicationsData): Promise<void> {
  if (!isTauri()) return;
  await invoke("save_applications", { json: JSON.stringify(data, null, 2) });
}
