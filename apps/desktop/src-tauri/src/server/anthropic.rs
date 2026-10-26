//! Anthropic API 키 사전 확인 (R12). 요금이 들지 않는 모델 목록 조회로 키가 동작하는지만 본다.
//! 키는 인자로만 받고 저장하지 않는다 (D11).

use super::http;

const MODELS_URL: &str = "https://api.anthropic.com/v1/models";
const API_VERSION: &str = "2023-06-01";

/// 키로 `GET /v1/models`를 불러 성공하면 Ok. 실패하면 원인 종류 코드 (http.rs).
#[tauri::command]
pub async fn check_anthropic_key(key: String) -> Result<(), String> {
    let response = http::client()?
        .get(MODELS_URL)
        .header("x-api-key", key.trim())
        .header("anthropic-version", API_VERSION)
        .query(&[("limit", "1")])
        .send()
        .await
        .map_err(http::network_error)?;
    http::check_status(response).map(|_| ())
}
