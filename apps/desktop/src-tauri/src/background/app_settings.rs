//! 이 PC에만 두는 앱 설정: 앱 데이터 폴더의 app-settings.json (서버로 동기화하지 않는다).
//! 파일이 없거나 깨졌으면 모든 값을 false로 본다 (structure.md 2절).

use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Runtime};

const SETTINGS_FILE: &str = "app-settings.json";

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct AppSettings {
    /// 첫 실행 때 자동 시작을 등록했는지 (4단계, D5)
    pub autostart_initialized: bool,
    /// 첫 닫기 안내를 봤는지 (R4)
    pub close_notice_seen: bool,
}

fn data_dir<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("앱 데이터 폴더를 찾지 못함: {e}"))?;
    fs::create_dir_all(&dir).map_err(|e| format!("앱 데이터 폴더를 만들지 못함: {e}"))?;
    Ok(dir)
}

/// 설정을 읽는다. 파일이 없거나 읽지 못하거나 깨졌으면 기본값.
pub fn read<R: Runtime>(app: &AppHandle<R>) -> AppSettings {
    let Ok(dir) = data_dir(app) else { return AppSettings::default() };
    let path = dir.join(SETTINGS_FILE);
    let Ok(text) = fs::read_to_string(&path) else { return AppSettings::default() };
    serde_json::from_str(&text).unwrap_or_else(|e| {
        eprintln!("[background] app-settings.json이 깨져 기본값을 써요: {e}");
        AppSettings::default()
    })
}

/// 임시 파일에 다 쓴 뒤 원래 파일과 바꿔치기한다.
pub fn write<R: Runtime>(app: &AppHandle<R>, settings: &AppSettings) -> Result<(), String> {
    let dir = data_dir(app)?;
    let path = dir.join(SETTINGS_FILE);
    let tmp = dir.join(format!("{SETTINGS_FILE}.tmp"));
    let json = serde_json::to_string_pretty(settings).map_err(|e| format!("설정을 글로 바꾸지 못함: {e}"))?;
    fs::write(&tmp, json).map_err(|e| format!("임시 파일을 쓰지 못함: {e}"))?;
    fs::rename(&tmp, &path).map_err(|e| format!("파일을 바꾸지 못함: {e}"))?;
    Ok(())
}

#[tauri::command]
pub fn load_app_settings<R: Runtime>(app: AppHandle<R>) -> AppSettings {
    read(&app)
}

/// 첫 닫기 안내를 봤다고 적는다 (R4). 다른 값은 그대로 둔다.
#[tauri::command]
pub fn mark_close_notice_seen<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    let mut settings = read(&app);
    settings.close_notice_seen = true;
    write(&app, &settings)
}
