/**
 * 브라우저 미리보기 저장소. 개발 모드(`npm run dev`)에서 Tauri 밖으로 열었을 때만 쓴다.
 * 앱 데이터를 localStorage에 두어 새로고침해도 남게 한다. 출시 빌드에서는 아무것도 하지 않는다.
 * 예시 데이터는 주소에 `?fixture=basic`(또는 `empty`)을 붙여 넣는다 (dev/fixtures).
 */
export type PreviewKind = "applications" | "calendar" | "plan" | "today" | "server";

export const PREVIEW_KINDS: readonly PreviewKind[] = ["applications", "calendar", "plan", "today", "server"];

const PREFIX = "daybrick-preview:";

export function readPreview(kind: PreviewKind): string | null {
  if (!import.meta.env.DEV) return null;
  try {
    return localStorage.getItem(PREFIX + kind);
  } catch {
    return null;
  }
}

export function writePreview(kind: PreviewKind, json: string): void {
  if (!import.meta.env.DEV) return;
  try {
    localStorage.setItem(PREFIX + kind, json);
  } catch {
    // 저장소를 못 쓰는 브라우저면 이번 화면에서만 유지된다
  }
}

export function clearPreview(): void {
  if (!import.meta.env.DEV) return;
  for (const kind of PREVIEW_KINDS) {
    try {
      localStorage.removeItem(PREFIX + kind);
    } catch {
      // 무시
    }
  }
}
