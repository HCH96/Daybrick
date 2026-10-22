# PC 앱 개발 환경 세팅 기록

- 날짜: 2026-10-21
- 대상: apps/desktop (Tauri 2 + React + TypeScript)
- 상태: 완료 (개발 모드 실행 확인)

## 1. 설치한 도구

| 도구 | 버전 | 설치 방법 | 비고 |
|---|---|---|---|
| Node.js (LTS) | 24.20.0 | `winget install OpenJS.NodeJS.LTS` | npm 11.19.0 포함 |
| rustup | 1.29.1 | `winget install Rustlang.Rustup` | 기본 툴체인 stable-x86_64-pc-windows-msvc |
| rustc / cargo | 1.99.1 | rustup이 함께 설치 | |

설치 전에 이미 있던 도구:
- Visual Studio Community 2022 (C++ 빌드 도구): Rust가 Windows용으로 컴파일할 때 사용
- WebView2 런타임 155.0.4283.62: 앱 화면을 띄우는 브라우저 엔진

참고: 설치 직후에는 기존 터미널의 PATH에 새 도구가 반영되지 않으므로, 앱(또는 터미널)을 다시 시작해야 `node`, `cargo`가 인식된다.

## 2. 프로젝트 생성

`create-tauri-app` 4.8.0으로 임시 폴더에 `daybrick`이라는 이름으로 생성한 뒤 apps/desktop으로 옮겼다.
(apps/desktop에서 바로 만들면 패키지 이름이 `desktop`이 되기 때문)

```
npx create-tauri-app@latest daybrick --template react-ts --manager npm --identifier com.daybrick.desktop --tauri-version 2 -y
```

생성 후 바꾼 것:
- `src-tauri/tauri.conf.json`: `productName`과 창 `title`을 `daybrick` → `Daybrick`으로 변경
- apps/desktop/.gitkeep 삭제 (폴더에 파일이 생겨 불필요)

## 3. 주요 설정

- 패키지 이름: `daybrick` (package.json, Cargo.toml)
- 앱 식별자: `com.daybrick.desktop`
- TypeScript strict 모드: 템플릿 기본값으로 켜져 있음 (tsconfig.json)
- 주요 패키지: tauri 2.12.4, React ^19.1.0, Vite 8.3.5, TypeScript ~6.0.3
- 개발 서버 주소: http://localhost:1420

## 4. 폴더 구조

```
apps/desktop/
├─ src/          React 화면 코드 (App.tsx, main.tsx)
├─ public/       정적 파일
├─ src-tauri/    Rust 코드와 Tauri 설정
│  ├─ src/       main.rs, lib.rs
│  ├─ capabilities/  화면 코드가 쓸 수 있는 권한 목록
│  ├─ icons/
│  └─ tauri.conf.json
├─ package.json
└─ vite.config.ts
```

## 5. 확인 결과

- `npm install`: 성공 (취약점 0개)
- `npm run build` (타입 검사 + 화면 빌드): 성공
- `cargo build` (src-tauri): 성공, 첫 빌드 약 1분
- `npm run tauri dev`: "Daybrick" 창이 뜨는 것 확인, 로그에 오류 없음. 확인 후 종료함.

## 6. 남은 일

- 테스트 도구 미도입 (CLAUDE.md 명령어 칸에 "도입 후 작성"으로 표시)
- 앱 아이콘은 Tauri 기본 아이콘 그대로
- 화면은 템플릿 기본 화면 그대로 (실제 기능 개발 전)
