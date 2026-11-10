# 서버 연결 6단계: Google 로그인과 ④ 완료

- 요구사항: R15(5·6단계), R19, R28, R29, R31, R51–R53
- 목업: wizard-run.html (wiz-run-login), wizard-login.html (wiz-login-start, -wait, -denied), wizard-done.html (wiz-done-summary, -next)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙 (D12–D14)

## 할 일
- 시작 전에 확인(추측 검증): 리디렉션 허용 주소의 포트 와일드카드가 되는지(안 되면 고정 포트 몇 개를 허용 목록에 넣고 빈 포트를 고름), `disable_signup` 뒤 기존 계정은 로그인되고 새 계정은 거부되는지.
- `Cargo.toml`에 `keyring`(windows-native) 추가.
- Rust `server/oauth_listener.rs`: `start_oauth_listener` → 빈 포트 번호 돌려줌, `wait_oauth_callback` → 콜백 한 번 받아 `code`(또는 `error`) 돌려주고 브라우저에 "앱으로 돌아가세요" 페이지 응답. 시간 제한 5분.
- Rust `server/credentials.rs`: `save_refresh_token`, `load_refresh_token`, `delete_refresh_token` (대상 이름 `Daybrick/<ref>`).
- `googleLogin.ts`: PKCE `signInWithOAuth({ provider: "google", options: { redirectTo, skipBrowserRedirect: true, scopes: "email" } })` → `openUrl` → code 교환. 거부 오류면 R53 문구.
- `session.ts`: 로그인·토큰 갱신 때 refresh 토큰 저장, 켤 때 복원(`refreshSession`), 로그아웃 때 삭제.
- 실행 5단계 "계정 등록": 로그인 → PAT로 `disable_signup` 켬 + `daybrick_server_state`에 본인 행·키 등록일 기록 (R29). 6단계 "마무리 확인": `health`·`ai-key-check` 호출.
- 로그인 성공 시 연결 정보를 `server.json`에 저장 (작은 규칙). 마법사가 끝나면 PAT·비밀값을 비운다.
- `LoginStep`(이미 세팅된 서버): [Google로 로그인], 대기 중 [브라우저 다시 열기], 거부 시 빨강 안내. `GoogleButton`은 흰 바탕 + Google 아이콘(설정에서도 씀).
- `DoneStep`: 요약(주소, 계정, 서버 구조 번호)과 다음에 할 일 3줄.

## 확인할 결과
- 자동 세팅 5단계에서 브라우저가 열리고, Google 로그인 후 앱이 6단계를 마치고 ④ 완료(로그인 이메일 표시)로 간다 (R19).
- 앱을 껐다 켜도 로그인이 유지된다. Windows 자격 증명 관리자에 `Daybrick/<ref>` 항목이 하나 있다.
- 다른 PC 상황 흉내: 연결 해제 대신 `server.json`을 지우고 같은 서버로 ② 진행 → 로그인 화면 → 같은 계정은 성공, 다른 Google 계정은 "이 서버에 등록된 계정이 아닙니다".
- Google 로그인 동의 화면에 이메일 확인 권한만 보인다 (R28, R52).
- `npm run build`, `cargo check` 성공.

## 이 단계에서 만들거나 고칠 파일
- `src-tauri/Cargo.toml`, `src-tauri/src/server/oauth_listener.rs`, `server/credentials.rs`, `server/management.rs`, `server/mod.rs`, `lib.rs`
- `features/server/googleLogin.ts`, `session.ts`, `setupRunner.ts`, `supabaseClient.ts`, `ServerProvider.tsx`, `messages.ts`
- `pages/server-setup/wizard/LoginStep.tsx`, `GoogleButton.tsx`, `DoneStep.tsx`(+css), `useWizard.ts`
