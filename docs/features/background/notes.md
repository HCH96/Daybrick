# 백그라운드 실행 (background) 작업 노트
갱신: 2026-11-09

## 완료
- 1단계: 트레이·중복 실행 (자동 진행, 최종 테스트 대기)
- 2단계: 닫기와 종료 나누기 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 3단계: 첫 닫기 안내·타이머 종료 확인 (R4 첫 닫기 안내 창, R10 타이머 실행 중 종료 확인 창)
- 관련 결정: D1, D2, D3, D4 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `BackgroundProvider`는 이미 children을 감싸는 모양이라, 안내·확인 창 상태를 context로 내주면 된다. 지금 종료 흐름은 `handleQuit`(ack → `runQuitHandlers` → `quitApp`, `quittingRef`로 중복 막기). [취소]하면 `quittingRef`를 되돌려야 한다.
- 주의: `features/sync/useCloseFlush.ts`의 `sessionRef`는 한 번 만들면 비우지 않는다. 종료 [취소]는 저장 전에 묻게 해서(확인 → `runQuitHandlers`) 이 문제를 피한다 (L04 남은 문제).

## 확인할 문서 (경로는 docs/features/background/ 기준, 파일 통째로 읽기)
- ai/plan/step-03.md
- ai/spec/req-tray.md
- ai/logs/L04.md
- ai/plan/structure.md (새 파일 app_settings.rs·NoticeDialog.tsx·BackgroundDialogs.tsx 위치와 흐름)
