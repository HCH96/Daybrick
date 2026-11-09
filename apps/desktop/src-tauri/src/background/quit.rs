use std::sync::Mutex;
use std::time::Duration;

use tauri::{AppHandle, Emitter, Manager, Runtime};

/// 프론트에 종료 요청을 알리는 이벤트 (D1)
pub const QUIT_REQUESTED_EVENT: &str = "daybrick://quit-requested";
/// 프론트가 이 시간 안에 응답하지 않으면 바로 끈다 (D2)
const ACK_TIMEOUT: Duration = Duration::from_secs(3);

/// 응답을 기다리는 종료 요청 번호. None이면 기다리는 요청이 없다.
/// 번호를 두는 까닭: 응답 뒤 새 요청이 오면, 앞 요청의 감시가 새 요청을 잘못 끄지 않게 한다.
#[derive(Default)]
pub struct QuitState {
    inner: Mutex<QuitInner>,
}

#[derive(Default)]
struct QuitInner {
    waiting: Option<u64>,
    next_id: u64,
}

/// 트레이 "종료": 프론트에 알리고 3초 안에 응답이 없으면 끈다 (R9, D1, D2).
/// 이미 응답을 기다리는 중이면 다시 알리기만 한다.
pub fn request_quit<R: Runtime>(app: &AppHandle<R>) {
    let state = app.state::<QuitState>();
    let new_id = {
        let mut inner = state.inner.lock().unwrap_or_else(|e| e.into_inner());
        if inner.waiting.is_some() {
            None
        } else {
            inner.next_id += 1;
            let id = inner.next_id;
            inner.waiting = Some(id);
            Some(id)
        }
    };

    if let Err(e) = app.emit(QUIT_REQUESTED_EVENT, ()) {
        eprintln!("[background] 종료 요청 알리기 실패: {e}");
    }

    let Some(id) = new_id else { return };
    let app = app.clone();
    std::thread::spawn(move || {
        std::thread::sleep(ACK_TIMEOUT);
        let state = app.state::<QuitState>();
        let still_waiting = state.inner.lock().unwrap_or_else(|e| e.into_inner()).waiting == Some(id);
        if still_waiting {
            eprintln!("[background] 화면이 종료 요청에 응답하지 않아 바로 종료해요");
            app.exit(0);
        }
    });
}

/// 프론트가 종료 요청을 받았다고 알린다. 이때부터 끄는 것은 프론트가 정한다 (D1).
#[tauri::command]
pub fn ack_quit_request(state: tauri::State<'_, QuitState>) {
    state.inner.lock().unwrap_or_else(|e| e.into_inner()).waiting = None;
}

/// 앱을 완전히 끈다 (R9). 저장은 프론트가 이미 마친 뒤 부른다.
#[tauri::command]
pub fn quit_app<R: Runtime>(app: AppHandle<R>) {
    app.exit(0);
}

/// 메인 창을 숨긴다 (R1, R2). 앱 안의 동작은 그대로 돈다 (R3).
#[tauri::command]
pub fn hide_main_window<R: Runtime>(app: AppHandle<R>) {
    let Some(window) = app.get_webview_window("main") else {
        eprintln!("[background] main 창을 찾지 못했어요");
        return;
    };
    if let Err(e) = window.hide() {
        eprintln!("[background] 창 숨기기 실패: {e}");
    }
}

/// 메인 창을 보여 준다 (R7과 같음). 종료 확인 창을 띄우기 전에 프론트가 부른다.
#[tauri::command]
pub fn show_main_window<R: Runtime>(app: AppHandle<R>) {
    super::window::show_main_window(&app);
}
