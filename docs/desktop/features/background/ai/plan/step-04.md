# 백그라운드 실행 4단계: 자동 시작

- 요구사항: R13–R18
- 목업: 없음 (req-startup.md "화면 구성" 그림, 모양은 설정 "데이터 동기화" 칸의 `settings-card`·스위치)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D5, D6, D7

## 할 일
- `Cargo.toml`: `tauri-plugin-autostart = "2"`. `lib.rs`에서 `init(MacosLauncher::LaunchAgent, Some(vec!["--autostart"]))`로 등록.
- `tauri.conf.json`: 창에 `"visible": false` (D7).
- `background/mod.rs` setup: `std::env::args()`에 `--autostart`가 없으면 `show_main_window` (R15, R16). 그다음 첫 실행 등록 호출.
- 새 `background/autostart.rs`:
  - 첫 실행 등록: 개발 모드(`cfg!(debug_assertions)`)면 아무것도 안 함 (R18). 아니면 `autostartInitialized`가 false일 때 켜고, 성공했을 때만 true로 저장 (D5).
  - 명령 `autostart_status` → `{ enabled, available }` (available = 개발 모드가 아님).
  - 명령 `set_autostart(enabled)`: 개발 모드면 오류. 아니면 켜기/끄기 후 다시 읽어 값이 다르면 오류.
- `api.ts`: 두 명령 추가.
- 새 `pages/settings/AppSection.tsx`, `.css`: `settings-card` 머리(아이콘, "앱")와 줄 하나 "윈도우 시작 시 자동 실행" + 설명 "켜 두면 로그인할 때 트레이에 숨은 채로 시작해요." + `role="switch"`.
  - 누르면 먼저 화면을 바꾸고 `setAutostart` 호출. 실패하면 원래대로 돌리고 "자동 시작 설정을 바꾸지 못했어요" (R17).
  - `available`이 false면 스위치 비활성 + "개발 모드에서는 바꿀 수 없어요" (D6).
- `SettingsPage.tsx`: 칸 목록 끝에 `{ id: "app", label: "앱", component: AppSection }`.

## 확인할 결과
- `cargo check`, `npm run build` 성공.
- 개발 모드: 설정 › 앱 칸의 스위치가 비활성이고 안내 문구가 보인다. `reg query HKCU\Software\Microsoft\Windows\CurrentVersion\Run`에 개발 빌드 경로가 없다 (R18).
- 개발 모드 창도 지금처럼 바로 뜨고, 번쩍임이나 흰 화면이 길게 남지 않는다.
- `target/debug/daybrick.exe --autostart`로 켜면 창 없이 트레이만 생기고, 아이콘을 누르면 창이 뜬다 (R15). 인자 없이 켜면 창이 뜬다 (R16).
- 스위치 켜기·끄기·실패 처리는 개발 모드에서 막혀 있으므로 5단계 설치본에서 확인한다.

## 이 단계에서 만들거나 고칠 파일
- `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/src/lib.rs`
- `src-tauri/src/background/mod.rs`, 새 `background/autostart.rs`
- `src/features/background/api.ts`
- 새 `src/pages/settings/AppSection.tsx`, `AppSection.css`
- `src/pages/settings/SettingsPage.tsx`
