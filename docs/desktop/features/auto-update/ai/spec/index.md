# 자동 업데이트 명세서 색인
PC 앱이 GitHub Releases에서 새 버전을 확인하고, 알림센터로 알린 뒤, 설정 화면에서 받아 설치하고 다시 시작한다.

## 먼저 있어야 하는 기능
- 알림 `notifications`: 새 버전·실패 알림을 보낸다 (notifications extension.md).
- 백그라운드 실행 `background`: 종료 전 저장(`runQuitHandlers`, D3·D4)과 개발 모드 판단(D6)을 쓴다.
- 투데이 `today`: 설치 전 타이머 처리(today R24, D9)를 쓴다.

## 요구사항 묶음
| 묶음 | 파일 | R 범위 |
|---|---|---|
| 새 버전 확인·알림 | [req-check.md](req-check.md) | R1–R9 |
| 설정 화면 (+ 화면 구성) | [req-settings.md](req-settings.md) | R10–R15 |
| 설치·재시작·실패 | [req-install.md](req-install.md) | R16–R24 |
| 릴리즈·서명·버전 | [req-release.md](req-release.md) | R25–R32 |
| 데이터 호환 | [req-compat.md](req-compat.md) | R33–R36 |

## 나머지 파일
| 파일 | 내용 |
|---|---|
| [data.md](data.md) | 다룰 데이터와 저장 위치 |
| [scope.md](scope.md) | 이번 범위에서 제외, 나중에 고려 |
| [done.md](done.md) | 완료 기준 (빌드, 실제 업데이트 확인) |
| mockup.md | (아직 없음) |
| [decisions.md](decisions.md) | 결정 사항 D1–D7 |

## 다른 문서
- 구현 계획: [../plan/index.md](../plan/index.md) (2026-11-10 승인) — 6단계. updater 플러그인은 Rust에서만 쓰고 받기·설치를 나눈다(D1, D2). 첫 버전 0.2.0, 테스트 릴리즈 0.2.1
- 테스트: r1 AI 테스트 [../tests/r1/](../tests/r1/) (16항목 통과) · 사용자 테스트 [../../human/tests/r1-user-test.md](../../human/tests/r1-user-test.md)
- 진행 기록: [../logs/index.md](../logs/index.md)
- 현재 빌드·설치 절차: [docs/desktop/common/ai/setup/desktop-release.md](../../../../common/ai/setup/desktop-release.md)
