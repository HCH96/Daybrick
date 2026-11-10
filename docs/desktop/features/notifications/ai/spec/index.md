# 알림 (notifications) 명세서 색인

## 기능 개요
앱 전체가 함께 쓰는 알림 센터. 제목 표시줄 오른쪽 위 종 아이콘에 안 읽은 개수를 빨간 배지로 표시하고, 누르면 화면 전환 없이 최근 알림 목록이 펼쳐진다. 앱 안의 기능과 서버 작업이 모두 이곳으로 알림을 보낸다.

## 먼저 있어야 하는 기능
- 서버 연결 `server-setup`: 서버 알림만 해당한다. 로컬 알림은 서버 없이도 동작한다.
- 이 기능을 쓰는 기능: job-search (R80–R81), 이후 타이머·폰 앱 연동

## 요구사항 (묶음 → 파일)
| 묶음 | R 범위 | 파일 |
|---|---|---|
| 아이콘·배지 | R1–R5 | [req-bell.md](req-bell.md) |
| 펼침 목록 (+ 화면 구성) | R6–R20 | [req-panel.md](req-panel.md) |
| 알림 보내기·합치기·보관 | R21–R28 | [req-send.md](req-send.md) |
| 서버 알림 받기·확인 기록 | R29–R36 | [req-server.md](req-server.md) |

## 나머지 파일
| 파일 | 내용 |
|---|---|
| [extension.md](extension.md) | 다른 기능이 알림을 보내는 법. **알림을 보내는 기능을 만들 때 읽기** |
| [data.md](data.md) | 다룰 데이터와 저장 위치 |
| [scope.md](scope.md) | 제외, 나중에 고려할 것, 계획 단계에서 확인할 것 |
| [mockup.md](mockup.md) | 목업 경로(2026-10-26 승인)와 목업에서 정한 것 |
| [decisions.md](decisions.md) | 결정 사항 D1–D18 |

## 다른 문서
- 구현 계획: [../plan/index.md](../plan/index.md) (수정1, 2026-10-27 승인) — 2단계. 로컬 알림 시각을 겹치지 않게 저장하고 정렬 보조 기준을 둔다(D17), 안 읽음 필터는 확인 즉시 뺀다(D18). 처음 계획(8단계, 2026-10-26 승인)은 [../../archive/plan-initial/index.md](../../archive/plan-initial/index.md)
- 테스트 문서: r2(수정1) AI 테스트 [../tests/r2/](../tests/r2/), 사용자 테스트 [../../human/tests/r2-user-test.md](../../human/tests/r2-user-test.md) · r1 문서는 [../../archive/tests/](../../archive/tests/)
- 진행 기록: [../logs/index.md](../logs/index.md)
