# 자동 업데이트 (auto-update) 작업 노트
갱신: 2026-11-10

## 완료
- 1단계: 서명 키·업데이터 설정 (자동 진행, 최종 테스트 대기)
- 2단계: Rust 업데이트 명령 (자동 진행, 최종 테스트 대기)
- 3단계: 자동 확인·새 버전 알림 (자동 진행, 최종 테스트 대기)
- 4단계: 설정 업데이트 줄·알림 이동 (자동 진행, 최종 테스트 대기)
- 5단계: 설치 흐름·실패 처리 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 6단계: 첫 버전 0.2.0·실제 업데이트 확인 (버전 0.2.0/0.2.1 빌드, latest.json, 릴리즈, desktop-release.md 정리)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: GitHub 릴리즈 올리기는 공개 작업이라 하기 전에 메인(사용자)에게 물어야 한다. 이 단계는 설치본 설치·실제 업데이트처럼 사용자가 직접 해야 하는 일이 많으니, 하위 에이전트가 할 수 있는 것(버전 올리기·빌드·문서)과 사용자에게 넘길 것을 나눠 적는다.

## 확인할 문서 (경로는 docs/features/auto-update/ 기준, 파일 통째로 읽기)
- ai/plan/step-06.md
- ai/spec/req-release.md, ai/spec/req-compat.md, ai/spec/done.md
- ai/logs/L07.md
- ai/plan/structure.md의 "2. 데이터 모양" 절 (latest.json 모양)
- docs/common/ai/setup/desktop-release.md (고칠 파일)
