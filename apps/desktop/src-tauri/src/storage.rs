//! 지원 관리 데이터 저장: 앱 데이터 폴더의 applications.json 파일 하나를 읽고 쓴다.
//! JSON 내용은 해석하지 않고 문자열 그대로 주고받는다. 형식 확인은 프론트엔드가 한다.

use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::ipc::{InvokeBody, Request};
use tauri::{AppHandle, Manager};

const APPLICATIONS_FILE: &str = "applications.json";

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
pub fn load_applications(app: AppHandle) -> Result<Option<String>, String> {
    let path = data_dir(&app)?.join(APPLICATIONS_FILE);
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
pub fn save_applications(app: AppHandle, json: String) -> Result<(), String> {
    let dir = data_dir(&app)?;
    let path = dir.join(APPLICATIONS_FILE);
    let tmp = dir.join(format!("{APPLICATIONS_FILE}.tmp"));
    fs::write(&tmp, json).map_err(|e| format!("임시 파일을 쓰지 못함: {e}"))?;
    fs::rename(&tmp, &path).map_err(|e| format!("파일을 바꾸지 못함: {e}"))?;
    Ok(())
}

const IMAGES_DIR: &str = "images";
const IMAGE_EXTS: [&str; 5] = ["png", "jpg", "jpeg", "gif", "webp"];

/// 붙여 넣은 이미지 바이트를 그대로 받아 `images/`에 저장하고, 본문에 넣을 상대 경로(`images/파일명`)를 돌려준다.
/// 바이트는 JSON 배열이 아니라 요청 본문(raw)으로 받고, 확장자는 `x-image-ext` 머리글로 받는다.
#[tauri::command]
pub fn save_image(app: AppHandle, request: Request<'_>) -> Result<String, String> {
    let InvokeBody::Raw(bytes) = request.body() else {
        return Err("이미지 바이트가 아님".into());
    };
    let ext = request
        .headers()
        .get("x-image-ext")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_ascii_lowercase())
        .filter(|s| IMAGE_EXTS.contains(&s.as_str()))
        .ok_or("지원하지 않는 이미지 형식")?;

    let dir = data_dir(&app)?.join(IMAGES_DIR);
    fs::create_dir_all(&dir).map_err(|e| format!("이미지 폴더를 만들지 못함: {e}"))?;

    // 파일명: 저장 시각(밀리초). 같은 이름이 있으면 뒤에 -1, -2 …를 붙인다.
    let millis = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0);
    let mut name = format!("{millis}.{ext}");
    let mut n = 1;
    while dir.join(&name).exists() {
        name = format!("{millis}-{n}.{ext}");
        n += 1;
    }
    fs::write(dir.join(&name), bytes).map_err(|e| format!("이미지를 쓰지 못함: {e}"))?;
    Ok(format!("{IMAGES_DIR}/{name}"))
}
