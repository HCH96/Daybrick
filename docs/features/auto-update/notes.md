# 자동 업데이트 (auto-update) 작업 노트
갱신: 2026-11-10

## 완료
- 1단계: 서명 키·업데이터 설정 (자동 진행, 최종 테스트 대기)
- 2단계: Rust 업데이트 명령 (자동 진행, 최종 테스트 대기)
- 3단계: 자동 확인·새 버전 알림 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 4단계: 설정 업데이트 줄·알림 이동 (설정 › 앱에 UpdateRow, 설정 페이지 tab 스크롤, 개발 모드용 devUpdater)
- 관련 결정: D1, D2, D3, D4, D5, D6 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `UpdaterProvider`의 `UpdaterStore`는 지금 `phase`·`info`·`checkNow`만 있다. [설치하고 다시 시작]용 빈 함수(예: `install`)와 devUpdater용 상태 바꾸기를 이 단계에서 더한다. phase 타입(`UpdaterPhase`)은 9가지 모두 이미 있고, `downloading`의 `percent`는 `number | null`. `info`는 읽기 전 null, 개발 모드면 `available: false`.

## 확인할 문서 (경로는 docs/features/auto-update/ 기준, 파일 통째로 읽기)
- ai/plan/step-04.md
- ai/spec/req-settings.md
- ai/spec/req-install.md의 R20·R22·R23 줄만 (grep)
- ai/logs/L05.md
- ../notifications/ai/spec/extension.md의 "갈 곳 처리" 구역 (usePageIntent)
- docs/common/ai/design/design-direction.md (새 CSS 값)
- ai/plan/structure.md의 "1. 파일 목록" 구역 (새 파일 위치)
