# 자동 업데이트 2단계: Rust 업데이트 명령

- 요구사항: R3–R5, R7, R14, R21, R23, R33, R36
- 목업: 없음 (화면 변화 없음)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D1, D2, D5

## 할 일
- 새 `updater/mod.rs`:
  - `UpdaterState { update: Mutex<Option<Update>>, bytes: Mutex<Option<Vec<u8>>> }`
  - 명령 `updater_info` → `{ currentVersion: env!("CARGO_PKG_VERSION"), available: !cfg!(debug_assertions) }` (R5)
  - `UpdateError { kind: "network" | "signature", message }` (serde camelCase). 플러그인 오류 중 서명 관련(`Minisign`·`Base64`·`SignatureUtf8` 등, 실제 이름은 플러그인 소스로 확인)은 signature, 나머지는 network.
- 새 `updater/check.rs`: 명령 `check_update`
  - 개발 모드면 바로 오류 (요청을 보내지 않음, R5).
  - `app.updater()?.check()`: 플러그인이 지금 버전보다 클 때만 Some을 준다 (R4). Some이면 state에 넣고 `{ version, notes }`, None이면 state를 비우고 null.
- 새 `updater/install.rs`:
  - `download_update(on_event: Channel<Progress>)`: state의 업데이트로 `download(chunk, finish)` → 진행률을 Channel로 보낸다. 서명 확인을 통과한 바이트만 state에 둔다. 서명 실패면 바이트를 버리고 signature 오류 (R23, D2).
  - `install_update`: 받은 바이트로 `install` (Windows는 설치 프로그램 실행 후 프로세스 종료). 바이트가 없으면 오류.
  - `discard_update`: 받은 바이트만 버린다 (찾은 업데이트 정보는 둔다).
- `background/app_settings.rs`:
  - `notified_update_version: Option<String>` 필드 (`#[serde(default)]`라 옛 파일도 그대로 읽힘, R33).
  - 명령 `mark_update_notified(version)`: 파일이 있는데 읽기·해석에 실패하면 쓰지 않고 오류 (D5, R36). 다른 값은 그대로 둔다.
- `lib.rs`: `.manage(updater::UpdaterState::default())`, 명령 5개 + `mark_update_notified` 등록.
- `features/background/api.ts`: `AppSettings`에 `notifiedUpdateVersion?: string | null`.

## 확인할 결과
- `cargo check`, `npx tsc --noEmit` 성공.
- 개발 모드 콘솔에서 `invoke("updater_info")` → `available: false`, `currentVersion: "0.1.0"`. `invoke("check_update")`는 바로 오류이고, 네트워크 요청이 나가지 않는다.
- `invoke("mark_update_notified", { version: "0.2.1" })` 뒤 `app-settings.json`에 기존 두 값과 `notifiedUpdateVersion`이 함께 있다. 파일을 일부러 깨 두면 명령이 오류를 내고 파일 내용은 바뀌지 않는다 (확인 후 원래대로).

## 이 단계에서 만들거나 고칠 파일
- 새 `src-tauri/src/updater/mod.rs`, `check.rs`, `install.rs`
- `src-tauri/src/background/app_settings.rs`, `src-tauri/src/lib.rs`
- `src/features/background/api.ts`
