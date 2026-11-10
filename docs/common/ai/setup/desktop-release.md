# PC 앱 설치파일 빌드·설치·업데이트

내 PC에 설치본을 만들어 쓰고, 새 버전으로 바꾸는 절차. 자동 업데이트(updater) 설정과 서명은 들어갔다 (auto-update 1단계). 앱 안 확인·설치는 auto-update 2~5단계, 릴리즈 올리기는 6단계에서 정리한다. 다른 사람 배포 준비는 아직 없다.

## 설정 (src-tauri/tauri.conf.json)
- `bundle.targets: ["nsis"]`: `-setup.exe` 하나만 만든다. MSI는 만들지 않는다 (섞어 설치하면 앱이 두 번 깔린다).
- `bundle.windows.nsis.installMode: "currentUser"`: `%LOCALAPPDATA%\Daybrick`에 설치. 관리자 권한 필요 없음.
- `bundle.windows.nsis.languages: ["Korean"]`: 설치 화면 한국어.
- `bundle.createUpdaterArtifacts: true`: setup.exe와 함께 서명 파일 `.sig`를 만든다. **그래서 서명 키 환경변수 없이 `npm run tauri build`를 하면 실패할 수 있다** (아래 "서명 키").
- `plugins.updater`: `pubkey`(공개키), `endpoints`(`https://github.com/HCH96/Daybrick/releases/latest/download/latest.json`), `windows.installMode: "passive"`(진행 창만 보이는 설치).
- `version`은 일부러 비워 둔다. 비우면 Tauri가 `src-tauri/Cargo.toml`의 버전을 쓴다. 설정 화면의 버전 표시도 같은 값(`CARGO_PKG_VERSION`)이라 한 곳만 고치면 된다. `package.json` 버전은 쓰이지 않지만 맞춰 둔다.

## 서명 키 (자동 업데이트용)
- 비밀키 `C:\Users\sjrnf\.tauri\daybrick.key` (저장소 밖), 공개키 같은 폴더 `daybrick.key.pub`. 공개키 내용은 `plugins.updater.pubkey`에 그대로 넣었다.
- 비밀키·비밀번호는 커밋하지 않는다 (`.gitignore`의 `*.key`). PC 밖(USB·비밀번호 관리자)에 백업한다. 잃어버리면 이미 깔린 설치본에 업데이트를 보낼 수 없고, 새 키로 만든 버전을 직접 설치해야 한다.
- 빌드할 때만 환경변수로 넘긴다 (PowerShell, `apps/desktop`에서. 그 창에서만 유지된다):
```powershell
$env:TAURI_SIGNING_PRIVATE_KEY = "C:\Users\sjrnf\.tauri\daybrick.key"  # 파일 경로 또는 키 내용
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "<비밀번호>"                 # 비밀번호가 없으면 ""
npm run tauri build
```
- 결과: `bundle/nsis/`에 `Daybrick_<버전>_x64-setup.exe`와 `.exe.sig`가 함께 생긴다.

## 위치
| 무엇 | 어디 |
|---|---|
| 빌드 결과 설치파일 | `apps/desktop/src-tauri/target/release/bundle/nsis/Daybrick_<버전>_x64-setup.exe` |
| 설치된 프로그램 | `%LOCALAPPDATA%\Daybrick\daybrick.exe` (+ `uninstall.exe`) |
| 내 데이터 | `%APPDATA%\com.daybrick.desktop\` (설치·업데이트·제거와 상관없이 남는다) |
| 자동 시작 등록 | `HKCU\...\CurrentVersion\Run\Daybrick` = `"...\Daybrick\daybrick.exe" --autostart` |

데이터 폴더는 식별자 `com.daybrick.desktop`로 정해진다. 식별자를 바꾸면 새 앱으로 취급되어 처음 설정부터 다시 하게 된다.

## 처음 설치
1. `apps/desktop`에서 서명 키 환경변수를 넣고 `npm run tauri build` (약 2분)
2. 위 `-setup.exe` 실행 (조용히 설치: `setup.exe /S`)
3. 설치본 첫 실행 때 자동 시작이 켜지고, `app-settings.json`에 `autostartInitialized: true`가 적힌다. 개발 모드에서는 자동 시작을 건드리지 않는다.

## 새 버전으로 업데이트
1. `src-tauri/Cargo.toml`의 `version`을 올린다 (예: 0.1.0 → 0.2.0). `package.json`도 같이.
2. 서명 키 환경변수를 넣고 `npm run tauri build`
3. **트레이 아이콘 → 종료.** 창 X 버튼은 트레이로 숨기기만 하므로 앱이 계속 켜져 있다.
4. 새 `-setup.exe` 실행. 같은 폴더에 덮어쓰고, 바로가기·자동 시작·데이터는 그대로다.
5. 설정 화면에서 버전이 바뀌었는지 본다.

버전을 안 올려도 덮어 설치는 되지만, 어느 빌드인지 구분할 수 없으니 올리는 것을 원칙으로 한다.

## 주의
- **설치본이 켜져 있으면 개발 모드가 바로 꺼진다.** 같은 식별자라 중복 실행 방지가 막는다 (2026-11-10 실행해서 확인). `npm run tauri dev` 전에 트레이에서 설치본을 종료할 것.
- 개발 모드와 설치본은 같은 데이터 폴더를 쓴다. 개발 중에 바꾼 데이터가 설치본에도 보인다.
- 설치파일에는 내 데이터·서버 설정이 들어가지 않는다. 빌드에 넣는 환경변수(`.env`)가 생기면 그 값은 설치파일 안에 들어가므로 공유 전에 확인한다.
- 제거: Windows 설정 → 앱 → Daybrick 제거 (또는 `%LOCALAPPDATA%\Daybrick\uninstall.exe`). 데이터 폴더는 남는다.
