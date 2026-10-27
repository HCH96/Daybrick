# 구직 관리 13단계: Gmail 연결·해제

- 요구사항: R60–R63, R70(끊김 감지)
- 목업: settings.html (settings-gmail)
- 경로 기준: `apps/desktop/src/` (Rust는 `apps/desktop/src-tauri/src/`, 서버는 저장소 `supabase/`)
- 공통 규칙: [index.md](index.md)의 결정 D18, server-setup D13(127.0.0.1 콜백)

## 할 일
- 시작 전에 확인(추측 검증):
  - server-setup의 Google OAuth 클라이언트에 `http://127.0.0.1` 리디렉션을 쓸 수 있는지 (데스크톱/웹 클라이언트 종류).
  - `access_type=offline`, `prompt=consent`로 갱신 토큰이 오는지.
  - 이 클라이언트에서 토큰을 취소하면 앱 로그인(Supabase 세션)에 영향이 있는지.
  - 다르면 진행 기록에 적고 사용자와 맞춘다.
- `gmailConnect.ts`: `oauth_listener.rs`로 임시 포트 수신기 시작 → Google 인증 주소(scope `gmail.readonly`, `include_granted_scopes=true`, `login_hint=로그인 이메일`, PKCE) 브라우저로 열기 → `code` 받기 → `js-gmail connect`에 `code`·`verifier`·리디렉션 주소 전달.
- `js-gmail connect`: 클라이언트 비밀값으로 토큰 교환 → 응답 이메일이 로그인 이메일과 같은지 확인 → 갱신 토큰을 `GMAIL_TOKEN_KEY`로 AES-GCM 암호화해 `js_gmail_tokens`에 저장 (R62). 앱에는 토큰을 돌려주지 않는다.
- `js-gmail disconnect` (R63): Google `oauth2.googleapis.com/revoke` 호출 → 토큰 행 삭제.
- `GmailPanel`: 연결 상태(`js_gmail_status`), 이메일, 마지막 확인 시각, [Gmail 연결]/[연결 해제]. "확인되지 않은 앱" 경고가 뜰 때 계속하는 방법 안내 (R61).
- 끊김 (R70): 갱신 토큰이 거절되면 `broken_at` 기록, 패널에 "다시 연결이 필요해요". 알림은 15단계.

## 확인할 결과
- [Gmail 연결] → 브라우저에 Google 동의 화면(읽기 권한) → 승인 → 앱 설정에 "연결됨 · <이메일>".
- Supabase `js_gmail_tokens`에 암호문만 있고, 앱 데이터 폴더 어디에도 토큰이 없다.
- 다른 Google 계정으로 승인하면 저장하지 않고 "로그인한 계정과 달라요" 안내.
- [연결 해제] → 행이 지워지고, Google 계정 "타사 연결"에서 Gmail 권한이 사라진다. 앱 로그인은 유지된다 (확인 못 하면 기록).
- `npm run build`, `cargo check` 성공.

## 이 단계에서 만들거나 고칠 파일
- `supabase/functions/js-gmail/index.ts`, `src-tauri/src/server/migrations.rs`
- `features/job-search/gmailConnect.ts`, `api.ts`, `messages.ts`
- `pages/job-search/settings/GmailPanel.tsx`(+css), 수정 `JobSettingsTab.tsx`
