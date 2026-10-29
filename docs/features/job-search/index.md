# 구직 관리 (job-search)
채용 사이트 공고를 서버가 주 1회 모아 AI로 채점·추천하고, 지원 관리 연결과 Gmail 상태 제안까지 이어 주는 기능.

- 상태: 수정 구현 중 (1/10 단계 완료) — 수정2 (수정1 사용자 테스트 r2는 수정2 뒤 함께)
- 작업 노트: [notes.md](notes.md)
- 선행 기능: server-setup, notifications (별도 명세 필요)

## 문서 색인 (필요한 색인만 열고, 거기서 필요한 파일만 읽기)
| 종류 | 색인 | 내용 |
|---|---|---|
| 명세서 | [ai/spec/index.md](ai/spec/index.md) | 요구사항 묶음별 파일(R1–R115), AI 규칙, 데이터, 범위, 결정 사항(D1–D77) |
| 구현 계획 | [ai/plan/index.md](ai/plan/index.md) | 수정 계획 2: 직군 거르기·일괄 처리·묶기 확장 10단계, step 파일, 파일 목록·데이터 모양 (2026-10-30 승인) |
| 진행 기록 | [ai/logs/index.md](ai/logs/index.md) | 기록 목차, 항목별 파일 L01~ |
| 목업 | [human/mockups/index.html](human/mockups/index.html) | 화면 15개, 화면별 파일 (목차는 index.html 맨 앞 주석) |
| AI 테스트 | [ai/tests/r2/](ai/tests/r2/) | r2 보고서 (2026-10-29, 수정1) |
| 사용자 테스트 | [human/tests/r2-user-test.md](human/tests/r2-user-test.md) | r2 체크리스트, 주요 기능 14개 (r1 7–16번 다시 포함) |

## 보관 문서 (평소 읽지 않음)
| 문서 | 내용 |
|---|---|
| [archive/plan-initial/](archive/plan-initial/index.md) | 처음 구현 계획 15단계 + 규칙 확장 수정 계획 fix-rule-ext.md (2026-10-27 승인, 구현·AI 테스트 r1 완료) |
| [archive/plan-dedupe/](archive/plan-dedupe/index.md) | 수정 계획 1: 중복 공고 묶기 7단계 (2026-10-29 승인, 구현·AI 테스트 r2 완료) |
| [archive/tests/](archive/tests/) | 테스트 r1: AI 보고서 r1/ (통과), 사용자 체크리스트 r1-user-test.md (7번 실패, 8–16번 미확인 → r2에서 다시) |
