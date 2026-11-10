# 자동 업데이트 구조

## 1. 파일 목록
| 파일 | 단계 | 내용 |
|---|---|---|
| `src-tauri/Cargo.toml` | 1, 6 | `tauri-plugin-updater = "2"`(1), 버전 0.2.0(6) |
| `src-tauri/tauri.conf.json` | 1 | `bundle.createUpdaterArtifacts: true`, `plugins.updater`(pubkey, endpoints R3, `windows.installMode: "passive"`) |
| `src-tauri/src/lib.rs` | 1, 2 | 플러그인 등록(1), `UpdaterState`·명령 등록(2) |
| 새 `src-tauri/src/updater/mod.rs` | 2 | `UpdaterState`(찾은 업데이트·받은 바이트), 명령 `updater_info`, 오류 모양 `UpdateError` |
| 새 `src-tauri/src/updater/check.rs` | 2 | 명령 `check_update` (R3–R5) |
| 새 `src-tauri/src/updater/install.rs` | 2 | 명령 `download_update`(진행률 Channel, 서명 확인), `install_update`, `discard_update` |
| `src-tauri/src/background/app_settings.rs` | 2 | 필드 `notified_update_version`, 명령 `mark_update_notified` (D5) |
| `features/background/api.ts` | 2 | `AppSettings`에 `notifiedUpdateVersion?` |
| 새 `features/updater/api.ts` | 3 | Rust 명령 감싸기 |
| 새 `features/updater/logic.ts` | 3 | `compareVersions`, `shouldNotify`, `isCheckDue`, `progressPercent` (순수 함수) |
| 새 `features/updater/notices.ts` | 3, 5 | 새 버전(3)·실패(5) 알림 `NotifyInput` 만들기 |
| 새 `features/updater/UpdaterProvider.tsx` | 3, 5 | 상태·자동 확인·수동 확인(3), 설치 흐름·확인 창 상태(5) |
| 새 `features/updater/devUpdater.ts` | 4 | 개발 모드 전용 `window.daybrickUpdater(상태)` |
| `App.tsx` | 3 | `TodayProvider` 안, `BackgroundProvider` 안쪽에 `UpdaterProvider` |
| 새 `pages/settings/UpdateRow.tsx`, `.css` | 4, 5 | 업데이트 줄 (R10–R13, R15, R20, R22–R23) |
| `pages/settings/AppSection.tsx` | 4 | 자동 시작 줄 아래 구분선 + `UpdateRow` |
| `pages/settings/SettingsPage.tsx` | 4 | `usePageIntent("settings", …)`로 `tab` 칸까지 스크롤 (R8) |
| 새 `components/updater/UpdateDialogs.tsx` | 5 | 타이머 확인 창 (ConfirmDialog, R17) |
| `components/layout/TitleBar.tsx` | 5 | `UpdateDialogs` 넣기 (두 모양 모두) |
| `package.json` | 6 | 버전 0.2.0 |
| `docs/common/ai/setup/desktop-release.md` | 1, 6 | 키 만들기·환경변수(1), latest.json 손으로 쓰기·릴리즈 올리기(6) |

## 2. 데이터 모양
`app-settings.json` (기존 두 값 + 하나, 없으면 null로 본다)
```json
{ "autostartInitialized": true, "closeNoticeSeen": true, "notifiedUpdateVersion": "0.2.1" }
```
Rust 명령
- `updater_info` → `{ currentVersion: "0.2.0", available: boolean }` (available은 개발 모드에서 false)
- `check_update` → `{ version, notes: string | null } | null` (개발 모드면 오류)
- `download_update(onEvent: Channel<{ downloaded, total: number | null }>)` → 성공 / `{ kind: "network" | "signature", message }`
- `install_update` → 앱이 꺼진다 (Windows는 설치 프로그램을 띄운 뒤 프로세스 종료). `discard_update` → 받은 바이트 버림

latest.json (R30, 손으로 씀)
```json
{ "version": "0.2.1", "notes": "…", "pub_date": "2026-11-…T…Z",
  "platforms": { "windows-x86_64": { "signature": "<.sig 내용>",
    "url": "https://github.com/HCH96/Daybrick/releases/download/v0.2.1/Daybrick_0.2.1_x64-setup.exe" } } }
```

## 3. 흐름과 컴포넌트 구조
```
App > … > TodayProvider > BackgroundProvider
     ├ UpdaterProvider        (화면 없음)
     └ AppScreens → TitleBar
          ├ BackgroundDialogs  (그대로)
          └ UpdateDialogs → ConfirmDialog (R17)
설정 › 앱(AppSection): 자동 시작 줄 / UpdateRow
```
- 상태(phase): `idle` · `checking` · `upToDate` · `checkFailed` · `available{version, notes}` · `downloading{percent}` · `downloadFailed` · `signatureFailed` · `installing`. 실패 뒤에도 찾은 버전 정보는 남겨 버튼을 다시 누를 수 있다.
- 자동 확인: 마운트 5초 뒤 → 1시간마다 `isCheckDue` → 찾으면 `shouldNotify`일 때 `notify` + `mark_update_notified`. 실패는 조용히 (R9).
- 수동 확인: 결과 문구 표시, 찾으면 알림 없이 `mark_update_notified`만 (R14).
- 설치: [설치하고 다시 시작] → 타이머면 확인 창 → `download_update` → 타이머가 새로 켜졌으면 확인 창 → `runQuitHandlers` → `install_update`.

## 4. C++ 비유
- updater 플러그인은 "서명된 패치 파일을 받아 검증해 주는 라이브러리"다. 우리는 받기(`download`)와 적용(`install`)을 따로 부르는 두 함수로 감싼다.
- 받은 바이트를 `Mutex<Option<Vec<u8>>>`에 두는 것은 전역 버퍼에 잠깐 들고 있는 것과 같다. 설치하거나 취소하면 `reset()`한다.
- 서명 확인은 공개키로 해시 서명을 검증하는 것이다. 비밀키는 빌드하는 PC에만 있고, 공개키는 실행 파일 안에 박혀 있다.
- Windows 설치는 "새 설치 프로그램 프로세스를 띄우고 나는 `exit()`"이라, 설치 전에 atexit 목록(`runQuitHandlers`)을 직접 먼저 돌려야 한다.
