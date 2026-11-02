# 플랜 (plan) 명세서 색인

## 기능 개요
카테고리별 태스크를 만들고 주간 달력의 날짜에 끌어 놓아 한 주 계획을 세운다. 태스크는 앱 전체가 함께 쓰는 데이터로, 나중에 투데이·타이머·프로젝트 페이지가 같은 태스크를 쓴다.

## 요구사항 (묶음 → 파일)
| 묶음 | R 범위 | 파일 |
|---|---|---|
| 페이지·공유 (+ 화면 구성) | R1–R5 | [req-page.md](req-page.md) |
| 카테고리 | R6–R10 | [req-category.md](req-category.md) |
| 태스크 목록 | R11–R20 | [req-task-list.md](req-task-list.md) |
| 주간 달력 | R21–R30 | [req-calendar.md](req-calendar.md) |
| 지원관리 일정 표시 | R31–R34 | [req-applications.md](req-applications.md) |
| 태스크 상세 팝업 (+ 화면 구성) | R35–R41 | [req-task-detail.md](req-task-detail.md) |

## 나머지 파일
| 파일 | 내용 |
|---|---|
| [data.md](data.md) | 다룰 데이터 (카테고리, 태스크, 화면 설정), 저장 위치 |
| [scope.md](scope.md) | 이번 범위에서 제외하는 것, 나중에 고려할 것 (투데이·타이머·프로젝트) |
| [extension.md](extension.md) | 확장 구조: 공용 태스크 저장소, 나중 기능이 태스크를 쓰는 방식. **다른 기능을 붙일 때 읽기** |
| mockup.md | (아직 없음) |
| [decisions.md](decisions.md) | 결정 사항 D1~ |

## 다른 문서
- 구현 계획: (아직 없음)
- 테스트 문서: (아직 없음)
- 진행 기록: [../logs/index.md](../logs/index.md)
- 지원관리 일정 규칙: [지원 관리 명세서 색인](../../../applications/ai/spec/index.md)의 req-schedule.md
