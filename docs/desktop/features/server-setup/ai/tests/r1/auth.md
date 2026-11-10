# 로그인·보안 (req-auth) — r1

## A12. 서버 함수 health·ai-key-check
- 테스트 내용: 로그인 확인(없으면 401), 본인 데이터만, DB 실제 읽기
- 근거 요구사항: R35, R39
- 수행 방법: supabase/functions/health/index.ts, ai-key-check/index.ts, _shared/cors.ts, management.rs `deploy_functions` 읽음
- 예상 결과: 충족
- 실제 결과
  - 배포 시 `verify_jwt: true`. 함수 안에서도 `Authorization` 머리글이 없으면 401, `auth.getUser()`가 사용자를 못 찾으면(anon 키만 든 요청 포함) 401
  - 부른 사용자의 토큰으로 클라이언트를 만들어 RLS가 적용됨. health는 `daybrick_schema_version()` RPC와 `daybrick_server_state`의 본인 행(`user_id = user.id`)을 실제로 읽음
  - ai-key-check는 성공 여부·이유 글자만 돌려주고 키 값·Anthropic 응답 본문은 돌려주지 않음(응답 본문은 cancel)
- 판정: **통과**

## A16. Google 로그인 흐름
- 테스트 내용: PKCE + 127.0.0.1 임시 포트 1회 수신, Gmail 범위 없음, 첫 로그인 뒤 `disable_signup`, 거부 응답 문구
- 근거 요구사항: R28, R29, R51–R53, D12, D13
- 수행 방법: features/server/googleLogin.ts, supabaseClient.ts, session.ts `createSessionClient`, src-tauri/src/server/oauth_listener.rs 전체, setupRunner.ts `registerAccount`, messages.ts `loginFailMessage` 읽음
- 예상 결과: 충족
- 실제 결과
  - 세션 클라이언트는 `flowType: "pkce"`. 리디렉션은 `http://127.0.0.1:<포트>/auth/callback`
  - Rust 수신기는 `127.0.0.1:0`(빈 포트)에 열고, `/auth/callback`에 `code`나 `error`가 담긴 요청 하나를 받으면 끝냄(다른 경로·빈 요청은 무시). 5분 제한, 취소 가능, 받은 값은 돌려주기만 함
  - 요청 범위 `scopes: "email"`, Gmail 범위 없음
  - 계정 등록 단계에서 로그인 성공 뒤 `disable_signup`(PATCH `disable_signup: true`) 호출
  - 콜백의 `error_code=signup_disabled`나 설명에 signup 문구가 있으면 `login-denied` → 제목 "이 서버에 등록된 계정이 아닙니다"
- 판정: **통과**
- 참고: Supabase가 거부를 실제로 `signup_disabled`로 돌려주는지는 실제 서버로 확인하지 않음

## A17. 자격 증명 관리자 저장과 세션 복원
- 테스트 내용: refresh 토큰만 `Daybrick/<ref>`로 저장, 시작 시 세션 복원
- 근거 요구사항: R31, D14
- 수행 방법: src-tauri/src/server/credentials.rs 전체, Cargo.toml keyring 줄, session.ts 전체, supabaseClient.ts `createMemoryStorage`, ServerProvider.tsx 시작 처리 읽음
- 예상 결과: 충족
- 실제 결과
  - keyring 3(`windows-native`) `Entry::new_with_target("Daybrick/<ref>", "Daybrick", <ref>)`. ref는 소문자·숫자만 허용
  - 저장하는 값은 `session.refresh_token` 하나(로그인·토큰 갱신 때마다 바꿔 씀). access 토큰 등 세션은 메모리 저장소에만
  - 앱 시작: server.json 읽기 → 연결이 있으면 저장된 토큰으로 `refreshSession` → 세션 복원. 서버가 토큰을 거절하면 지우고, 인터넷 오류면 남겨 다음 확인 때 다시 시도
- 판정: **통과**
