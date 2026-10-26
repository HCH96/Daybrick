//! 알림 데이터 저장: 앱 데이터 폴더의 notifications.json 파일 하나를 읽고 쓴다 (D8).
//! JSON 내용은 해석하지 않고 문자열 그대로 주고받는다. 형식 확인은 프론트엔드가 한다.
//! 지원 관리(storage.rs)와 같은 방식이다.

use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const NOTIFICATIONS_FILE: &str = "notifications.json";

fn data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("앱 데이터 폴더를 찾지 못함: {e}"))?;
    fs::create_dir_all(&dir).map_err(|e| format!("앱 데이터 폴더를 만들지 못함: {e}"))?;
    Ok(dir)
}

/// 저장된 JSON 문자열을 돌려준다. 파일이 아직 없으면 None.
#[tauri::command]
pub fn load_notifications(app: AppHandle) -> Result<Option<String>, String> {
    let path = data_dir(&app)?.join(NOTIFICATIONS_FILE);
    if !path.exists() {
        return Ok(None);
    }
    fs::read_to_string(&path)
        .map(Some)
        .map_err(|e| format!("파일을 읽지 못함: {e}"))
}

/// 임시 파일에 다 쓴 뒤 원래 파일과 바꿔치기한다.
/// 쓰는 도중 앱이 꺼져도 기존 파일이 반쯤 덮어써진 채로 남지 않는다.
#[tauri::command]
pub fn save_notifications(app: AppHandle, json: String) -> Result<(), String> {
    let dir = data_dir(&app)?;
    let path = dir.join(NOTIFICATIONS_FILE);
    let tmp = dir.join(format!("{NOTIFICATIONS_FILE}.tmp"));
    fs::write(&tmp, json).map_err(|e| format!("임시 파일을 쓰지 못함: {e}"))?;
    fs::rename(&tmp, &path).map_err(|e| format!("파일을 바꾸지 못함: {e}"))?;
    Ok(())
}
