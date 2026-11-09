# 백그라운드 실행 (background) 작업 노트
갱신: 2026-11-09

## 완료
- 1단계: 트레이·중복 실행 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 2단계: 닫기와 종료 나누기 (X·Alt+F4는 창 숨기기, 트레이 "종료"를 종료 흐름으로, 종료 전 저장을 `app/quit.ts`로 옮기기)
- 관련 결정: D1, D2, D3, D4 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 트레이 "종료"는 지금 `background/tray.rs`에서 임시 `app.exit(0)`이다. `show_main_window`는 `background/window.rs`에 있고 `background::show_main_window`로 다시 내보낸다.

## 확인할 문서 (경로는 docs/features/background/ 기준, 파일 통째로 읽기)
- ai/plan/step-02.md
- ai/spec/req-tray.md
- ai/logs/L03.md
- ai/plan/structure.md (새 파일 quit.rs·api.ts·app/quit.ts·BackgroundProvider.tsx 위치와 흐름)
