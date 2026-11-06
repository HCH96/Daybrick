# 메인 페이지 (main-page) 명세서 색인

## 기능 개요
앱을 켰을 때 처음 보이는 화면. 제목 표시줄·사이드바로 각 기능 화면을 오가고, 홈에서는 앞으로 일주일과 앱 전체 상황(집중, 일정, 마감, 프로젝트, 지원, 추천 공고)을 한눈에 본다. 오늘 할 일을 처리하는 곳은 투데이이고, 홈은 요약하고 바로 가는 곳이다.
(2026-10-22 L32에서 R 번호 양식으로 정리, 2026-11-07 L34에서 홈 개편: R12–R15·R17 변경, R22–R47 추가)

## 요구사항 (묶음 → 파일)
| 묶음 | R 범위 | 파일 |
|---|---|---|
| 앱 틀 (+ 전체 화면 구성) | R1–R4 | [req-shell.md](req-shell.md) |
| 사이드바 (메뉴 표 포함) | R5–R9 | [req-sidebar.md](req-sidebar.md) |
| 홈 상단·요약 줄·카드 틀 (카드 표 포함) | R10–R17, R22–R28 | [req-home.md](req-home.md) |
| 홈: 다가오는 7일 | R29–R34 | [req-home-upcoming.md](req-home-upcoming.md) |
| 홈: 나머지 카드 (지금 하는 것·이번 주 집중·프로젝트·지원·추천 공고) | R35–R47 | [req-home-cards.md](req-home-cards.md) |
| 기능 화면·공통 (색 목록 포함) | R18–R21 | [req-common.md](req-common.md) |

## 나머지 파일
| 파일 | 내용 |
|---|---|
| [data.md](data.md) | 다룰 데이터 (사이드바 접힘, 방문 기록, 홈이 읽는 데이터) |
| [scope.md](scope.md) | 이번 범위에서 제외하는 것, 나중에 고려할 것 |
| [extension.md](extension.md) | 확장 구조: 페이지 목록(PageDef), 대시보드 카드 목록, 화면 전환 방식. **다른 기능을 붙일 때 읽기** |
| [files.md](files.md) | 파일 구조 (2026-10-22 구현 기준) |
| [window.md](window.md) | 창 설정, 알려진 제약 |
| [done.md](done.md) | 완료 기준 |
| [mockup.md](mockup.md) | 목업 경로와 "목업에서 정한 것" (홈 개편 목업 2026-11-07 승인: 카드 배치·표시 방식), 이전 목업·후보 목업 |
| [decisions.md](decisions.md) | 결정 사항 D1–D11 |

## 다른 문서
- 구현 계획: [../plan/index.md](../plan/index.md) (홈 개편 수정 계획, 2026-11-07 승인, 8단계). 홈 계산은 features/home/ 순수 함수로 두고 다른 기능 함수를 재사용, 추천 공고는 홈에 들어올 때 한 번 읽음 (D9–D11). 끝난 계획 (보관): [처음 계획](../../archive/plans/main-page-plan.md) (2026-10-21 승인, 6단계), [B안 배치](../../archive/plans/main-page-layout-b-plan.md) (2026-10-22 승인, 5단계), [제목 표시줄·사이드바 접기·뒤로/앞으로](../../archive/plans/main-page-titlebar-plan.md) (2026-10-22 승인, T1~T3)
- 테스트 문서 (r1, 홈 개편 수정1): AI [../tests/r1/](../tests/r1/), 사용자 [../../human/tests/r1-user-test.md](../../human/tests/r1-user-test.md). 이전 1·2차는 [../../index.md](../../index.md)의 "보관 문서"
- 진행 기록: [../logs/index.md](../logs/index.md)
