# 자동 업데이트 (auto-update) 작업 노트
갱신: 2026-11-10

## 완료
- 1단계: 서명 키·업데이터 설정 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 2단계: Rust 업데이트 명령 (updater 모듈에 확인·받기·설치·버리기 명령과 알린 버전 저장 추가)
- 관련 결정: D1, D2, D5 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 플러그인 등록은 1단계에서 `lib.rs`에 넣었다 (`tauri_plugin_updater::Builder`). `.sig` 생성 빌드 확인은 사용자 몫으로 남아 있으니 AI가 서명 빌드를 하지 않는다.

## 확인할 문서 (경로는 docs/features/auto-update/ 기준, 파일 통째로 읽기)
- ai/plan/step-02.md
- ai/spec/req-check.md, ai/spec/req-install.md, ai/spec/req-compat.md
- ai/spec/req-settings.md의 R14 줄만 (grep)
- ai/logs/L03.md
- ai/plan/structure.md의 "1. 파일 목록"·"2. 데이터 모양" 구역 (새 파일 위치·데이터 모양)
