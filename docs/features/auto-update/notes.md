# 자동 업데이트 (auto-update) 작업 노트
갱신: 2026-11-10

## 완료
- 1단계: 서명 키·업데이터 설정 (자동 진행, 최종 테스트 대기)
- 2단계: Rust 업데이트 명령 (자동 진행, 최종 테스트 대기)
- 3단계: 자동 확인·새 버전 알림 (자동 진행, 최종 테스트 대기)
- 4단계: 설정 업데이트 줄·알림 이동 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 5단계: 설치 흐름·실패 처리 (Provider의 `install` 채우기, 타이머 확인 창 UpdateDialogs, 실패 알림, devUpdater 받기 흉내)
- 관련 결정: D1, D2, D3, D5, D6 (ai/spec/decisions.md에서 이 줄만 읽기), background D3·D4, today D9 (각 기능 decisions.md에서 그 줄만 grep)
- 주의: `UpdaterStore`의 설치 함수 이름은 `install`(step-05의 `startInstall` 자리, 빈 함수)이고 `UpdateRow`의 [설치하고 다시 시작]에 이미 연결돼 있다. `UpdateRow`는 개발 모드(`info.available === false`)면 두 버튼을 비활성으로 두므로(R15), 개발 모드 흉내 확인 방법(예: devUpdater 경로에서만 `install`을 직접 부르기)을 이 단계에서 정한다. `devUpdater.ts`의 `installDevUpdater(setPhase)`는 지금 phase만 바꾼다.

## 확인할 문서 (경로는 docs/features/auto-update/ 기준, 파일 통째로 읽기)
- ai/plan/step-05.md
- ai/spec/req-install.md
- ai/logs/L06.md
- ../background/ai/spec/decisions.md의 D3·D4 줄만, ../today/ai/spec/decisions.md의 D9 줄만 (grep)
- apps/desktop/src/components/background/BackgroundDialogs.tsx (확인 창 모양 참고, grep으로 ConfirmDialog 쓰는 부분만)
- ai/plan/structure.md의 "1. 파일 목록" 구역 (새 `components/updater/UpdateDialogs.tsx` 위치)
