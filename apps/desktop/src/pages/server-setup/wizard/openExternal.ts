import { openUrl } from "@tauri-apps/plugin-opener";

/** 외부 링크는 앱 안이 아니라 기본 브라우저로 연다 (R9) */
export function openExternal(url: string) {
  openUrl(url).catch((e: unknown) => console.error("링크 열기 실패", e));
}
