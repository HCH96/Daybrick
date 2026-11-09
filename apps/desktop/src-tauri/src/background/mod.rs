mod tray;
mod window;

pub use window::show_main_window;

/// 앱 시작 때 백그라운드 실행 준비: 트레이 아이콘을 만든다.
pub fn setup<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    tray::create_tray(app)
}
