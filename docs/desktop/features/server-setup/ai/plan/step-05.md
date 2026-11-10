# 서버 연결 5단계: 서버 구조 1번과 자동 세팅 실행

- 요구사항: R15–R17, R20–R22, R26, R34, R35
- 목업: wizard-run.html (wiz-run-list, wiz-run-fail)
- 경로 기준: `apps/desktop/src/` (서버 파일은 저장소 `supabase/`)
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙 (D15–D17)

## 할 일
- 시작 전에 확인(추측 검증): 관리 API의 함수 배포(`POST /v1/projects/{ref}/functions/deploy`, 멀티파트 원본 파일), 비밀값(`POST …/secrets`), 인증 설정(`PATCH …/config/auth`: Google 켜기·이메일 끄기·리디렉션 허용 주소 `http://127.0.0.1:*/**`). 다르면 진행 기록에 적고 맞춘다.
- `supabase/migrations/0001_server_setup.sql`: structure.md 2절의 테이블·RLS·RPC. 모든 문은 다시 실행해도 안전하게(`if not exists`, `create or replace`) (R16).
- `supabase/functions/health`, `ai-key-check`, `_shared/cors.ts`: JWT 확인 켜기(R35), 로그인 사용자 데이터만.
- Rust `server/migrations.rs`: 단계 목록·함수 묶음·`latest_schema_version` 명령.
- Rust `management.rs` 추가: `configure_auth`, `apply_migrations(pat, ref, from)`(단계마다 `begin; SQL; insert 번호; commit;` 한 요청, R26), `deploy_functions`, `set_secrets`.
- `setupRunner.ts`: 6단계 정의, 차례 실행, 단계별 대기·진행·완료·실패. 실패하면 멈추고 그 단계부터 다시 (R17). 5·6단계(계정·마무리)는 6단계 계획에서 붙이고, 지금은 "다음 단계에서 연결"로 둔다.
- `SetupRunStep`·`RunStepList`: 한 줄에 표시 원 + 이름·작은 설명 + 오른쪽 상태 글자, 위쪽 진행 막대 "n / 6 단계", 실패 줄 아래 이유와 [다시 시도]. 실행 중에는 [이전]·[취소]를 막는다.

## 확인할 결과
- 빈 테스트 프로젝트에서 [세팅 시작] → 1~4단계가 차례로 완료. Supabase 대시보드에서 두 테이블(RLS 켜짐), 함수 2개, 비밀값 3개, Google 로그인 켜짐·이메일 로그인 꺼짐이 보인다.
- `daybrick_schema_versions`에 1번 행 하나(적용 시각, 앱 버전 0.1.0).
- 같은 프로젝트로 다시 실행 → 오류 없이 끝나고 1번 행은 그대로 하나.
- 4단계 도중 네트워크를 끊음 → 그 단계 빨강 + 이유 + [다시 시도]. 연결 후 다시 시도 → 그 단계부터 이어서 완료.
- `npm run build`, `cargo check` 성공.

## 이 단계에서 만들거나 고칠 파일
- `supabase/migrations/0001_server_setup.sql`, `supabase/functions/_shared/cors.ts`, `functions/health/index.ts`, `functions/ai-key-check/index.ts` (`supabase/.gitkeep` 삭제)
- `src-tauri/src/server/migrations.rs`, `server/management.rs`, `server/mod.rs`, `lib.rs`
- `features/server/setupRunner.ts`, `management.ts`, `messages.ts`
- `pages/server-setup/wizard/SetupRunStep.tsx`(+css), `RunStepList.tsx`, `useWizard.ts`
