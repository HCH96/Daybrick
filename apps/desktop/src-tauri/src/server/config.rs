//! 서버 연결 정보 저장: 앱 데이터 폴더의 server.json 하나를 읽고 쓴다.
//! storage.rs와 같이 JSON은 해석하지 않고 문자열 그대로 주고받는다. 형식 확인은 프론트엔드가 한다.
//! 이 파일에는 주소·anon 키처럼 공개돼도 되는 값만 들어간다 (PAT·Anthropic 키는 넣지 않는다).

use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const SERVER_FILE: &str = "server.json";

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
pub fn load_server_config(app: AppHandle) -> Result<Option<String>, String> {
    let path = data_dir(&app)?.join(SERVER_FILE);
    if !path.exists() {
        return Ok(None);
    }
    fs::read_to_string(&path)
        .map(Some)
        .map_err(|e| format!("파일을 읽지 못함: {e}"))
}

/// 임시 파일에 다 쓴 뒤 원래 파일과 바꿔치기한다.
#[tauri::command]
pub fn save_server_config(app: AppHandle, json: String) -> Result<(), String> {
    let dir = data_dir(&app)?;
    let path = dir.join(SERVER_FILE);
    let tmp = dir.join(format!("{SERVER_FILE}.tmp"));
    fs::write(&tmp, json).map_err(|e| format!("임시 파일을 쓰지 못함: {e}"))?;
    fs::rename(&tmp, &path).map_err(|e| format!("파일을 바꾸지 못함: {e}"))?;
    Ok(())
}

/// 이 PC에 저장한 연결 정보(server.json)를 지운다. 서버의 데이터는 건드리지 않는다.
/// 로그인 정보(자격 증명 관리자)는 프론트 `ServerProvider.clearConnection`이 먼저 지운다.
#[tauri::command]
pub fn clear_server_connection(app: AppHandle) -> Result<(), String> {
    let path = data_dir(&app)?.join(SERVER_FILE);
    if path.exists() {
        fs::remove_file(&path).map_err(|e| format!("파일을 지우지 못함: {e}"))?;
    }
    Ok(())
}
