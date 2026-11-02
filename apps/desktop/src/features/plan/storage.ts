import { invoke, isTauri } from "@tauri-apps/api/core";
import type { PlanData } from "./types";

const CURRENT_VERSION = 1;

/** 파일이 아직 없을 때 쓰는 빈 데이터 */
export function createEmptyPlanData(): PlanData {
  return {
    version: CURRENT_VERSION,
    categories: [],
    tasks: [],
    view: { collapsed: [], showApplicationEvents: true, recentColors: [] },
  };
}

/** 겉모양(카테고리·태스크 배열, view 칸)만 확인한다 */
function hasDataShape(value: unknown): value is { version?: unknown; categories: unknown[]; tasks: unknown[]; view: unknown } {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.categories) && Array.isArray(v.tasks) && typeof v.view === "object" && v.view !== null;
}

/**
 * 저장된 플랜 데이터를 읽는다. 파일이 없으면 빈 데이터를 돌려준다.
 * 파일이 깨졌거나 모르는 버전이면 예외를 던진다. 이때 저장도 막아서 기존 파일을 덮어쓰지 않는다.
 * Tauri 밖(브라우저 미리보기)에서는 저장하지 않고 빈 데이터로 시작한다.
 */
export async function loadPlanData(): Promise<PlanData> {
  if (!isTauri()) return createEmptyPlanData();

  const raw = await invoke<string | null>("load_plan");
  if (raw === null) return createEmptyPlanData();

  const parsed: unknown = JSON.parse(raw);
  if (!hasDataShape(parsed)) {
    throw new Error("plan.json 형식이 올바르지 않습니다.");
  }
  if (parsed.version !== CURRENT_VERSION) {
    throw new Error(`지원하지 않는 파일 버전입니다: ${String(parsed.version)}`);
  }
  return parsed as PlanData;
}

export async function savePlanData(data: PlanData): Promise<void> {
  if (!isTauri()) return;
  await invoke("save_plan", { json: JSON.stringify(data, null, 2) });
}
