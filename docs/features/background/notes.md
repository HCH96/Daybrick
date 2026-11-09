# 백그라운드 실행 (background) 작업 노트
갱신: 2026-11-09

## 완료
- 1단계: 트레이·중복 실행 (자동 진행, 최종 테스트 대기)
- 2단계: 닫기와 종료 나누기 (자동 진행, 최종 테스트 대기)
- 3단계: 첫 닫기 안내·타이머 종료 확인 (자동 진행, 최종 테스트 대기)
- 4단계: 자동 시작 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 5단계: 설치본 확인 (`npm run tauri build`로 설치본을 만들어 R1–R19 확인, 숨김 상태 타이머 갱신 확인)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 자동 시작 인자는 `background/autostart.rs`의 `AUTOSTART_ARG`("--autostart"). 개발 빌드(`target/debug`)는 자동 시작을 건드리지 않으므로 Run 키 확인은 release 빌드로만 한다.
- 주의: 타이머 느려짐 때문에 `additionalBrowserArgs`를 넣게 되면 결정으로 올린다 (step-05.md).

## 확인할 문서 (경로는 docs/features/background/ 기준, 파일 통째로 읽기)
- ai/plan/step-05.md
- ai/spec/done.md
- ai/spec/req-tray.md
- ai/spec/req-startup.md
- ai/logs/L06.md
