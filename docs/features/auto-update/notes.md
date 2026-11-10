# 자동 업데이트 (auto-update) 작업 노트
갱신: 2026-11-10

## 완료
- 1단계: 서명 키·업데이터 설정 (자동 진행, 최종 테스트 대기)
- 2단계: Rust 업데이트 명령 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 3단계: 자동 확인·새 버전 알림 (features/updater의 api·logic·notices·UpdaterProvider로 시작 5초 뒤·24시간 확인과 한 번만 보내는 새 버전 알림)
- 관련 결정: D1, D2, D3, D4, D5, D6 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: Rust 오류는 `{ kind: "network" | "signature", message }` 객체로 온다 (문자열 아님). 개발 모드의 `check_update`도 kind `network` 오류다. `mark_update_notified`는 `{ version }` 인자, 실패하면 문자열 오류. 진행률 Channel 값은 `{ downloaded, total }`(downloaded는 누적 바이트).

## 확인할 문서 (경로는 docs/features/auto-update/ 기준, 파일 통째로 읽기)
- ai/plan/step-03.md
- ai/spec/req-check.md, ai/spec/req-settings.md의 R14 줄만 (grep)
- ai/logs/L04.md
- ../notifications/ai/spec/extension.md (알림 보내는 법)
- ai/plan/structure.md의 "1. 파일 목록"·"3. 흐름과 컴포넌트 구조" 구역 (새 파일 위치)
