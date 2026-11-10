# PC 앱 설치파일 빌드·설치·업데이트

내 PC에 설치본을 만들어 쓰고, 새 버전으로 바꾸는 절차. 0.2.0부터 자동 업데이트가 들어 있다 (auto-update). 릴리즈 파일은 아직 손으로 만들어 올린다 (`npm run release`는 다음에 만든다). 다른 사람 배포 준비는 아직 없다.

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
### 손으로 덮어 설치 (0.1.0 → 0.2.0처럼 업데이트 기능이 없는 설치본일 때)
0.1.0에는 업데이트 기능이 없어서 0.2.0은 직접 설치해야 한다. 그다음 버전부터는 아래 "자동 업데이트로 받기"를 쓴다.
1. `src-tauri/Cargo.toml`의 `version`을 올린다. `package.json`(+ `package-lock.json` 맨 위 두 곳, `Cargo.lock`의 `name = "daybrick"` 아래 줄)도 같이. 저장소는 이미 0.2.0으로 올라가 있다.
2. 서명 키 환경변수를 넣고 `npm run tauri build`
3. **트레이 아이콘 → 종료.** 창 X 버튼은 트레이로 숨기기만 하므로 앱이 계속 켜져 있다.
4. 새 `-setup.exe` 실행. 같은 폴더에 덮어쓰고, 바로가기·자동 시작·데이터는 그대로다.
5. 설정 "앱" 칸에서 "현재 버전 0.2.0"을 본다.

버전을 안 올려도 덮어 설치는 되지만, 어느 빌드인지 구분할 수 없으니 올리는 것을 원칙으로 한다.

### 릴리즈 파일 만들기 (예: 0.2.1)
1. 버전을 이전 릴리즈보다 크게 올린다 (위 1번과 같은 네 파일). 예: 0.2.0 → 0.2.1.
2. 서명 키 환경변수를 넣고 `npm run tauri build`.
3. `bundle/nsis/`의 `Daybrick_0.2.1_x64-setup.exe`와 `Daybrick_0.2.1_x64-setup.exe.sig`를 저장소 밖 폴더(예: `C:\Users\sjrnf\daybrick-release\0.2.1\`)에 복사해 둔다. 다음 빌드가 덮어쓰지 않게 하기 위해서다.
4. 같은 폴더에 `latest.json`을 쓴다 (UTF-8). `signature`는 `.sig` 파일 내용 한 줄 전체(파일을 메모장으로 열어 그대로 복사), `url`은 아래 릴리즈 주소 그대로:
```json
{
  "version": "0.2.1",
  "notes": "업데이트 확인용 테스트 버전",
  "pub_date": "2026-11-10T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "<.sig 파일 내용>",
      "url": "https://github.com/HCH96/Daybrick/releases/download/v0.2.1/Daybrick_0.2.1_x64-setup.exe"
    }
  }
}
```
- `version`은 앞에 `v` 없이. `pub_date`는 UTC(`Z`) 시각. `notes`는 설정 화면의 "변경 내용"에 그대로 보인다.
- url의 태그(`v0.2.1`)와 파일 이름이 실제 릴리즈와 한 글자라도 다르면 받기가 실패한다.

### 릴리즈 올리기 (공개 작업)
저장소가 공개라 릴리즈를 올리면 누구나 파일을 받을 수 있다. 태그 `v<버전>`, **"Latest"로** 올린다 (초안·사전 릴리즈는 `releases/latest` 주소에 잡히지 않는다). 파일은 세 개: setup.exe, .exe.sig, latest.json.
- gh로 (저장소 폴더에서, PowerShell):
```powershell
$d = "C:\Users\sjrnf\daybrick-release\0.2.1"
gh release create v0.2.1 --title "Daybrick 0.2.1" --notes "업데이트 확인용 테스트 버전" --latest `
  "$d\Daybrick_0.2.1_x64-setup.exe" "$d\Daybrick_0.2.1_x64-setup.exe.sig" "$d\latest.json"
```
- 웹으로: GitHub 저장소 → Releases → Draft a new release → 태그 `v0.2.1` 새로 만들기 → 파일 세 개 끌어 놓기 → "Set as the latest release" 체크 → Publish.
- 올린 뒤 브라우저로 `https://github.com/HCH96/Daybrick/releases/latest/download/latest.json`을 열어 방금 쓴 내용이 나오는지 본다.
- 태그는 지금 커밋에 붙는다. 버전 올린 커밋을 먼저 커밋해 두는 것이 좋다.

### 자동 업데이트로 받기 (0.2.0 이후 설치본)
1. 설치본을 켜면 5초쯤 뒤 확인하고, 새 버전이 있으면 알림 "새 버전 0.2.1이 나왔어요"가 온다. 그 뒤로는 1시간마다 "마지막 확인 뒤 24시간이 지났나"만 본다. 바로 보고 싶으면 설정 "앱" 칸의 [업데이트 확인].
2. 알림을 누르면 설정 "앱" 칸으로 간다. 새 버전·변경 내용·[설치하고 다시 시작]이 보인다.
3. [설치하고 다시 시작]. 타이머가 돌고 있으면 확인 창에서 [기록 저장하고 설치]. 받는 중 %가 보이고, 다 받으면 앱이 꺼지고 설치 진행 창이 뜬 뒤 앱이 다시 뜬다.
4. 설정에서 "현재 버전 0.2.1", [업데이트 확인] → "최신 버전이에요".
- 개발 모드(`npm run tauri dev`)에서는 확인 요청이 나가지 않는다. 화면 흉내는 콘솔 `daybrickUpdater(...)` (auto-update D7).
- 받기 실패(인터넷 끊김·주소 틀림)는 설정에 실패 문구, 서명이 안 맞으면 주의 알림이 뜨고 설치하지 않는다. 자동 확인 실패는 아무 표시도 하지 않는다.

### 첫 실제 확인 (auto-update 6단계, 사용자가 할 일)
1. 서명 빌드로 0.2.0 설치파일을 만들고, 트레이 종료 후 직접 설치 → "현재 버전 0.2.0" 확인.
2. 버전을 0.2.1로 올려 서명 빌드 → 파일 보관 → latest.json 작성 → `v0.2.1` Latest 릴리즈 올리기.
3. 0.2.0 설치본에서 알림 → 설정 → 설치 → 재시작까지 받고, 투데이·일정·지원·플랜 데이터가 그대로인지 본다.
4. 설치 프로그램이 앱을 다시 띄우지 않으면 기록에 남긴다 (방법을 다시 정해야 한다).
5. 확인이 끝나면 저장소 버전은 0.2.1로 두고 커밋한다 (다음 릴리즈는 그보다 크게).

## 주의
- **설치본이 켜져 있으면 개발 모드가 바로 꺼진다.** 같은 식별자라 중복 실행 방지가 막는다 (2026-11-10 실행해서 확인). `npm run tauri dev` 전에 트레이에서 설치본을 종료할 것.
- 개발 모드와 설치본은 같은 데이터 폴더를 쓴다. 개발 중에 바꾼 데이터가 설치본에도 보인다.
- 설치파일에는 내 데이터·서버 설정이 들어가지 않는다. 빌드에 넣는 환경변수(`.env`)가 생기면 그 값은 설치파일 안에 들어가므로 공유 전에 확인한다.
- 제거: Windows 설정 → 앱 → Daybrick 제거 (또는 `%LOCALAPPDATA%\Daybrick\uninstall.exe`). 데이터 폴더는 남는다.
