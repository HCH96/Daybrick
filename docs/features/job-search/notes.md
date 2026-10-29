# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-30

## 완료
- 이전 계획: 처음 계획 15단계 + AI 테스트 r1 (archive/plan-initial/), 수정1 7단계 + AI 테스트 r2 (archive/plan-dedupe/), 사용자 테스트 r2는 수정2 뒤 함께
- 수정2 명세 승인 (L44), 수정 계획 2 승인 (L45)
- 1단계: 서버 구조 8번 (표·칸·필터 종류·백업·예약) (자동 진행, 최종 테스트 대기)
- 2단계: 흐름 줄·카드 표시 (자동 진행, 최종 테스트 대기)
- 3단계: 직군 추출·직군 필터 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 4단계: 일괄 맡기기 (`_shared/batch.ts`, `ai.ts` 요청 본문·일괄 비용, `steps.ts` 요청 만들기/결과 저장 나누기, `js-process/batch.ts` 맡기기)
- 수정 계획: 근거 기록 L44, 커밋 접두어 "구직 관리 수정2"
- 관련 결정: D23, D25, D26, D27, D36, D37, D45, D47, D64, D65, D66, D67, D68, D69, D70, D71, D72, D73, D74, D79 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 3단계에서 `EXTRACT_SCHEMA`에 `family`(required)를 더했다. 추출 요청을 일괄로 만들 때도 같은 스키마·`EXTRACT_SYSTEM`을 쓰고, 결과 저장 뒤 2차 필터는 `forFilter`(family 포함)를 그대로 쓴다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-04.md
- ai/spec/req-batch.md (R102, R106, R109, R110), ai/spec/req-usage.md (R73)
- ai/logs/L48.md
- ai/plan/structure.md의 `_shared/`·`js-process/` 줄 (새 파일 batch.ts 위치를 정할 때만)
