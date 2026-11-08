import { invoke, isTauri } from "@tauri-apps/api/core";
import type { CalendarData } from "./types";

/** 지금 앱이 읽고 쓰는 calendar.json 버전 */
export const CALENDAR_FILE_VERSION = 1;

/** 파일이 아직 없을 때 쓰는 빈 데이터 */
export function createEmptyCalendarData(): CalendarData {
  return { version: CALENDAR_FILE_VERSION, events: [] };
}

/** 겉모양(일정 배열)만 확인한다 */
function hasDataShape(value: unknown): value is { version?: unknown; events: unknown[] } {
  if (typeof value !== "object" || value === null) return false;
  return Array.isArray((value as Record<string, unknown>).events);
}

/**
 * calendar.json 내용(문자열)을 검사해 캘린더 데이터로 바꾼다.
 * 깨졌거나 모르는 버전이면 예외를 던진다. 동기화가 서버 내용을 검사할 때도 쓴다.
 */
export function parseCalendarData(raw: string): CalendarData {
  const parsed: unknown = JSON.parse(raw);
  if (!hasDataShape(parsed)) {
    throw new Error("calendar.json 형식이 올바르지 않습니다.");
  }
  if (parsed.version !== CALENDAR_FILE_VERSION) {
    throw new Error(`지원하지 않는 파일 버전입니다: ${String(parsed.version)}`);
  }
  return parsed as CalendarData;
}

/**
 * 저장된 캘린더 데이터를 읽는다. 파일이 없으면 빈 데이터를 돌려준다.
 * 파일이 깨졌거나 모르는 버전이면 예외를 던진다. 이때 저장도 막아서 기존 파일을 덮어쓰지 않는다.
 * Tauri 밖(브라우저 미리보기)에서는 저장하지 않고 빈 데이터로 시작한다.
 */
export async function loadCalendarData(): Promise<CalendarData> {
  if (!isTauri()) return createEmptyCalendarData();

  const raw = await invoke<string | null>("load_calendar");
  if (raw === null) return createEmptyCalendarData();
  return parseCalendarData(raw);
}

export async function saveCalendarData(data: CalendarData): Promise<void> {
  if (!isTauri()) return;
  await invoke("save_calendar", { json: JSON.stringify(data, null, 2) });
}
