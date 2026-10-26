# 서버 연결 (server-setup) 작업 노트
갱신: 2026-10-26

## 완료
- 1단계: 설정 화면 틀과 연결 정보 저장 (자동 진행, 최종 테스트 대기)
- 2단계: 첫 실행 안내와 마법사 틀 (자동 진행, 최종 테스트 대기)
- 3단계: ② 주소·키 확인 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 4단계: ③ 자동 세팅 입력과 사전 확인 (Rust 키·PAT 확인과 빈 프로젝트 검사, PAT·Anthropic 키·Google ID·비밀값 입력, 리디렉션 주소 복사, [세팅 시작] 전 사전 확인 결과)
- 관련 결정: D1–D18, D20–D23 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: ③ 화면은 `WizardShell.tsx`의 `renderStep()`에서 `setup` 칸이 `PendingStep`으로 그려지는 자리를 바꾼다. 주소·ref·키는 `wizard.keysCheck`(kind "ok"일 때 `url`·`ref`·`anonKey`)에 있다. 버튼 글자·동작은 `WizardShell.tsx`의 `nextButton()`, 다음으로 갈 수 있는지는 `useWizard`의 `canGoNext`에서 정한다. 비밀값 칸은 이미 만든 `SecretInput`(props: value·onChange·state·onEnter)을 쓴다. 오류 문구는 `features/server/messages.ts`에 추가한다.

## 확인할 문서 (경로는 docs/features/server-setup/ 기준, 파일 통째로 읽기)
- ai/plan/step-04.md
- ai/plan/index.md (결정·작은 규칙 칸)
- ai/spec/req-auto-setup.md
- ai/spec/req-onboarding.md의 R54 줄과 가이드 표의 ③ 줄 (grep으로)
- ai/logs/L08.md
- human/mockups/wizard-setup.html의 wiz-setup-form·wiz-setup-redirect·wiz-setup-guide·wiz-setup-check 구역 (CSS: wizard.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 Rust 표(anthropic.rs·management.rs·lib.rs·Cargo.toml 줄)와 프론트 로직 표의 management.ts 줄
