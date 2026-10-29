# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-29

## 완료
- 이전 계획 15단계 + AI 테스트 r1 통과, 사용자 테스트 r1 진행 중 (archive/plan-initial/, 이후 수정 L20–L32)
- 수정 계획: 수정1 7단계 (승인, L34)
- 1단계: 서버 구조 7번 (칸·stage·백업·SQL 함수) (자동 진행, 최종 테스트 대기)
- 2단계: 수집 사이트 자사 여부 (자동 진행, 최종 테스트 대기)
- 3단계: 정리 규칙·중복 판정 함수 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 4단계: 수집 단계에서 묶기 (`js-collect/index.ts`의 saveNew가 다른 사이트 일치 공고를 duplicate로 넣고 자사면 대표 바꾸기, 원문 받기는 duplicate 제외)
- 수정 계획: 근거 기록 L33, 커밋 접두어 "구직 관리 수정1"
- 관련 결정: D31, D43, D52, D53, D54, D55, D57, D58, D59 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `_shared/dedupe.ts`는 가져다 쓰기만 한다(export만 grep). 대표 고르기는 `pickRep`, 사이트 자사 여부는 `js_sites.own_site`. 실제 서버 확인(SQL)은 /test로 넘기고 이 단계는 build로만 확인.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-04.md
- ai/spec/req-collect.md (R35, R82), ai/spec/req-dedupe.md (R86–R88)
- ai/logs/L37.md
- ai/plan/structure.md의 `js-collect/index.ts` 줄과 2절(칸·stage) 부분
