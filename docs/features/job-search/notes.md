# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-29

## 완료
- 이전 계획 15단계 + AI 테스트 r1 통과, 사용자 테스트 r1 진행 중 (archive/plan-initial/, 이후 수정 L20–L32)
- 수정 계획: 수정1 7단계 (승인, L34)
- 1단계: 서버 구조 7번 (칸·stage·백업·SQL 함수) (자동 진행, 최종 테스트 대기)
- 2단계: 수집 사이트 자사 여부 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 3단계: 정리 규칙·중복 판정 함수 (`_shared/dedupe.ts`에 cleanTitle·normKey·isSameJob·pickRep 등 순수 함수, Node로 결과 표 확인)
- 수정 계획: 근거 기록 L33, 커밋 접두어 "구직 관리 수정1"
- 관련 결정: D31, D52, D53, D54, D55, D57 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `js-collect/index.ts`가 쓰는 `normKey`·`extId`의 이름·인자는 바꾸지 않는다(4단계 전에도 수집이 돌아야 함). deno가 없어 Node 타입 제거 실행으로만 확인.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-03.md
- ai/spec/req-collect.md (R35), ai/spec/req-dedupe.md (R84, R86)
- ai/logs/L36.md
- ai/plan/structure.md의 `functions/_shared/dedupe.ts` 줄
