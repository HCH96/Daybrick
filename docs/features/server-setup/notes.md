# 서버 연결 (server-setup) 작업 노트
갱신: 2026-10-26

## 완료
- 1단계: 설정 화면 틀과 연결 정보 저장 (자동 진행, 최종 테스트 대기)
- 2단계: 첫 실행 안내와 마법사 틀 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 3단계: ② 주소·키 확인 (주소·키 입력과 "어디서 찾나요?", [확인]으로 접속해 원인별 결과와 다음 화면 정하기)
- 관련 결정: D1–D10, D12–D18, D20, D21 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 마법사 단계는 `wizard/useWizard.ts`(`WizardStepId`, 입력값 `inputs`·`setInputs`, `next`/`prev`/`cancel`)에 있다. `WizardShell.tsx`가 prepare 외 단계는 `PendingStep`과 비활성 [다음]으로 그리므로 keys 단계를 `KeysStep`으로 바꾸고 [확인] 동작을 붙인다. 가이드는 `guides.ts`의 `GUIDES`에 keys 항목을 추가한다.

## 확인할 문서 (경로는 docs/features/server-setup/ 기준, 파일 통째로 읽기)
- ai/plan/step-03.md
- ai/plan/index.md (결정·작은 규칙 칸)
- ai/spec/req-onboarding.md
- ai/logs/L07.md
- human/mockups/wizard-keys.html의 wiz-keys-form·wiz-keys-guide·wiz-keys-result 구역 (CSS: wizard.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 "프론트 로직" 표(validate·supabaseClient·probe·messages 줄)와 2절 데이터 모양
