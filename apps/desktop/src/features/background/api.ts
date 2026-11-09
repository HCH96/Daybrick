import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

/** Rust가 보내는 이벤트 이름 (structure.md 2절) */
const CLOSE_REQUESTED = "daybrick://close-requested";
const QUIT_REQUESTED = "daybrick://quit-requested";

export function showMainWindow(): Promise<void> {
  return invoke("show_main_window");
}

export function hideMainWindow(): Promise<void> {
  return invoke("hide_main_window");
}

export function quitApp(): Promise<void> {
  return invoke("quit_app");
}

/** 종료 요청을 받았다고 Rust에 알린다. 3초 안에 부르지 않으면 Rust가 바로 끈다 (D2). */
export function ackQuitRequest(): Promise<void> {
  return invoke("ack_quit_request");
}

/** X·Alt+F4로 창 닫기 요청이 왔을 때 */
export function listenCloseRequested(fn: () => void): Promise<UnlistenFn> {
  return listen(CLOSE_REQUESTED, () => fn());
}

/** 트레이 "종료"를 눌렀을 때 */
export function listenQuitRequested(fn: () => void): Promise<UnlistenFn> {
  return listen(QUIT_REQUESTED, () => fn());
}
