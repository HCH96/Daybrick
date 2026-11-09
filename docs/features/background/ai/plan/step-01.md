# 백그라운드 실행 1단계: 트레이·중복 실행

- 요구사항: R6, R7, R8 ("열기"), R19
- 목업: 없음 (화면 없음)
- 경로 기준: [index.md](index.md) 맨 위

## 할 일
- `Cargo.toml`: tauri features에 `tray-icon` 추가, `tauri-plugin-single-instance = "2"` 추가.
- 새 `background/window.rs`: `show_main_window(app)` — "main" 창을 `unminimize` → `show` → `set_focus`. 실패는 로그만 남긴다.
- 새 `background/tray.rs`: `TrayIconBuilder`로 아이콘(`default_window_icon`), 툴팁 "Daybrick", 메뉴 "열기"/"종료", `show_menu_on_left_click(false)`.
  - 왼쪽 클릭(버튼을 뗄 때)과 "열기" → `show_main_window`.
  - "종료"는 이 단계에서만 임시로 `app.exit(0)`. 2단계에서 종료 흐름으로 바꾼다.
- 새 `background/mod.rs`: `setup(app)`에서 트레이를 만든다.
- `lib.rs`: single-instance 플러그인을 **가장 먼저** 등록하고, 콜백에서 `show_main_window`를 부른다. `.setup(...)`에서 `background::setup`.

## 확인할 결과
- `cargo check`, `npm run build` 성공.
- `npm run tauri dev`로 켜면 알림 영역에 Daybrick 아이콘이 보이고, 마우스를 올리면 "Daybrick"이 뜬다.
- 창을 최소화하거나 다른 창 뒤로 보낸 뒤 아이콘을 왼쪽 클릭하면 창이 되돌아와 맨 앞에 온다.
- 오른쪽 클릭하면 "열기"·"종료" 메뉴가 나온다. "열기"는 왼쪽 클릭과 같다.
- 앱이 떠 있는 채로 `target/debug/daybrick.exe`를 한 번 더 실행하면 새 창이 뜨지 않고 기존 창이 앞으로 온다.

## 이 단계에서 만들거나 고칠 파일
- `src-tauri/Cargo.toml`
- 새 `src-tauri/src/background/mod.rs`, `window.rs`, `tray.rs`
- `src-tauri/src/lib.rs`
