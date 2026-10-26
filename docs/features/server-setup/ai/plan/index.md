# 서버 연결 (server-setup) 구현 계획 색인
- 기능 명세서: [../spec/index.md](../spec/index.md) · 목업: [../../human/mockups/index.html](../../human/mockups/index.html)
- 작성일: 2026-10-26 · 상태: 승인됨 (2026-10-26), 구현 대기
- 경로 기준: `apps/desktop/src/` (Rust는 `apps/desktop/src-tauri/src/`, 서버는 저장소 `supabase/`) · 파일 목록·데이터 모양: [structure.md](structure.md)
- 커밋 이름: "서버 연결 N단계: …"
- 3단계부터는 사용자의 테스트용 Supabase 프로젝트(빈 것)·Anthropic 키·Google OAuth 클라이언트로 확인한다.

## 결정 (계획 중 정함, D11–D17)
- 관리 API·Anthropic 키 사전 확인·로그인 결과 수신은 Rust에서 한다. PAT·키는 호출마다 인자로만 넘기고 Rust도 저장하지 않는다 (D11).
- 계정 하나만 허용: 첫 로그인 직후 PAT로 인증 설정의 새 가입 막기(`disable_signup`)를 켠다 (D12).
- Google 로그인: supabase-js PKCE + `http://127.0.0.1:<임시 포트>/auth/callback`에서 한 번만 받는 Rust 수신기 (D13).
- 자격 증명 관리자에는 refresh 토큰만 둔다. 켤 때 그 토큰으로 세션을 다시 받는다 (D14).
- 서버 구조 SQL은 `supabase/migrations/NNNN_*.sql`, 서버 함수는 `supabase/functions/`. Rust가 `include_str!`로 포함하고 최신 번호의 기준은 Rust `migrations.rs` (D15).
- 서버 함수는 단계별로 나누지 않고 앱의 최신 묶음을 매번 다시 배포한다. SQL 단계는 `begin … 번호 기록 … commit` 한 요청으로 적용 (D16).
- 접속 확인: 로그인 전엔 공개 RPC `daybrick_schema_version()`, 로그인 뒤엔 `health` 서버 함수. 둘 다 DB를 실제로 읽는다 (D17).

### 작은 규칙
- 연결 정보는 로그인에 성공했을 때 저장한다. 그 전에 취소·종료하면 아무것도 남지 않는다.
- 가이드 ✓ 자동 체크는 하지 않는다 (번호 목록만). 다시 실행 창의 Google 칸은 ID·비밀값 두 칸.
- 다시 확인 간격: 재개 중 10초, 접속 불가 3분. 재개 팝업을 닫아도 확인은 계속.
- 서버 함수 비밀값 이름: `ANTHROPIC_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- 오류 문구는 `features/server/messages.ts` 한 곳에 원인별로 둔다. PAT·키 값은 어떤 문구에도 넣지 않는다.
- 추측으로 정한 것(관리 API 경로, 일시정지 응답, 리디렉션 허용 주소의 포트 와일드카드)은 해당 단계 처음에 실제 호출로 확인하고, 다르면 진행 기록에 적는다.

## 단계
| 단계 | 이름 | 파일 | 요구사항 |
|---|---|---|---|
| 1 | 설정 화면 틀과 연결 정보 저장 | [step-01.md](step-01.md) | R45, R46 |
| 2 | 첫 실행 안내와 마법사 틀 | [step-02.md](step-02.md) | R1–R3, R7, R9, R10 |
| 3 | ② 주소·키 확인 | [step-03.md](step-03.md) | R4–R6, R8 |
| 4 | ③ 자동 세팅 입력과 사전 확인 | [step-04.md](step-04.md) | R11–R14, R18, R54 |
| 5 | 서버 구조 1번과 자동 세팅 실행 | [step-05.md](step-05.md) | R15–R17, R20–R22, R26, R34, R35 |
| 6 | Google 로그인과 ④ 완료 | [step-06.md](step-06.md) | R15, R19, R28, R29, R31, R51–R53 |
| 7 | 접속 확인·안내 띠·재개 | [step-07.md](step-07.md) | R37–R44 |
| 8 | 서버 업데이트·앱 업데이트 안내 | [step-08.md](step-08.md) | R23–R25, R27 |
| 9 | 설정 서버 연결 칸과 관리 작업 | [step-09.md](step-09.md) | R32, R36, R47–R50 |

## 이번 계획에 넣지 않는 것
- Gmail 권한 추가(job-search), 로컬 데이터 동기화, 계정 삭제·서버 초기화, 앱 자동 업데이트, 공유 웹·안드로이드 연결, 테스트 도구 도입.
