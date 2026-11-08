# 메인 페이지 (main-page)
앱을 켰을 때 처음 보이는 화면. 제목 표시줄·사이드바·홈 대시보드(앞으로 일주일·앱 전체 요약).

- 상태: 수정 구현 중 (2/5단계 완료). 홈 다듬기 수정2 (L50). 이전 수정1은 r1 AI 테스트 통과 (20개), 사용자 테스트 대기. 앱 틀·사이드바는 완료 (2차 AI·사용자 테스트 통과)
- 작업 노트: [notes.md](notes.md) (이어서 작업할 때 먼저 읽기)
- 다른 기능을 붙일 때 주로 읽을 파일: [ai/spec/extension.md](ai/spec/extension.md) (확장 구조), [ai/spec/files.md](ai/spec/files.md) (파일 구조)

## 문서 색인 (필요한 색인만 열고, 거기서 필요한 파일만 읽기)
| 종류 | 색인 | 내용 |
|---|---|---|
| 명세서 | [ai/spec/index.md](ai/spec/index.md) | 요구사항 묶음별 파일(R1–R47, 홈 개편 R22–R47), 확장 구조, 파일 구조, 창 설정, 완료 기준, 결정 사항(D1–D11) |
| 구현 계획 | [ai/plan/index.md](ai/plan/index.md) | 홈 다듬기 수정 계획 (2026-11-09 승인, 5단계, 커밋 접두어 "메인 페이지 수정2") |
| 진행 기록 | [ai/logs/index.md](ai/logs/index.md) | L33~ (L01~L32는 보관 파일), L34 홈 개편 명세, L35 홈 개편 목업, L36 수정 계획, L49 홈 다듬기 목업, L50 수정2 계획 |
| 목업 | [human/mockups/index.html](human/mockups/index.html) | 화면별 파일 (앱 틀, 홈 개편 2026-11-07 승인, 홈 다듬기 2026-11-09 승인, 이전 홈) |
| 테스트 (r1) | [ai/tests/r1/](ai/tests/r1/), [human/tests/r1-user-test.md](human/tests/r1-user-test.md) | 홈 개편 수정1: AI 테스트 보고서, 사용자 테스트 체크리스트 (22개) |

## 보관 문서 (archive/, 평소에는 읽지 않음)
| 종류 | 파일 |
|---|---|
| 구현 계획 (홈 개편 수정1, 구현·AI 테스트 끝) | [archive/plan-home-revamp/](archive/plan-home-revamp/index.md) (2026-11-07 승인, 8단계) |
| 구현 계획 (모두 구현 완료) | [main-page-plan.md](archive/plans/main-page-plan.md) (처음 6단계), [main-page-layout-b-plan.md](archive/plans/main-page-layout-b-plan.md) (B안 배치), [main-page-titlebar-plan.md](archive/plans/main-page-titlebar-plan.md) (제목 표시줄·사이드바 접기·뒤로/앞으로) |
| 진행 기록 | [main-page-log.md](archive/logs/main-page-log.md) (L01~L13), [main-page-log-2.md](archive/logs/main-page-log-2.md) (L14~L32). 맨 앞 기록 목차를 먼저 볼 것 |
| AI 테스트 | [main-page-ai-test.md](archive/tests/main-page-ai-test.md) (2차, 25개 통과), [main-page-ai-test-v1.md](archive/tests/main-page-ai-test-v1.md) (1차) |
| 사용자 테스트 | [main-page-user-test.md](archive/tests/main-page-user-test.md) (2차, 11 통과·1 해당 없음), [main-page-user-test-v1.md](archive/tests/main-page-user-test-v1.md) (1차) |
| 후보 목업 | [main-page-palettes.html](archive/mockups/main-page-palettes.html) (색 후보 5개), [main-page-layouts.html](archive/mockups/main-page-layouts.html) (홈 배치 A·B·C) |
