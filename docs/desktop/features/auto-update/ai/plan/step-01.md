# 자동 업데이트 1단계: 서명 키·업데이터 설정

- 요구사항: R25, R27–R30, R34
- 목업: 없음 (화면 변화 없음)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D1

## 할 일
- **사용자가 직접**: `npx tauri signer generate -w ~/.tauri/daybrick.key`로 키를 만들고 비밀번호를 정한다 (비밀번호 입력이 있어 AI가 대신하지 않는다). 비밀키·비밀번호를 PC 밖에 백업한다 (R29). 공개키(`daybrick.key.pub` 내용)를 AI에게 준다.
- `Cargo.toml`: `tauri-plugin-updater = "2"`. `lib.rs`에 `.plugin(tauri_plugin_updater::Builder::new().build())`.
- `tauri.conf.json`:
  - `bundle.createUpdaterArtifacts: true` (setup.exe와 .sig 생성)
  - `plugins.updater`: `pubkey`(공개키, R27), `endpoints: ["https://github.com/HCH96/Daybrick/releases/latest/download/latest.json"]` (R3), `windows.installMode: "passive"`
  - `version`은 지금처럼 비워 둔다 (R25). 식별자 `com.daybrick.desktop`는 그대로 (R34).
- 프론트에서 플러그인을 직접 부르지 않으므로 capabilities는 고치지 않는다 (D1).
- `desktop-release.md`: 키 위치·백업, 빌드 때 환경변수 `TAURI_SIGNING_PRIVATE_KEY`(키 파일 경로 또는 내용)·`TAURI_SIGNING_PRIVATE_KEY_PASSWORD`를 PowerShell에서 넣는 법, 키 없이 빌드하면 실패한다는 주의. "자동 업데이트(updater)는 아직 없다" 문장 고치기.

## 확인할 결과
- `cargo check` 성공.
- 환경변수를 넣고 `npm run tauri build` → `bundle/nsis/`에 `Daybrick_0.1.0_x64-setup.exe`와 `.sig`가 함께 생긴다 (R30).
- `git status`에 키 파일이 없다. 저장소 안에서 `*.key` 검색 결과가 없다 (R28).
- 개발 모드(`npm run tauri dev`)가 전과 같이 뜬다.

## 이 단계에서 만들거나 고칠 파일
- `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/src/lib.rs`
- `docs/desktop/common/ai/setup/desktop-release.md`
