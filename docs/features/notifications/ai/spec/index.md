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
| mockup.md | (아직 없음) |
| [decisions.md](decisions.md) | 결정 사항 D1–D7 |

## 다른 문서
- 구현 계획: (아직 없음)
- 테스트 문서: (아직 없음)
- 진행 기록: [../logs/index.md](../logs/index.md)
