# 서버 연결 (server-setup) 작업 노트
갱신: 2026-10-26

## 완료
- 1단계: 설정 화면 틀과 연결 정보 저장 (자동 진행, 최종 테스트 대기)
- 2단계: 첫 실행 안내와 마법사 틀 (자동 진행, 최종 테스트 대기)
- 3단계: ② 주소·키 확인 (자동 진행, 최종 테스트 대기)
- 4단계: ③ 자동 세팅 입력과 사전 확인 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 5단계: 서버 구조 1번과 자동 세팅 실행 (supabase/ SQL·서버 함수, Rust migrations.rs·관리 API 실행 명령, setupRunner와 ③ 실행 화면의 단계 목록·실패·[다시 시도])
- 관련 결정: D1–D18, D20–D26 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 실행 화면은 `WizardShell.tsx`의 `renderStep()`에서 `setup` 칸이 `setupPhase === "run"`일 때 `PendingStep`을 그리는 자리를 바꾼다. PAT·키·Google 값은 `wizard.inputs`, ref는 `wizard.keysCheck`(kind "ok")에 있다. 실행 중 [이전]·[취소] 막기는 `WizardFooter`의 `canGoPrev`와 `useWizard`의 `prev`·`cancel`에서 한다. 새 관리 API 명령은 `management.rs`에 더하고 `http.rs` 도구와 `run_query`를 쓴다(D25). `APP_SCHEMA_VERSION`을 Rust 최신 번호로 바꾼다(D24).

## 확인할 문서 (경로는 docs/features/server-setup/ 기준, 파일 통째로 읽기)
- ai/plan/step-05.md
- ai/plan/index.md (결정·작은 규칙 칸)
- ai/spec/req-auto-setup.md
- ai/spec/req-migrations.md
- ai/spec/req-auth.md의 R34·R35 줄 (grep으로)
- ai/logs/L09.md
- human/mockups/wizard-run.html의 wiz-run-list·wiz-run-fail 구역 (CSS: wizard.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 2절(테이블·RLS·RPC), supabase 표, Rust 표(migrations.rs·management.rs 줄), 프론트 로직 표의 setupRunner.ts 줄
