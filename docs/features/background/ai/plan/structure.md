# 백그라운드 실행 구조

## 1. 파일 목록
| 파일 | 단계 | 내용 |
|---|---|---|
| `src-tauri/Cargo.toml` | 1, 4 | tauri `tray-icon` 기능, `tauri-plugin-single-instance`(1), `tauri-plugin-autostart`(4) |
| 새 `src-tauri/src/background/mod.rs` | 1 | setup 묶음 (트레이 만들기, 시작 때 창 보이기 결정) |
| 새 `src-tauri/src/background/window.rs` | 1 | `show_main_window`: 최소화 풀기 → 보이기 → 포커스 (R7) |
| 새 `src-tauri/src/background/tray.rs` | 1, 2 | 트레이 아이콘·툴팁 "Daybrick"·왼쪽 클릭·메뉴 "열기"/"종료" |
| 새 `src-tauri/src/background/quit.rs` | 2 | 종료 요청 알림·응답 대기(D2), 명령 `ack_quit_request`·`quit_app`·`hide_main_window`·`show_main_window` |
| 새 `src-tauri/src/background/app_settings.rs` | 3 | `app-settings.json` 읽기·쓰기, 명령 `load_app_settings`·`mark_close_notice_seen` |
| 새 `src-tauri/src/background/autostart.rs` | 4 | 명령 `autostart_status`·`set_autostart`, 첫 실행 등록(D5), 개발 모드 막기(D6) |
| `src-tauri/src/lib.rs` | 1–4 | 플러그인 등록, `on_window_event`(닫기 막기), 명령 등록 |
| `src-tauri/tauri.conf.json` | 4 | 창 `"visible": false` (D7) |
| 새 `features/background/api.ts` | 2 | Rust 명령·이벤트 감싸기 |
| 새 `app/quit.ts` | 2 | 종료 전 저장 등록소 `onQuitRequested(fn)`, `runQuitHandlers()` (D3, D4) |
| 새 `features/background/BackgroundProvider.tsx` | 2, 3 | 닫기·종료 요청 듣기, 열린 안내 창 상태 |
| `features/{applications,calendar,notifications,plan,today}/useAutoSave.ts` | 2 | `onCloseRequested` → `onQuitRequested` (처리기 본문은 그대로) |
| `features/sync/useCloseFlush.ts` | 2 | 주석만 (창 닫기 → 종료) |
| `App.tsx` | 2 | `TodayProvider` 안에 `BackgroundProvider` |
| 새 `components/common/NoticeDialog.tsx` | 3 | 버튼 하나짜리 안내 창 (ConfirmDialog CSS 재사용) |
| 새 `components/background/BackgroundDialogs.tsx` | 3 | 첫 닫기 안내(R4), 타이머 종료 확인(R10) |
| `components/layout/TitleBar.tsx` | 3 | `BackgroundDialogs` 넣기 (두 모양 모두) |
| 새 `pages/settings/AppSection.tsx`, `.css` | 4 | 설정 "앱" 칸 |
| `pages/settings/SettingsPage.tsx` | 4 | 칸 목록에 `{ id: "app", label: "앱" }` |

## 2. 데이터 모양
`app-settings.json` (앱 데이터 폴더, 없으면 둘 다 false로 본다)
```json
{ "autostartInitialized": true, "closeNoticeSeen": false }
```
자동 시작 켜짐 여부는 저장하지 않고 윈도우 등록(HKCU Run)을 그때그때 읽는다.

Rust → 프론트 이벤트: `daybrick://close-requested`, `daybrick://quit-requested` (내용 없음)
`autostart_status` → `{ enabled: boolean, available: boolean }` (available은 개발 모드에서 false)

## 3. 흐름과 컴포넌트 구조
```
App > … > TodayProvider
     ├ BackgroundProvider   (화면 없음)
     └ AppScreens → AppLayout / FullScreen
          └ TitleBar
               ├ WindowControls   (그대로, X → close())
               └ BackgroundDialogs → NoticeDialog(R4) / ConfirmDialog(R10)
설정: 서버 연결 / 데이터 동기화 / 앱(AppSection)
```
- 닫기: X·Alt+F4 → Rust `CloseRequested`를 `prevent_close` → `close-requested` 알림 → 안내를 봤으면 `hide_main_window`, 아니면 안내 창 → [확인] → 본 것으로 적고 숨김.
- 종료: 트레이 "종료" → `quit-requested` 알림 → 프론트가 곧바로 `ack_quit_request` (3초 안에 없으면 Rust가 끔) → 타이머가 있으면 `show_main_window` + 확인 창 → `runQuitHandlers()`(최대 5초) → `quit_app`.
- 시작: 창은 숨긴 채 생성 → `--autostart`가 없으면 `show_main_window`. 두 번째 실행은 single-instance 콜백이 `show_main_window`.

## 4. C++ 비유
- `app/quit.ts`는 atexit 등록 목록이다. 기능마다 "끄기 전에 이것 해 줘"를 등록하고, 종료 직전에 한꺼번에 부른다. 다만 창 닫기(소멸자)가 아니라 명시적인 종료 함수에서만 돈다.
- 창 숨기기는 객체를 지우지 않고 화면에서만 빼는 것이라, 안의 타이머·스레드(투데이 1분 확인, 동기화)가 그대로 돈다.
- single-instance는 이름 있는 뮤텍스로 "이미 떠 있나"를 보고, 떠 있으면 두 번째 프로세스는 첫 번째에 신호만 보내고 끝나는 방식이다.
- 종료 응답 대기(D2)는 watchdog 타이머다. 정해진 시간 안에 응답이 없으면 강제로 진행한다.
