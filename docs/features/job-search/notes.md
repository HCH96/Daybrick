# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-30

## 완료
- 이전 계획: 처음 계획 15단계 + AI 테스트 r1 (archive/plan-initial/), 수정1 7단계 + AI 테스트 r2 (archive/plan-dedupe/), 사용자 테스트 r2는 수정2 뒤 함께
- 수정2 명세 승인 (L44), 수정 계획 2 승인 (L45)
- 1단계: 서버 구조 8번 (표·칸·필터 종류·백업·예약) (자동 진행, 최종 테스트 대기)
- 2단계: 흐름 줄·카드 표시 (자동 진행, 최종 테스트 대기)
- 3단계: 직군 추출·직군 필터 (자동 진행, 최종 테스트 대기)
- 4단계: 일괄 맡기기 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 5단계: 일괄 결과 받기·채점 맡기기 (새 `js-process/batchResult.ts` `pollBatches`, `index.ts` batch 모드 앞에 붙이기, 새 추천 알림)
- 수정 계획: 근거 기록 L44, 커밋 접두어 "구직 관리 수정2"
- 관련 결정: D23, D25, D26, D27, D36, D37, D43, D45, D47, D49, D53, D54, D57, D61, D64, D70, D71, D72, D73, D74, D80 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 추출 결과 저장 뒤 흐름은 `js-process/batch.ts`의 `routeExtracted(ctx, p, ex)`를 그대로 쓴다. 저장은 `steps.ts`의 `saveExtraction(ctx, p, data)`·`saveScore(ctx, p, data, profileVersion)`, 결과 JSON은 `ai.ts`의 `readResult({task, model}, message)`, 비용 기록은 `recordBatchCall`, 내용 거절 판정은 `contentRejection`, 크레딧은 `isCreditError`·`noticeCredit(caller)`. `_shared/batch.ts`는 `getBatch(id)`(`status`·`counts`·`resultsUrl`)·`readResults(url, onLine, deadline)`(`done|time|stopped|{reason}`)·`isBatchFailure`. `anthropic_id`가 비어 있는 submitted 행은 맡기기가 끊긴 것(D80)이라 정리해야 한다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-05.md
- ai/spec/req-batch.md (R103, R104, R108), ai/spec/req-usage.md (R74), ai/spec/req-analysis.md (R41)
- ai/logs/L49.md
- ai/plan/structure.md의 `js-process/batchResult.ts` 줄 (새 파일 위치를 정할 때만)
