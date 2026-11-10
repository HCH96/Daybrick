//! 새 버전 확인 (R3–R5). 주소는 tauri.conf.json의 plugins.updater.endpoints 하나다.

use serde::Serialize;
use tauri::{AppHandle, Runtime, State};
use tauri_plugin_updater::UpdaterExt;

use super::{available, UpdateError, UpdaterState};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FoundUpdate {
    pub version: String,
    pub notes: Option<String>,
}

/// 지금 버전보다 큰 버전이 있으면 그 정보를, 없으면 null을 준다 (R4).
/// 개발 모드면 요청을 보내지 않고 바로 오류 (R5).
#[tauri::command]
pub async fn check_update<R: Runtime>(
    app: AppHandle<R>,
    state: State<'_, UpdaterState>,
) -> Result<Option<FoundUpdate>, UpdateError> {
    if !available() {
        return Err(UpdateError::network("개발 모드에서는 업데이트를 확인하지 않아요"));
    }
    let found = app.updater()?.check().await?;
    let result = found.as_ref().map(|u| FoundUpdate { version: u.version.clone(), notes: u.body.clone() });
    let mut slot = state.update.lock().map_err(|_| UpdateError::network("업데이트 상태를 읽지 못함"))?;
    // 다른 버전을 찾았거나 새 버전이 없으면 예전에 받은 바이트는 쓸모가 없다.
    let same = matches!((&*slot, &found), (Some(a), Some(b)) if a.version == b.version);
    if !same {
        if let Ok(mut bytes) = state.bytes.lock() {
            *bytes = None;
        }
    }
    *slot = found;
    Ok(result)
}
