# 서버 연결 4단계: ③ 자동 세팅 입력과 사전 확인

- 요구사항: R11–R14, R18, R54
- 목업: wizard-setup.html (wiz-setup-form, -redirect, -guide, -check)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙 (D11)

## 할 일
- 시작 전에 확인(추측 검증): 관리 API `GET /v1/projects/{ref}`로 PAT 권한 확인이 되는지, `POST /v1/projects/{ref}/database/query`로 테이블 목록을 읽을 수 있는지. 결과를 진행 기록에 적는다.
- `Cargo.toml`에 `reqwest`(rustls-tls, json, multipart) 추가.
- Rust `server/anthropic.rs`: `check_anthropic_key(key)` → `GET https://api.anthropic.com/v1/models` 성공 여부 (R12).
- Rust `server/management.rs`(시작): `check_pat_access(pat, ref)`(R13), `inspect_project(pat, ref)` → 구조 번호 테이블 유무 + public 스키마의 다른 테이블 수 (R14).
- 오류는 원인 종류만 돌려준다(권한 없음·만료·네트워크 등). 요청 머리글·본문을 오류 문자열에 넣지 않는다 (R18).
- `management.ts`: 위 명령 감싸기.
- `SetupInputStep`: Supabase·Anthropic 묶음(PAT, Anthropic 키)과 Google 묶음(클라이언트 ID, 비밀값). 비밀값 칸은 `SecretInput`. 칸마다 "어디서 찾나요?".
- `RedirectUrlRow`: `https://<ref>.supabase.co/auth/v1/callback` 읽기 전용 + [복사] (R54). Google 칸 위에 둔다.
- [세팅 시작]을 누르면 사전 확인(키 → PAT → 빈 프로젝트) 후 5단계 실행 화면으로. 다른 테이블이 있으면 "빈 프로젝트가 아닙니다" 확인 팝업(기존 `ConfirmDialog`), [취소]가 기본.
- 비밀값은 `useWizard` 메모리에만 두고 마법사가 끝나거나 취소되면 비운다 (R18).

## 확인할 결과
- 틀린 Anthropic 키 → 키 칸 아래 빨강 오류, 진행 안 됨. 틀린 PAT 또는 다른 프로젝트 권한만 있는 PAT → PAT 오류.
- 테이블을 하나 만들어 둔 프로젝트 → 경고 팝업, [취소]면 입력 화면에 남음.
- [복사] 후 붙여 넣으면 리디렉션 주소가 그대로 나온다.
- 개발자 도구 콘솔과 `server.json`에 PAT·키 값이 없다.
- `npm run build`, `cargo check` 성공.

## 이 단계에서 만들거나 고칠 파일
- `src-tauri/Cargo.toml`, `src-tauri/src/server/anthropic.rs`, `server/management.rs`, `server/mod.rs`, `lib.rs`
- `features/server/management.ts`, `messages.ts`
- `pages/server-setup/wizard/SetupInputStep.tsx`(+css), `RedirectUrlRow.tsx`, `useWizard.ts`, `guides.ts`
