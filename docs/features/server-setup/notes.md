# 서버 연결 (server-setup) 작업 노트
갱신: 2026-10-26

## 완료
- 1단계: 설정 화면 틀과 연결 정보 저장 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 2단계: 첫 실행 안내와 마법사 틀 (첫 실행 전체 화면, 마법사 틀·① 준비, 설정의 [서버 연결 시작] 연결)
- 관련 결정: D1, D6, D7, D10, D18 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 연결 정보·상태는 `useServer()`(config는 읽기 전 null, `updateConfig(patch)`로 저장)로 쓴다. [서버 연결 시작] 버튼은 `pages/settings/ServerSectionOff.tsx`에 동작 없이 있다.

## 확인할 문서 (경로는 docs/features/server-setup/ 기준, 파일 통째로 읽기)
- ai/plan/step-02.md
- ai/plan/index.md (결정·작은 규칙 칸)
- ai/spec/req-onboarding.md
- ai/logs/L06.md
- human/mockups/welcome.html의 welcome-actions·welcome-needs 구역, wizard-prepare.html의 wiz-prep-steps·wiz-prep-cards·wiz-prep-guide·wiz-prep-foot 구역 (CSS: wizard.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 "화면" 표 `pages/server-setup/` 줄과 3절 컴포넌트 구조
