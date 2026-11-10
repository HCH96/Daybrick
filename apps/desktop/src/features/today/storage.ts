import { invoke, isTauri } from "@tauri-apps/api/core";
import { readPreview, writePreview } from "../../dev/previewStore";
import type { TodayData } from "./types";

/** 지금 앱이 읽고 쓰는 today.json 버전 */
export const TODAY_FILE_VERSION = 1;

/** 하루 목표 기본값 (분, D4) */
export const DEFAULT_DAILY_GOAL_MINUTES = 360;

/** 파일이 아직 없을 때 쓰는 빈 데이터 */
export function createEmptyTodayData(): TodayData {
  return {
    version: TODAY_FILE_VERSION,
    records: [],
    running: null,
    settings: { dailyGoalMinutes: DEFAULT_DAILY_GOAL_MINUTES },
  };
}

/** 겉모양(기록 배열, running 칸, settings 칸)만 확인한다 */
function hasDataShape(value: unknown): value is { version?: unknown; records: unknown[]; running: unknown; settings: unknown } {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.records) &&
    "running" in v &&
    (v.running === null || typeof v.running === "object") &&
    typeof v.settings === "object" &&
    v.settings !== null
  );
}

/**
 * today.json 내용(문자열)을 검사해 투데이 데이터로 바꾼다.
 * 깨졌거나 모르는 버전이면 예외를 던진다. 동기화가 서버 내용을 검사할 때도 쓴다.
 */
export function parseTodayData(raw: string): TodayData {
  const parsed: unknown = JSON.parse(raw);
  if (!hasDataShape(parsed)) {
    throw new Error("today.json 형식이 올바르지 않습니다.");
  }
  if (parsed.version !== TODAY_FILE_VERSION) {
    throw new Error(`지원하지 않는 파일 버전입니다: ${String(parsed.version)}`);
  }
  return parsed as TodayData;
}

/**
 * 저장된 투데이 데이터를 읽는다. 파일이 없으면 빈 데이터를 돌려준다.
 * 파일이 깨졌거나 모르는 버전이면 예외를 던진다. 이때 저장도 막아서 기존 파일을 덮어쓰지 않는다.
 * Tauri 밖(브라우저 미리보기)에서는 저장하지 않고 빈 데이터로 시작한다.
 */
export async function loadTodayData(): Promise<TodayData> {
  const raw = isTauri() ? await invoke<string | null>("load_today") : readPreview("today");
  if (raw === null) return createEmptyTodayData();
  return parseTodayData(raw);
}

export async function saveTodayData(data: TodayData): Promise<void> {
  if (!isTauri()) {
    writePreview("today", JSON.stringify(data));
    return;
  }
  await invoke("save_today", { json: JSON.stringify(data, null, 2) });
}
