//! 받기·설치·버리기 (D2). 받은 바이트는 서명 확인을 통과했을 때만 메모리에 둔다 (R23).

use serde::Serialize;
use tauri::{ipc::Channel, State};

use super::{UpdateError, UpdaterState};

/// 받기 진행률. downloaded는 지금까지 받은 바이트 합, total은 모르면 null (R20).
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Progress {
    pub downloaded: u64,
    pub total: Option<u64>,
}

fn lock_error() -> UpdateError {
    UpdateError::network("업데이트 상태를 읽지 못함")
}

#[tauri::command]
pub async fn download_update(
    state: State<'_, UpdaterState>,
    on_event: Channel<Progress>,
) -> Result<(), UpdateError> {
    let update = state
        .update
        .lock()
        .map_err(|_| lock_error())?
        .clone()
        .ok_or_else(|| UpdateError::network("찾은 업데이트가 없어요"))?;
    // 다시 받을 때는 예전 바이트부터 버린다.
    *state.bytes.lock().map_err(|_| lock_error())? = None;

    let mut downloaded: u64 = 0;
    let result = update
        .download(
            |chunk, total| {
                downloaded += chunk as u64;
                let _ = on_event.send(Progress { downloaded, total });
            },
            || {},
        )
        .await;

    // 플러그인의 download는 다 받은 뒤 서명을 확인하고, 실패하면 바이트를 돌려주지 않는다.
    let bytes = result?;
    *state.bytes.lock().map_err(|_| lock_error())? = Some(bytes);
    Ok(())
}

/// 받은 바이트로 설치한다. Windows는 설치 프로그램을 띄운 뒤 이 프로세스가 끝난다 (R21).
#[tauri::command]
pub fn install_update(state: State<'_, UpdaterState>) -> Result<(), UpdateError> {
    let update = state
        .update
        .lock()
        .map_err(|_| lock_error())?
        .clone()
        .ok_or_else(|| UpdateError::network("찾은 업데이트가 없어요"))?;
    // 설치에 실패하면 바이트는 버린다 (다시 받게 한다).
    let bytes = state
        .bytes
        .lock()
        .map_err(|_| lock_error())?
        .take()
        .ok_or_else(|| UpdateError::network("받은 업데이트가 없어요"))?;
    update.install(bytes)?;
    Ok(())
}

/// 받은 바이트만 버린다. 찾은 업데이트 정보는 그대로 둔다 (R19, D2).
#[tauri::command]
pub fn discard_update(state: State<'_, UpdaterState>) {
    if let Ok(mut bytes) = state.bytes.lock() {
        *bytes = None;
    }
}
