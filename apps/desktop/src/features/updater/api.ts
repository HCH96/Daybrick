import { Channel, invoke, isTauri } from "@tauri-apps/api/core";

/** 업데이트 기능 정보 (structure.md 2절). available은 개발 모드·브라우저 미리보기에서 false (R5) */
export interface UpdaterInfo {
  currentVersion: string;
  available: boolean;
}

/** check_update가 찾은 새 버전 */
export interface FoundUpdate {
  version: string;
  notes: string | null;
}

/** 받는 중 진행률. downloaded는 누적 바이트, total은 모르면 null */
export interface DownloadProgress {
  downloaded: number;
  total: number | null;
}

/** Rust 오류 모양 (D1). network는 연결·응답·설치 실행 등, signature는 서명 불일치 */
export interface UpdateError {
  kind: "network" | "signature";
  message: string;
}

/** 알 수 없는 오류 값을 UpdateError로 맞춘다 (문자열 오류 등은 network로 본다) */
export function toUpdateError(e: unknown): UpdateError {
  if (typeof e === "object" && e !== null && "kind" in e && "message" in e) {
    const { kind, message } = e as { kind: unknown; message: unknown };
    if ((kind === "network" || kind === "signature") && typeof message === "string") return { kind, message };
  }
  return { kind: "network", message: String(e) };
}

export async function updaterInfo(): Promise<UpdaterInfo> {
  if (!isTauri()) return { currentVersion: "", available: false };
  return invoke<UpdaterInfo>("updater_info");
}

/** 새 버전이 있으면 그 정보, 없으면 null. 실패하면 UpdateError로 거부 */
export async function checkUpdate(): Promise<FoundUpdate | null> {
  try {
    return await invoke<FoundUpdate | null>("check_update");
  } catch (e) {
    throw toUpdateError(e);
  }
}

/** 찾은 업데이트를 받는다. 서명 확인까지 통과하면 성공 (D2) */
export async function downloadUpdate(onProgress: (p: DownloadProgress) => void): Promise<void> {
  const onEvent = new Channel<DownloadProgress>();
  onEvent.onmessage = onProgress;
  try {
    await invoke("download_update", { onEvent });
  } catch (e) {
    throw toUpdateError(e);
  }
}

/** 받은 파일로 설치한다. 성공하면 앱이 꺼진다 */
export async function installUpdate(): Promise<void> {
  try {
    await invoke("install_update");
  } catch (e) {
    throw toUpdateError(e);
  }
}

/** 받은 바이트를 버린다 ([나중에 설치], D2) */
export function discardUpdate(): Promise<void> {
  return invoke("discard_update");
}

/** 알린 버전을 app-settings.json에 적는다 (R7, R14). 실패하면 문자열 오류 */
export function markUpdateNotified(version: string): Promise<void> {
  return invoke("mark_update_notified", { version });
}
