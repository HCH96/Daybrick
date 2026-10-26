# 서버 연결 (server-setup) 작업 노트
갱신: 2026-10-26

## 완료
- 1단계: 설정 화면 틀과 연결 정보 저장 (자동 진행, 최종 테스트 대기)
- 2단계: 첫 실행 안내와 마법사 틀 (자동 진행, 최종 테스트 대기)
- 3단계: ② 주소·키 확인 (자동 진행, 최종 테스트 대기)
- 4단계: ③ 자동 세팅 입력과 사전 확인 (자동 진행, 최종 테스트 대기)
- 5단계: 서버 구조 1번과 자동 세팅 실행 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 6단계: Google 로그인과 ④ 완료 (Rust 수신기·자격 증명, googleLogin·session, 실행 5·6단계 계정 등록·마무리 확인, LoginStep·DoneStep)
- 관련 결정: D1–D23, D25–D27 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 실행 5·6단계는 `setupRunner.ts`의 `ACTIONS`에 `account`·`verify`를 더하면 `runSetup`이 "pending"으로 멈추지 않고 이어간다. 지금 `SetupRunStep.tsx`의 "pending" 안내 글과 `WizardShell`의 run 칸 [다음] 비활성(`canGoNext`)을 함께 정리한다. Anthropic 키 등록일은 `daybrick_server_state`에 본인 행으로 쓴다(5단계 비밀값 등록 시각을 쓸지 계정 등록 시각을 쓸지 정해 기록). 세팅이 끝나면 비밀값을 비운다(R18, L09 남은 문제). `health` 응답은 `{ schema, keyRegisteredAt, email }`, `ai-key-check`는 `{ ok, reason? }`.

## 확인할 문서 (경로는 docs/features/server-setup/ 기준, 파일 통째로 읽기)
- ai/plan/step-06.md
- ai/plan/index.md (결정·작은 규칙 칸)
- ai/spec/req-auth.md
- ai/spec/req-auto-setup.md의 R15·R18·R19 줄 (grep으로)
- ai/logs/L10.md
- human/mockups/wizard-run.html의 wiz-run-login 구역, wizard-login.html의 wiz-login-start·wiz-login-wait·wiz-login-denied 구역, wizard-done.html의 wiz-done-summary·wiz-done-next 구역 (CSS: wizard.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 Rust 표(oauth_listener.rs·credentials.rs 줄), 프론트 로직 표(googleLogin.ts·session.ts 줄), 화면 표 6단계 줄
