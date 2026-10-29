# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-29

## 완료
- 이전 계획 15단계 + AI 테스트 r1 통과, 사용자 테스트 r1 진행 중 (archive/plan-initial/, 이후 수정 L20–L32)
- 수정 계획: 수정1 7단계 (승인, L34)

## 다음 진행
- 1단계: 서버 구조 7번 (칸·stage·백업·SQL 함수) (0007에 자사·묶음 칸, duplicate 단계, 백업 표, js_switch_rep·js_unbundle, js_ensure_defaults·js_cron_continue 다시 만들기)
- 수정 계획: 근거 기록 L33, 커밋 접두어 "구직 관리 수정1"
- 관련 결정: D14, D19, D24, D44, D54, D56, D57 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 백업 표는 칸을 바꾸기 전에 만들고, 표가 없을 때만 채운다(서버 업데이트를 다시 해도 덮지 않음).

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-01.md
- ai/plan/structure.md (2절 데이터 모양)
- ai/spec/data.md
- ai/spec/req-dedupe.md
- ai/logs/L34.md
