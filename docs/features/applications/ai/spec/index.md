# 지원 관리 (applications) 명세서 색인

## 기능 개요
지원한 채용 공고를 카드로 정리하고, 상태와 전형 일정을 갤러리와 달력으로 관리한다. 카드 본문은 마크다운으로 자유롭게 기록한다.

## 요구사항 (묶음 → 파일)
| 묶음 | R 범위 | 파일 |
|---|---|---|
| 지원 관리 페이지·갤러리 (+ 화면 구성) | R1–R6, R38 | [req-page-gallery.md](req-page-gallery.md) |
| 달력 (+ 화면 구성) | R7–R11 | [req-calendar.md](req-calendar.md) |
| 상세 팝업 (+ 화면 구성) | R12–R16 | [req-popup.md](req-popup.md) |
| 상태 (상태 대응 표 포함) | R17–R22 | [req-status.md](req-status.md) |
| 전형 일정 | R23–R27, R39 | [req-schedule.md](req-schedule.md) |
| 속성 | R28–R33, R40 | [req-properties.md](req-properties.md) |
| 본문 (마크다운) | R34–R35 | [req-body.md](req-body.md) |
| 홈 연동 | R36–R37 | [req-home.md](req-home.md) |

## 나머지 파일
| 파일 | 내용 |
|---|---|
| [data.md](data.md) | 다룰 데이터 (카드·전형 일정·속성 정의·기본 속성 표, 저장 위치, 상태 색) |
| [scope.md](scope.md) | 이번 범위에서 제외하는 것, 나중에 고려할 것 |
| [mockup.md](mockup.md) | 목업 경로, 목업에서 정한 것(상태 색·배지·카드·달력 칸 등), 추가 제안 |
| [decisions.md](decisions.md) | 결정 사항 D1~ (노트의 "관련 결정" 번호 줄만 읽기) |

## 다른 문서
- 구현 계획: [../plan/index.md](../plan/index.md) (2026-10-22 승인, 10단계). 계획에서 정한 것: JSON 파일 저장 + `images/` 폴더, Tiptap 편집기, 역할 있는 기본 속성(마감일·지원일·우선순위·결과·회사)은 종류 변경 금지 (마감일·지원일은 L18에서 없앰), 홈 요약 줄 "지원 관리" 칸에 진행 중 개수 표시
- 테스트 문서: AI 테스트 [../tests/r1/index.md](../tests/r1/index.md), 사용자 테스트 [../../human/tests/r1-user-test.md](../../human/tests/r1-user-test.md) (r1, 2026-10-23)
- 진행 기록: [../logs/index.md](../logs/index.md)
- 사용자 테스트 r1 반영 수정(L18): R5·R8·R13·R21·R24·R25·R33 변경, R38–R40 추가
