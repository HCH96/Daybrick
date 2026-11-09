# 백그라운드 실행 (background) 작업 노트
갱신: 2026-11-09

## 완료
- 1단계: 트레이·중복 실행 (자동 진행, 최종 테스트 대기)
- 2단계: 닫기와 종료 나누기 (자동 진행, 최종 테스트 대기)
- 3단계: 첫 닫기 안내·타이머 종료 확인 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 4단계: 자동 시작 (R13–R18 자동 시작 플러그인·첫 실행 등록, 창 숨긴 채 시작, 설정 "앱" 칸 스위치)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `background/app_settings.rs`에 `read(app)`(없거나 깨지면 기본값)·`write(app, &settings)`가 pub으로 있다. `autostartInitialized` 칸도 이미 있으니 autostart.rs는 이 둘을 쓴다.
- 주의: 설정 칸 모양은 `pages/settings/`의 데이터 동기화 칸(`settings-card`·스위치)을 grep으로 보고 따른다.

## 확인할 문서 (경로는 docs/features/background/ 기준, 파일 통째로 읽기)
- ai/plan/step-04.md
- ai/spec/req-startup.md
- ai/logs/L05.md
- ai/plan/structure.md (autostart.rs·AppSection 위치와 시작 흐름)
