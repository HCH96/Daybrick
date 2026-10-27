# 알림 (notifications)
앱 전체가 함께 쓰는 알림 센터. 제목 표시줄 종 아이콘과 빨간 숫자 배지, 화면 이동 없이 펼쳐지는 목록, 체크로 확인, 서버 알림 받기.

- 상태: 수정 구현 중 (1/2단계 완료)
- 작업 노트: [notes.md](notes.md)
- 선행 기능: server-setup (서버 알림만)
- 이 기능을 먼저 쓰는 기능: job-search

## 문서 색인 (필요한 색인만 열고, 거기서 필요한 파일만 읽기)
| 종류 | 색인 | 내용 |
|---|---|---|
| 명세서 | [ai/spec/index.md](ai/spec/index.md) | 요구사항 묶음별 파일(R1–R36), 다른 기능이 알림 보내는 법, 데이터, 범위, 결정 사항(D1–D18) |
| 구현 계획 | [ai/plan/index.md](ai/plan/index.md) | 수정1: 2단계 (같은 시각 정렬, 안 읽음 탭 바로 빼기) (2026-10-27 승인) |
| 진행 기록 | [ai/logs/index.md](ai/logs/index.md) | 기록 목차, 항목별 파일 L01~ |
| 목업 | [human/mockups/index.html](human/mockups/index.html) | 화면별 목업 (목차 주석에 화면 파일·부분 ID) |
| AI 테스트 | [ai/tests/r1/](ai/tests/r1/) | r1 AI 테스트 보고서 (A1–A19) |
| 사용자 테스트 | [human/tests/r1-user-test.md](human/tests/r1-user-test.md) | r1 사용자 체크리스트 (34항목) · 빠른 판 [r1-user-test-quick.md](human/tests/r1-user-test-quick.md) (주요 12항목) |

## 보관 문서 (평소 읽지 않음)
| 문서 | 내용 |
|---|---|
| [archive/plan-initial/](archive/plan-initial/index.md) | 처음 구현 계획 8단계 (2026-10-26 승인, 구현·r1 테스트 완료) |
