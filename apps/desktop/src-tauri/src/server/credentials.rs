//! 로그인 정보 저장: Windows 자격 증명 관리자에 refresh 토큰 하나만 둔다 (R31, D14).
//! 대상 이름은 `Daybrick/<프로젝트 ref>`. 토큰 값은 오류·로그에 넣지 않는다.

use keyring::Entry;

use super::management::valid_ref;

/// 자격 증명 관리자 오류 (값은 담지 않음)
const ERR_CREDENTIAL: &str = "credential";

fn entry(project_ref: &str) -> Result<Entry, String> {
    let project_ref = valid_ref(project_ref)?;
    Entry::new_with_target(&format!("Daybrick/{project_ref}"), "Daybrick", project_ref)
        .map_err(|_| ERR_CREDENTIAL.to_string())
}

/// refresh 토큰을 저장한다 (같은 대상이 있으면 덮어씀)
#[tauri::command]
pub fn save_refresh_token(project_ref: String, token: String) -> Result<(), String> {
    entry(&project_ref)?
        .set_password(&token)
        .map_err(|_| ERR_CREDENTIAL.to_string())
}

/// 저장한 refresh 토큰. 없으면 None.
#[tauri::command]
pub fn load_refresh_token(project_ref: String) -> Result<Option<String>, String> {
    match entry(&project_ref)?.get_password() {
        Ok(token) => Ok(Some(token)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(_) => Err(ERR_CREDENTIAL.to_string()),
    }
}

/// 저장한 refresh 토큰을 지운다. 없어도 성공.
#[tauri::command]
pub fn delete_refresh_token(project_ref: String) -> Result<(), String> {
    match entry(&project_ref)?.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(_) => Err(ERR_CREDENTIAL.to_string()),
    }
}
