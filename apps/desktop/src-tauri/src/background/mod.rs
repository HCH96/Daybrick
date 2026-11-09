pub mod app_settings;
pub mod quit;
mod tray;
mod window;

pub use window::show_main_window;

use tauri::{Emitter, Runtime, Window, WindowEvent};

/// 프론트에 창 닫기 요청을 알리는 이벤트 (D1)
const CLOSE_REQUESTED_EVENT: &str = "daybrick://close-requested";

/// 앱 시작 때 백그라운드 실행 준비: 트레이 아이콘을 만든다.
pub fn setup<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    tray::create_tray(app)
}

/// X·Alt+F4로 온 메인 창 닫기 요청을 막고 프론트에 알린다 (R1, R2, D1).
/// 창을 숨길지는 프론트가 정한다. 앱을 끄는 것은 트레이 "종료"뿐이다 (R9).
pub fn on_window_event<R: Runtime>(window: &Window<R>, event: &WindowEvent) {
    if window.label() != "main" {
        return;
    }
    if let WindowEvent::CloseRequested { api, .. } = event {
        api.prevent_close();
        if let Err(e) = window.emit(CLOSE_REQUESTED_EVENT, ()) {
            eprintln!("[background] 닫기 요청 알리기 실패: {e}");
        }
    }
}
