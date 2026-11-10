//! 자동 업데이트 (auto-update D1): updater 플러그인은 여기서만 쓰고, 프론트는 이 모듈의 명령만 부른다.
//! 찾은 업데이트와 받은 바이트는 메모리에만 둔다 (D2). 앱이 꺼지면 함께 사라진다.

pub mod check;
pub mod install;

use std::sync::Mutex;

use serde::Serialize;
use tauri_plugin_updater::{Error as PluginError, Update};

/// 찾은 업데이트와 서명 확인을 통과한 받은 바이트
#[derive(Default)]
pub struct UpdaterState {
    pub update: Mutex<Option<Update>>,
    pub bytes: Mutex<Option<Vec<u8>>>,
}

/// 프론트에 보내는 오류. kind로 설정 문구를 고른다 (R22, R23).
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateError {
    pub kind: UpdateErrorKind,
    pub message: String,
}

#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum UpdateErrorKind {
    Network,
    Signature,
}

impl UpdateError {
    pub fn network(message: impl Into<String>) -> Self {
        Self { kind: UpdateErrorKind::Network, message: message.into() }
    }
}

impl From<PluginError> for UpdateError {
    /// 서명 관련 오류는 signature, 나머지(연결·응답·설치 실행 등)는 network.
    fn from(e: PluginError) -> Self {
        let kind = match e {
            PluginError::Minisign(_)
            | PluginError::Base64(_)
            | PluginError::SignatureUtf8(_)
            | PluginError::SignedVersionMismatch { .. }
            | PluginError::MissingSignedVersion => UpdateErrorKind::Signature,
            _ => UpdateErrorKind::Network,
        };
        Self { kind, message: e.to_string() }
    }
}

/// 개발 모드에서는 업데이트를 쓰지 않는다 (R5, background D6과 같은 기준).
pub fn available() -> bool {
    !cfg!(debug_assertions)
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdaterInfo {
    pub current_version: String,
    pub available: bool,
}

#[tauri::command]
pub fn updater_info() -> UpdaterInfo {
    UpdaterInfo { current_version: env!("CARGO_PKG_VERSION").to_string(), available: available() }
}
