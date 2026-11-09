use tauri::{AppHandle, Manager, Runtime};

/// 메인 창을 보여 준다 (R7): 최소화 풀기 → 보이기 → 포커스. 실패는 로그만 남긴다.
pub fn show_main_window<R: Runtime>(app: &AppHandle<R>) {
    let Some(window) = app.get_webview_window("main") else {
        eprintln!("[background] main 창을 찾지 못했어요");
        return;
    };
    if let Err(e) = window.unminimize() {
        eprintln!("[background] 창 최소화 풀기 실패: {e}");
    }
    if let Err(e) = window.show() {
        eprintln!("[background] 창 보이기 실패: {e}");
    }
    if let Err(e) = window.set_focus() {
        eprintln!("[background] 창 포커스 실패: {e}");
    }
}
