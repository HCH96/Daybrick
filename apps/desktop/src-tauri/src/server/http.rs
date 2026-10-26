//! 바깥 API(Supabase 관리 API, Anthropic) 호출에 함께 쓰는 HTTP 도구.
//! 오류는 원인 종류 코드만 돌려준다. 요청 머리글·본문·응답 본문은 오류 문자열에 넣지 않는다 (R18).

use std::time::Duration;

/// 요청 하나를 기다리는 최대 시간
const TIMEOUT: Duration = Duration::from_secs(20);

/// 오류 원인 종류. 프론트엔드 `features/server/management.ts`의 `ApiErrorKind`와 같은 글자를 쓴다.
pub const ERR_UNAUTHORIZED: &str = "unauthorized"; // 401: 키·토큰이 틀렸거나 만료
pub const ERR_FORBIDDEN: &str = "forbidden"; // 403: 권한 없음
pub const ERR_NOT_FOUND: &str = "not-found"; // 404: 없거나 보이지 않음
pub const ERR_RATE_LIMITED: &str = "rate-limited"; // 429
pub const ERR_SERVER: &str = "server"; // 그 밖의 응답 오류
pub const ERR_NETWORK: &str = "network"; // 접속 실패·시간 초과
pub const ERR_BAD_RESPONSE: &str = "bad-response"; // 응답 모양이 예상과 다름

pub fn client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .timeout(TIMEOUT)
        .build()
        .map_err(|_| ERR_NETWORK.to_string())
}

/// 요청 자체가 실패했을 때.
/// 요청을 만들지 못한 경우(키·토큰에 줄바꿈처럼 머리글에 넣을 수 없는 글자가 섞임)는 값이 틀린 것으로 본다.
/// 그 밖에는 접속 실패로 보고, 원인을 찾을 수 있게 종류만 터미널에 남긴다 (주소는 빼고, 머리글·본문은 원래 들어 있지 않다).
pub fn network_error(error: reqwest::Error) -> String {
    if error.is_builder() {
        return ERR_UNAUTHORIZED.to_string();
    }
    eprintln!(
        "[server] 요청 실패: timeout={} connect={} {:?}",
        error.is_timeout(),
        error.is_connect(),
        error.without_url()
    );
    ERR_NETWORK.to_string()
}

/// 성공이 아닌 상태 코드를 원인 종류로 바꾼다
pub fn status_error(status: reqwest::StatusCode) -> String {
    match status.as_u16() {
        401 => ERR_UNAUTHORIZED,
        403 => ERR_FORBIDDEN,
        404 => ERR_NOT_FOUND,
        429 => ERR_RATE_LIMITED,
        _ => ERR_SERVER,
    }
    .to_string()
}

/// 응답 상태만 보고 성공 여부를 정한다 (본문은 읽지 않음)
pub fn check_status(response: reqwest::Response) -> Result<reqwest::Response, String> {
    let status = response.status();
    if status.is_success() {
        Ok(response)
    } else {
        Err(status_error(status))
    }
}
