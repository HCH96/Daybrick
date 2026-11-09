//! 윈도우 로그인 때 자동 시작 (R13–R18).
//! 켜짐 여부는 따로 저장하지 않고 윈도우 등록(HKCU Run)을 그때그때 읽는다 (structure.md 2절).

use serde::Serialize;
use tauri::{AppHandle, Runtime};
use tauri_plugin_autostart::ManagerExt;

use super::app_settings;

/// 자동 시작으로 켜질 때 붙는 인자 (R15). lib.rs의 플러그인 등록과 같은 값.
pub const AUTOSTART_ARG: &str = "--autostart";

/// 개발 모드에서는 자동 시작을 건드리지 않는다 (R18, D6).
fn is_available() -> bool {
    !cfg!(debug_assertions)
}

/// 이번 실행이 자동 시작으로 켜진 것인지 (R15, R16)
pub fn launched_by_autostart() -> bool {
    std::env::args().any(|arg| arg == AUTOSTART_ARG)
}

/// 첫 실행이면 자동 시작을 켠다 (R14). 성공했을 때만 적어 두고, 실패하면 다음 실행 때 다시 한다 (D5).
pub fn init_on_first_run<R: Runtime>(app: &AppHandle<R>) {
    if !is_available() {
        return;
    }
    let mut settings = app_settings::read(app);
    if settings.autostart_initialized {
        return;
    }
    if let Err(e) = app.autolaunch().enable() {
        eprintln!("[background] 첫 실행 자동 시작 등록 실패: {e}");
        return;
    }
    settings.autostart_initialized = true;
    if let Err(e) = app_settings::write(app, &settings) {
        eprintln!("[background] 자동 시작 등록을 적어 두지 못함: {e}");
    }
}

#[derive(Debug, Serialize)]
pub struct AutostartStatus {
    enabled: bool,
    available: bool,
}

#[tauri::command]
pub fn autostart_status<R: Runtime>(app: AppHandle<R>) -> AutostartStatus {
    let enabled = app.autolaunch().is_enabled().unwrap_or_else(|e| {
        eprintln!("[background] 자동 시작 상태 읽기 실패: {e}");
        false
    });
    AutostartStatus { enabled, available: is_available() }
}

/// 자동 시작을 켜거나 끈다. 바꾼 뒤 다시 읽어 값이 다르면 오류 (R17).
#[tauri::command]
pub fn set_autostart<R: Runtime>(app: AppHandle<R>, enabled: bool) -> Result<(), String> {
    if !is_available() {
        return Err("개발 모드에서는 자동 시작을 바꿀 수 없어요".into());
    }
    let launcher = app.autolaunch();
    let result = if enabled { launcher.enable() } else { launcher.disable() };
    result.map_err(|e| format!("자동 시작 설정 실패: {e}"))?;
    let now = launcher.is_enabled().map_err(|e| format!("자동 시작 상태 읽기 실패: {e}"))?;
    if now != enabled {
        return Err("자동 시작 설정이 바뀌지 않았어요".into());
    }
    Ok(())
}
