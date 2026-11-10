# 백그라운드 실행 명세서 색인
창을 닫아도 앱이 트레이에서 계속 돌고, 윈도우 로그인 때 자동으로 시작되며, 두 번 실행되지 않게 한다.

## 요구사항 묶음
| 묶음 | 파일 | R 범위 |
|---|---|---|
| 창 숨기기·트레이·종료 | [req-tray.md](req-tray.md) | R1–R12 |
| 시작·자동 시작·중복 실행 | [req-startup.md](req-startup.md) | R13–R19 |

## 나머지 파일
| 파일 | 내용 |
|---|---|
| [data.md](data.md) | 저장할 설정 값과 저장 위치 |
| [scope.md](scope.md) | 이번 범위에서 제외, 나중에 고려 |
| [done.md](done.md) | 완료 기준 (빌드·exe) |
| mockup.md | (아직 없음) |
| [decisions.md](decisions.md) | 계획 중 정한 결정 (D1–D7) |

## 다른 문서
- 구현 계획: [../plan/index.md](../plan/index.md) (2026-11-09 승인). 닫기는 숨기기만 하고 종료 전 저장은 `app/quit.ts`에 모은다(D4). 자동 시작은 `--autostart` 인자로 창 없이 시작한다(D7).
- 테스트: AI [../tests/r1/](../tests/r1/) (r1), 사용자 [../../human/tests/r1-user-test.md](../../human/tests/r1-user-test.md) (r1)
- 진행 기록: [../logs/index.md](../logs/index.md)
