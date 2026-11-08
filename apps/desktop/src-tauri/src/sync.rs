//! 데이터 동기화 로컬 파일: 앱 데이터 폴더의 sync.json(동기화 상태)과 sync-backups/(덮기 전 백업).
//! plan.rs와 같은 방식으로 JSON 내용은 해석하지 않고 문자열 그대로 주고받는다. 형식 확인은 프론트엔드가 한다.

use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use tauri_plugin_opener::OpenerExt;

const SYNC_FILE: &str = "sync.json";
const BACKUP_DIR: &str = "sync-backups";
/// 백업을 받는 종류. 서버 테이블의 kind check 제약과 같다.
const KINDS: [&str; 4] = ["plan", "calendar", "applications", "today"];

fn data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("앱 데이터 폴더를 찾지 못함: {e}"))?;
    fs::create_dir_all(&dir).map_err(|e| format!("앱 데이터 폴더를 만들지 못함: {e}"))?;
    Ok(dir)
}

fn backup_dir(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(data_dir(app)?.join(BACKUP_DIR))
}

/// 임시 파일에 다 쓴 뒤 원래 파일과 바꿔치기한다.
fn write_atomic(path: &PathBuf, json: &str) -> Result<(), String> {
    let mut tmp = path.clone().into_os_string();
    tmp.push(".tmp");
    let tmp = PathBuf::from(tmp);
    fs::write(&tmp, json).map_err(|e| format!("임시 파일을 쓰지 못함: {e}"))?;
    fs::rename(&tmp, path).map_err(|e| format!("파일을 바꾸지 못함: {e}"))?;
    Ok(())
}

/// 저장된 동기화 상태(JSON 문자열)를 돌려준다. 파일이 아직 없으면 None.
#[tauri::command]
pub fn load_sync_state(app: AppHandle) -> Result<Option<String>, String> {
    let path = data_dir(&app)?.join(SYNC_FILE);
    if !path.exists() {
        return Ok(None);
    }
    fs::read_to_string(&path)
        .map(Some)
        .map_err(|e| format!("파일을 읽지 못함: {e}"))
}

#[tauri::command]
pub fn save_sync_state(app: AppHandle, json: String) -> Result<(), String> {
    let path = data_dir(&app)?.join(SYNC_FILE);
    write_atomic(&path, &json)
}

/// 덮기 전 내용을 `sync-backups/<kind>-<YYYYMMDD-HHmmss>.json`에 쓰고 그 경로를 돌려준다.
/// 같은 초에 두 번 쓰면 뒤에 `-2`, `-3`…을 붙여 앞의 백업을 덮지 않는다.
#[tauri::command]
pub fn write_sync_backup(app: AppHandle, kind: String, json: String) -> Result<String, String> {
    if !KINDS.contains(&kind.as_str()) {
        return Err(format!("모르는 종류입니다: {kind}"));
    }
    let dir = backup_dir(&app)?;
    fs::create_dir_all(&dir).map_err(|e| format!("백업 폴더를 만들지 못함: {e}"))?;

    let stamp = chrono::Local::now().format("%Y%m%d-%H%M%S").to_string();
    let mut path = dir.join(format!("{kind}-{stamp}.json"));
    let mut n = 2;
    while path.exists() {
        path = dir.join(format!("{kind}-{stamp}-{n}.json"));
        n += 1;
    }
    write_atomic(&path, &json)?;
    Ok(path.to_string_lossy().into_owned())
}

/// 백업 폴더에 .json 파일이 하나라도 있으면 true.
#[tauri::command]
pub fn has_sync_backups(app: AppHandle) -> Result<bool, String> {
    let dir = backup_dir(&app)?;
    let Ok(entries) = fs::read_dir(&dir) else {
        return Ok(false);
    };
    Ok(entries.flatten().any(|e| {
        e.path().extension().is_some_and(|ext| ext == "json")
    }))
}

/// 백업 폴더를 탐색기로 연다. JS에 경로 권한을 주지 않으려고 Rust에서 연다.
#[tauri::command]
pub fn open_sync_backup_dir(app: AppHandle) -> Result<(), String> {
    let dir = backup_dir(&app)?;
    fs::create_dir_all(&dir).map_err(|e| format!("백업 폴더를 만들지 못함: {e}"))?;
    app.opener()
        .open_path(dir.to_string_lossy(), None::<&str>)
        .map_err(|e| format!("백업 폴더를 열지 못함: {e}"))
}

/// 서버 행에 남길 기기 이름. Windows `COMPUTERNAME`, 못 읽으면 "PC".
#[tauri::command]
pub fn sync_device_name() -> String {
    std::env::var("COMPUTERNAME")
        .ok()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "PC".to_string())
}
