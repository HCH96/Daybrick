# 공통 (빌드·개발 도구)

## A1 빌드·Rust 컴파일
- 테스트 내용: 프론트엔드 빌드(타입 검사 포함)와 Rust 컴파일 확인
- 근거 요구사항: 전 단계
- 수행 방법: apps/desktop에서 `npm run build | tail`, apps/desktop/src-tauri에서 `cargo check | tail`
- 예상 결과: 둘 다 성공
- 실제 결과: vite 빌드 `✓ built`(343 모듈), 번들 500kB 초과 경고만 있음. `cargo check` `Finished dev profile` 오류 없음
- 판정: 통과

## A13 daybrickNotify 개발 모드 전용
- 테스트 내용: 콘솔 테스트용 `window.daybrickNotify`가 개발 모드에서만 열리는지
- 근거 요구사항: 계획 작은 규칙
- 수행 방법: features/notifications/devNotify.ts `installDevNotify` 읽기, 사용처 grep, 배포 빌드 결과 `dist/assets/*.js`에서 `daybrickNotify` 개수 grep
- 예상 결과: 배포 빌드에는 노출되지 않음
- 실제 결과: `import.meta.env.DEV`일 때만 `window.daybrickNotify = notify`. 사용처는 NotificationsProvider의 installDevNotify 한 곳. 방금 만든 배포 번들에 `daybrickNotify` 문자열 0개(DEV 분기가 빠짐)
- 판정: 통과
