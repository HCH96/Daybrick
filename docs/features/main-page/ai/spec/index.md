# 메인 페이지 (main-page) 명세서 색인

## 기능 개요
앱을 켰을 때 처음 보이는 화면. 제목 표시줄·사이드바로 각 기능 화면을 오가고, 홈에 오늘 할 일·일정·지원 현황·집중 시간 요약을 모아 보여준다.
이번 작업에서는 **실제 기능을 만들지 않는다.** 각 기능 자리는 빈 상태로 두고, 나중에 기능을 끼워 넣을 수 있는 구조만 만든다.
(요구사항은 2026-10-22 L32에서 R 번호 양식으로 정리. 내용은 정리 전 명세서와 같다.)

## 요구사항 (묶음 → 파일)
| 묶음 | R 범위 | 파일 |
|---|---|---|
| 앱 틀 (+ 전체 화면 구성) | R1–R4 | [req-shell.md](req-shell.md) |
| 사이드바 (메뉴 표 포함) | R5–R9 | [req-sidebar.md](req-sidebar.md) |
| 홈 상단·홈 카드 (카드 표 포함) | R10–R17 | [req-home.md](req-home.md) |
| 기능 화면·공통 (색 목록 포함) | R18–R21 | [req-common.md](req-common.md) |

## 나머지 파일
| 파일 | 내용 |
|---|---|
| [data.md](data.md) | 다룰 데이터 (사이드바 접힘, 방문 기록) |
| [scope.md](scope.md) | 이번 범위에서 제외하는 것, 나중에 고려할 것 |
| [extension.md](extension.md) | 확장 구조: 페이지 목록(PageDef), 대시보드 카드 목록, 화면 전환 방식. **다른 기능을 붙일 때 읽기** |
| [files.md](files.md) | 파일 구조 (2026-10-22 구현 기준) |
| [window.md](window.md) | 창 설정, 알려진 제약 |
| [done.md](done.md) | 완료 기준 |
| [mockup.md](mockup.md) | 목업 경로, 보관된 후보 목업 |
| [decisions.md](decisions.md) | 결정 사항 D1~D3 |

## 다른 문서
- 구현 계획 (모두 구현 완료, 보관): [처음 계획](../../archive/plans/main-page-plan.md) (2026-10-21 승인, 6단계), [B안 배치](../../archive/plans/main-page-layout-b-plan.md) (2026-10-22 승인, 5단계), [제목 표시줄·사이드바 접기·뒤로/앞으로](../../archive/plans/main-page-titlebar-plan.md) (2026-10-22 승인, T1~T3)
- 테스트 문서: [../../index.md](../../index.md)의 "보관 문서"
- 진행 기록: [../logs/index.md](../logs/index.md)
