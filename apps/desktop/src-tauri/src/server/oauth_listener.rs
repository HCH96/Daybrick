//! Google 로그인 결과 수신기 (D13).
//! `127.0.0.1`의 빈 포트에서 `/auth/callback` 요청을 한 번만 받아 `code`(또는 `error`)를 돌려준다.
//! 브라우저에는 "앱으로 돌아가세요" 페이지를 보여준다. 5분 안에 오지 않으면 끝낸다.
//! 받은 값은 돌려주기만 하고 파일·로그에 남기지 않는다.

use std::sync::Mutex;
use std::time::Duration;

use serde::Serialize;
use tauri::State;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::oneshot;

/// 로그인을 기다리는 최대 시간
const WAIT_LIMIT: Duration = Duration::from_secs(300);
/// 브라우저 요청 하나를 읽는 최대 시간
const READ_LIMIT: Duration = Duration::from_secs(10);
const CALLBACK_PATH: &str = "/auth/callback";
/// 요청 머리를 읽을 최대 크기
const MAX_REQUEST: usize = 16 * 1024;

/// 오류 원인 종류. 프론트엔드 `features/server/googleLogin.ts`가 같은 글자를 쓴다.
const ERR_NOT_STARTED: &str = "not-started";
const ERR_TIMEOUT: &str = "timeout";
const ERR_CANCELLED: &str = "cancelled";
const ERR_NETWORK: &str = "network";

/// 시작한 수신기와 기다림을 멈출 신호. 한 번에 하나만 둔다.
#[derive(Default)]
pub struct OAuthListenerState {
    inner: Mutex<Pending>,
}

#[derive(Default)]
struct Pending {
    listener: Option<std::net::TcpListener>,
    cancel: Option<oneshot::Sender<()>>,
}

impl OAuthListenerState {
    /// 앞서 시작한 수신기·기다림을 모두 멈춘다
    fn reset(&self) {
        let mut pending = self.inner.lock().unwrap_or_else(|e| e.into_inner());
        pending.listener = None;
        if let Some(cancel) = pending.cancel.take() {
            let _ = cancel.send(());
        }
    }
}

/// 브라우저가 넘겨준 결과. code가 있으면 성공, error가 있으면 로그인 거부·실패.
#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct OAuthCallback {
    code: Option<String>,
    error: Option<String>,
    error_code: Option<String>,
    error_description: Option<String>,
}

/// 빈 포트에 수신기를 열고 포트 번호를 돌려준다. 앞서 연 수신기는 닫는다.
#[tauri::command]
pub fn start_oauth_listener(state: State<'_, OAuthListenerState>) -> Result<u16, String> {
    state.reset();
    let listener = std::net::TcpListener::bind("127.0.0.1:0").map_err(|_| ERR_NETWORK.to_string())?;
    listener.set_nonblocking(true).map_err(|_| ERR_NETWORK.to_string())?;
    let port = listener.local_addr().map_err(|_| ERR_NETWORK.to_string())?.port();
    state.inner.lock().unwrap_or_else(|e| e.into_inner()).listener = Some(listener);
    Ok(port)
}

/// 기다리고 있는 로그인을 멈춘다 (마법사 [취소] 등)
#[tauri::command]
pub fn cancel_oauth_listener(state: State<'_, OAuthListenerState>) {
    state.reset();
}

/// 콜백 요청을 한 번 받을 때까지 기다린다 (5분 제한)
#[tauri::command]
pub async fn wait_oauth_callback(state: State<'_, OAuthListenerState>) -> Result<OAuthCallback, String> {
    let (listener, mut cancelled) = {
        let mut pending = state.inner.lock().unwrap_or_else(|e| e.into_inner());
        let listener = pending.listener.take().ok_or_else(|| ERR_NOT_STARTED.to_string())?;
        let (sender, receiver) = oneshot::channel();
        pending.cancel = Some(sender);
        (listener, receiver)
    };
    let listener = TcpListener::from_std(listener).map_err(|_| ERR_NETWORK.to_string())?;
    let deadline = tokio::time::sleep(WAIT_LIMIT);
    tokio::pin!(deadline);

    loop {
        tokio::select! {
            _ = &mut deadline => return Err(ERR_TIMEOUT.to_string()),
            _ = &mut cancelled => return Err(ERR_CANCELLED.to_string()),
            accepted = listener.accept() => {
                let Ok((stream, _)) = accepted else { continue };
                if let Some(callback) = handle_request(stream).await {
                    return Ok(callback);
                }
            }
        }
    }
}

/// 요청 하나를 처리한다. 결과가 담긴 콜백이면 Some, 아니면(다른 경로, 빈 요청) None.
async fn handle_request(mut stream: TcpStream) -> Option<OAuthCallback> {
    let target = match tokio::time::timeout(READ_LIMIT, read_target(&mut stream)).await {
        Ok(Some(target)) => target,
        _ => return None,
    };
    let (path, query) = target.split_once('?').unwrap_or((target.as_str(), ""));
    if path != CALLBACK_PATH {
        respond(&mut stream, "404 Not Found", "").await;
        return None;
    }

    let mut callback = OAuthCallback::default();
    for pair in query.split('&').filter(|p| !p.is_empty()) {
        let (key, value) = pair.split_once('=').unwrap_or((pair, ""));
        let value = Some(percent_decode(value));
        match key {
            "code" => callback.code = value,
            "error" => callback.error = value,
            "error_code" => callback.error_code = value,
            "error_description" => callback.error_description = value,
            _ => {}
        }
    }

    if callback.code.is_some() {
        respond(&mut stream, "200 OK", &page("로그인을 마쳤습니다", "이 창을 닫고 Daybrick 앱으로 돌아가세요.")).await;
        Some(callback)
    } else if callback.error.is_some() {
        respond(&mut stream, "200 OK", &page("로그인하지 못했습니다", "이 창을 닫고 Daybrick 앱에서 안내를 확인하세요.")).await;
        Some(callback)
    } else {
        // 결과가 주소 뒤 # 에 붙어 온 경우: 브라우저가 # 뒤를 ? 로 바꿔 다시 보내게 한다
        respond(&mut stream, "200 OK", FORWARD_HASH_PAGE).await;
        None
    }
}

/// 요청 첫 줄 `GET <target> HTTP/1.1`에서 target을 읽는다
async fn read_target(stream: &mut TcpStream) -> Option<String> {
    let mut buffer = Vec::new();
    let mut chunk = [0u8; 2048];
    while !buffer.windows(4).any(|w| w == b"\r\n\r\n") {
        let read = stream.read(&mut chunk).await.ok()?;
        if read == 0 {
            break;
        }
        buffer.extend_from_slice(&chunk[..read]);
        if buffer.len() > MAX_REQUEST {
            return None;
        }
    }
    let text = String::from_utf8_lossy(&buffer);
    let mut parts = text.lines().next()?.split_whitespace();
    if parts.next()? != "GET" {
        return None;
    }
    parts.next().map(str::to_string)
}

async fn respond(stream: &mut TcpStream, status: &str, body: &str) {
    let response = format!(
        "HTTP/1.1 {status}\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n{body}",
        body.len()
    );
    let _ = stream.write_all(response.as_bytes()).await;
    let _ = stream.shutdown().await;
}

/// `%XX`와 `+`를 원래 글자로 바꾼다 (주소 쿼리 값)
fn percent_decode(value: &str) -> String {
    let bytes = value.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'+' => out.push(b' '),
            b'%' if i + 2 < bytes.len() => {
                let hex = std::str::from_utf8(&bytes[i + 1..i + 3]).ok();
                match hex.and_then(|h| u8::from_str_radix(h, 16).ok()) {
                    Some(byte) => {
                        out.push(byte);
                        i += 2;
                    }
                    None => out.push(b'%'),
                }
            }
            byte => out.push(byte),
        }
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

fn page(title: &str, message: &str) -> String {
    format!(
        "<!doctype html><html lang=\"ko\"><head><meta charset=\"utf-8\"><title>Daybrick</title>{PAGE_STYLE}</head>\
         <body><main><h1>{title}</h1><p>{message}</p></main></body></html>"
    )
}

const PAGE_STYLE: &str = "<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#17171a;\
color:#ededf2;font-family:'Segoe UI','Malgun Gothic',sans-serif}main{text-align:center}h1{font-size:22px}\
p{color:#9b9ba8}</style>";

const FORWARD_HASH_PAGE: &str = "<!doctype html><html lang=\"ko\"><head><meta charset=\"utf-8\"><title>Daybrick</title></head>\
<body><script>var h=location.hash.slice(1);if(h){location.replace(location.pathname+'?'+h);}\
else{document.body.textContent='Daybrick 앱으로 돌아가세요.';}</script></body></html>";
