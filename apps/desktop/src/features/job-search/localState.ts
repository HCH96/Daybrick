import { invoke, isTauri } from "@tauri-apps/api/core";
import type { StatusId } from "../applications/types";

/** 앱 데이터 폴더의 job-search.json (D21): 추천 공고 탭을 마지막으로 떠난 시각, 서버에 못 보낸 상태 변경 */
export interface JobSearchLocal {
  version: 1;
  /** 이 시각 뒤에 수집된 공고에 "새" 표시 (R8). 한 번도 연 적 없으면 null */
  recommendOpenedAt: string | null;
  /** 서버에 반영하지 못한 지원 상태 변경 (13단계에서 쓴다) */
  pendingStatus: { serverId: string; status: StatusId; closed: boolean; at: string }[];
}

const CURRENT_VERSION = 1;

export function createEmptyLocal(): JobSearchLocal {
  return { version: CURRENT_VERSION, recommendOpenedAt: null, pendingStatus: [] };
}

function hasShape(value: unknown): value is { version?: unknown; recommendOpenedAt: unknown; pendingStatus: unknown[] } {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return "recommendOpenedAt" in v && Array.isArray(v.pendingStatus);
}

/** Tauri 밖(브라우저 미리보기)에서는 파일 대신 메모리에만 둔다 */
let memoryLocal: JobSearchLocal | null = null;

/**
 * job-search.json을 읽는다. 파일이 없으면 빈 상태.
 * 깨졌거나 모르는 버전이면 예외를 던진다 (부르는 쪽은 저장도 하지 않아 기존 파일을 덮어쓰지 않는다).
 */
export async function loadJobSearchLocal(): Promise<JobSearchLocal> {
  if (!isTauri()) return memoryLocal ?? createEmptyLocal();
  const raw = await invoke<string | null>("load_job_search_local");
  if (raw === null) return createEmptyLocal();
  const parsed: unknown = JSON.parse(raw);
  if (!hasShape(parsed)) throw new Error("job-search.json 형식이 올바르지 않습니다.");
  if (parsed.version !== CURRENT_VERSION) {
    throw new Error(`지원하지 않는 구직 관리 파일 버전입니다: ${String(parsed.version)}`);
  }
  const openedAt = parsed.recommendOpenedAt;
  return { ...(parsed as JobSearchLocal), recommendOpenedAt: typeof openedAt === "string" ? openedAt : null };
}

export async function saveJobSearchLocal(local: JobSearchLocal): Promise<void> {
  if (!isTauri()) {
    memoryLocal = local;
    return;
  }
  await invoke("save_job_search_local", { json: JSON.stringify(local, null, 2) });
}

/** 추천 공고 탭을 떠난 시각을 남긴다 (R8). 파일을 읽지 못하면 덮어쓰지 않고 그만둔다 */
export async function markRecommendOpened(at: string): Promise<void> {
  const local = await loadJobSearchLocal();
  await saveJobSearchLocal({ ...local, recommendOpenedAt: at });
}
