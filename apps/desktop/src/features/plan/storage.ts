import { invoke, isTauri } from "@tauri-apps/api/core";
import { readPreview, writePreview } from "../../dev/previewStore";
import type { PlanData, PlanView, Project, Task } from "./types";

/** 지금 앱이 읽고 쓰는 plan.json 버전 */
export const PLAN_FILE_VERSION = 1;

/** 파일이 아직 없을 때 쓰는 빈 데이터 */
export function createEmptyPlanData(): PlanData {
  return {
    version: PLAN_FILE_VERSION,
    categories: [],
    tasks: [],
    projects: [],
    view: { collapsed: [], showApplicationEvents: true, recentColors: [], stageFold: {}, projectsDoneOpen: false },
  };
}

/** 프로젝트 기능 전에 저장된 파일 모양 (새 칸이 없을 수 있다) */
type OldPlanData = Omit<PlanData, "projects" | "tasks" | "view"> & {
  projects?: Project[];
  tasks: (Omit<Task, "stageId"> & { stageId?: string | null })[];
  view: Omit<PlanView, "stageFold" | "projectsDoneOpen"> & Partial<Pick<PlanView, "stageFold" | "projectsDoneOpen">>;
};

/**
 * 프로젝트 기능 전에 저장된 파일에 없는 값을 빈 값으로 채운다 (프로젝트 D6).
 * 파일은 version 1 그대로 두고 옮기지 않는다. 다음 저장 때 채운 값이 함께 적힌다.
 */
function fillMissing(data: OldPlanData): PlanData {
  const { view } = data;
  return {
    ...data,
    projects: Array.isArray(data.projects) ? data.projects : [],
    tasks: data.tasks.map((t) => ({ ...t, stageId: t.stageId ?? null })),
    view: {
      ...view,
      stageFold: typeof view.stageFold === "object" && view.stageFold !== null ? view.stageFold : {},
      projectsDoneOpen: view.projectsDoneOpen === true,
    },
  };
}

/** 겉모양(카테고리·태스크 배열, view 칸)만 확인한다 */
function hasDataShape(value: unknown): value is { version?: unknown; categories: unknown[]; tasks: unknown[]; view: unknown } {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.categories) && Array.isArray(v.tasks) && typeof v.view === "object" && v.view !== null;
}

/**
 * plan.json 내용(문자열)을 검사해 플랜 데이터로 바꾼다.
 * 깨졌거나 모르는 버전이면 예외를 던진다. 동기화가 서버 내용을 검사할 때도 쓴다.
 */
export function parsePlanData(raw: string): PlanData {
  const parsed: unknown = JSON.parse(raw);
  if (!hasDataShape(parsed)) {
    throw new Error("plan.json 형식이 올바르지 않습니다.");
  }
  if (parsed.version !== PLAN_FILE_VERSION) {
    throw new Error(`지원하지 않는 파일 버전입니다: ${String(parsed.version)}`);
  }
  return fillMissing(parsed as OldPlanData);
}

/**
 * 저장된 플랜 데이터를 읽는다. 파일이 없으면 빈 데이터를 돌려준다.
 * 파일이 깨졌거나 모르는 버전이면 예외를 던진다. 이때 저장도 막아서 기존 파일을 덮어쓰지 않는다.
 * Tauri 밖(브라우저 미리보기)에서는 저장하지 않고 빈 데이터로 시작한다.
 */
export async function loadPlanData(): Promise<PlanData> {
  const raw = isTauri() ? await invoke<string | null>("load_plan") : readPreview("plan");
  if (raw === null) return createEmptyPlanData();
  return parsePlanData(raw);
}

export async function savePlanData(data: PlanData): Promise<void> {
  if (!isTauri()) {
    writePreview("plan", JSON.stringify(data));
    return;
  }
  await invoke("save_plan", { json: JSON.stringify(data, null, 2) });
}
