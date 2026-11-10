# 자동 업데이트 요구사항: 릴리즈·서명·버전 (R25–R32)

### 버전
- R25. 버전은 `src-tauri/Cargo.toml`의 `version` 한 곳에서만 정한다. `tauri.conf.json`의 `version`은 비워 두고, `package.json`은 같은 값으로 맞춰만 둔다.
- R26. 버전은 `x.y.z` 형식이고, 릴리즈할 때마다 이전 릴리즈보다 큰 번호를 쓴다.

### 서명 키
- R27. 업데이트 파일은 Tauri 서명 키로 서명한다. 공개키만 `tauri.conf.json`(updater 설정)에 넣는다.
- R28. 비밀키(와 비밀번호)는 저장소 밖(예: `~/.tauri/daybrick.key`)에 두고 커밋하지 않는다. 빌드할 때 환경변수로만 넘긴다. `.gitignore`에는 이미 `*.key` 규칙이 있다.
- R29. 비밀키와 비밀번호는 PC 밖에 따로 백업한다(예: 비밀번호 관리자, USB). 잃어버리면 이미 깔린 설치본에 업데이트를 보낼 수 없다. 그때는 새 키로 만든 버전을 직접 설치해야 한다.

### 릴리즈 파일
- R30. 릴리즈 하나에 올라가야 하는 파일은 세 개다.

| 파일 | 내용 |
|---|---|
| `Daybrick_<버전>_x64-setup.exe` | NSIS 설치파일 |
| `Daybrick_<버전>_x64-setup.exe.sig` | 위 파일의 서명 |
| `latest.json` | `version`, `notes`, `pub_date`, `platforms.windows-x86_64.{signature, url}` (url은 같은 릴리즈의 setup.exe 주소, signature는 .sig 내용) |

- R31. 릴리즈는 GitHub에서 "Latest"로 올린다. 초안·사전 릴리즈는 `latest` 주소에 잡히지 않는다.
- 이 파일들을 만들어 올리는 `npm run release` 스크립트는 다음 단계에서 따로 만든다 (scope.md).

### 첫 설치
- R32. 지금 설치된 0.1.0에는 업데이트 기능이 없다. 이 기능이 들어간 첫 버전은 desktop-release.md 절차대로 직접 설치하고, 그다음 버전부터 자동 업데이트를 받는다.
