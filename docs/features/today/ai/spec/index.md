# 투데이 (today) 명세서 색인

## 기능 개요
플랜에서 배치한 태스크 중 오늘이 기간 안인 것을 상태 3칸 칸반으로 보고, 타이머로 바로 실행하고, 오늘 얼마나 했는지 확인한다. 태스크는 플랜과 같은 데이터이고, 시간 기록만 따로 쌓는다.

## 요구사항 (묶음 → 파일)
| 묶음 | R 범위 | 파일 |
|---|---|---|
| 페이지·이번 주 진행 바 (+ 화면 구성) | R1–R7 | [req-page.md](req-page.md) |
| 칸반 | R8–R15 | [req-kanban.md](req-kanban.md) |
| 타이머 (+ 카드 표시·달리기 트랙) | R16–R26, R40–R48 | [req-timer.md](req-timer.md) |
| 오늘 요약 (R32 삭제) | R27–R33 | [req-summary.md](req-summary.md) |
| 끝내지 못한 태스크 | R34–R39 | [req-overdue.md](req-overdue.md) |

## 나머지 파일
| 파일 | 내용 |
|---|---|
| [data.md](data.md) | 태스크(플랜 것), 시간 기록, 실행 중 타이머, 하루 목표 |
| [scope.md](scope.md) | 이번 범위에서 제외하는 것, 나중에 고려할 것 (백그라운드 상주·안드로이드 연동) |
| [timer-visual.md](timer-visual.md) | 타이머 카드·달리기 트랙 모양, 상태별 애니메이션 (사용자 시안 값) |
| [extension.md](extension.md) | 확장 구조: 공용 타이머 저장소, 시작 흐름, 시간 기록 연결 방식 |
| [mockup.md](mockup.md) | 목업 경로(r1–r3 2026-11-03 승인)와 목업에서 정한 것 |
| [decisions.md](decisions.md) | 결정 사항 D1–D11 |

## 다른 문서
- 구현 계획: [../plan/index.md](../plan/index.md) (2026-11-03 승인, 8단계). 시간 기록·실행 중 타이머·목표는 `today.json` 하나에 두고, 앱 종료는 다음 실행 때 강제 종료 복구와 같은 길로 처리한다 (D8–D11)
- 테스트 문서: (아직 없음)
- 진행 기록: [../logs/index.md](../logs/index.md)
- 태스크 데이터·공용 함수: [플랜 명세서 색인](../../../plan/ai/spec/index.md)의 data.md, extension.md
