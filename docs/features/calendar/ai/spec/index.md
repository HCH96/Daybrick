# 캘린더 (calendar) 명세서 색인

## 기능 개요
플랜 태스크, 지원관리 일정, 프로젝트 체크포인트, 개인 일정을 한 달 달력에서 모아 보는 페이지. 앞으로의 일정을 보는 곳이라 기록·통계는 넣지 않고, 지난 날짜는 회고 패널로 돌아본다. 사이드바의 스케줄러 자리를 대신한다.

## 요구사항 (묶음 → 파일)
| 묶음 | R 범위 | 파일 |
|---|---|---|
| 페이지·월 달력 (+ 화면 구성) | R1–R8 | [req-page.md](req-page.md) |
| 표시 항목·칩 | R9–R20 | [req-chips.md](req-chips.md) |
| 개인 일정 | R21–R30 | [req-personal.md](req-personal.md) |
| 플랜 연동 | R31–R34 | [req-plan-link.md](req-plan-link.md) |
| 드래그·달 넘김 | R35–R41 | [req-interaction.md](req-interaction.md) |
| 회고 패널 (+ 화면 구성) | R42–R48 | [req-review.md](req-review.md) |

## 나머지 파일
| 파일 | 내용 |
|---|---|
| [data.md](data.md) | 개인 일정(새 데이터), 읽어 오는 태스크·프로젝트·지원 일정·타이머 기록, 저장 위치 |
| [scope.md](scope.md) | 이번 범위에서 제외하는 것, 나중에 고려할 것 |
| [mockup.md](mockup.md) | 목업 경로(2026-11-05 승인), 목업에서 정한 것 (칩 모양, 종류 아이콘, 드래그·달 넘김 움직임, 회고 패널) |
| [decisions.md](decisions.md) | 결정 사항 D1–D11 |

## 다른 문서
- 구현 계획: [../plan/index.md](../plan/index.md) (2026-11-05 승인). 9단계, 개인 일정은 calendar.json(D7), 칸 배치·+N 규칙(D8)·날짜 입력 검사(D9)·포인터 드래그(D10)를 정함
- 테스트 문서: (아직 없음)
- 진행 기록: [../logs/index.md](../logs/index.md)
- 태스크 데이터: [플랜 명세서 색인](../../../plan/ai/spec/index.md)의 data.md, 주간 달력 R21–R34
- 지원 일정 규칙: [지원 관리 명세서 색인](../../../applications/ai/spec/index.md)의 req-schedule.md (R23–R27, R39)
- 주차·깃발 규칙: [프로젝트 명세서 색인](../../../projects/ai/spec/index.md)의 req-project.md, req-detail.md
- 타이머 기록: [투데이 명세서 색인](../../../today/ai/spec/index.md)의 data.md
