# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-30

## 완료
- 이전 계획: 처음 계획 15단계 + AI 테스트 r1 (archive/plan-initial/), 수정1 7단계 + AI 테스트 r2 (archive/plan-dedupe/), 사용자 테스트 r2는 수정2 뒤 함께
- 수정2 명세 승인 (L44), 수정 계획 2 승인 (L45)
- 1단계: 서버 구조 8번 (표·칸·필터 종류·백업·예약) (자동 진행, 최종 테스트 대기)
- 2단계: 흐름 줄·카드 표시 (자동 진행, 최종 테스트 대기)
- 3단계: 직군 추출·직군 필터 (자동 진행, 최종 테스트 대기)
- 4단계: 일괄 맡기기 (자동 진행, 최종 테스트 대기)
- 5단계: 일괄 결과 받기·채점 맡기기 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 6단계: 예약 실행·[지금 평가]·상태 줄 (앱이 `js-process batch`를 부르고, 진행 중 일괄을 상태 줄에 보이며 버튼을 끔, 오늘 호출 수에서 일괄 제외)
- 수정 계획: 근거 기록 L44, 커밋 접두어 "구직 관리 수정2"
- 관련 결정: D21, D25, D26, D38, D43, D46, D64, D68, D70, D71, D72, D80, D81 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 서버 batch 응답은 `{ ok, saved: { extract, score }, submitted: { extract, score }, held, inFlight: BatchState[], stopped }` (`js-process/index.ts` `runBatch`). `BatchState { kind, count, submittedAt }`이고 kind에 `family`도 올 수 있다. 진행 중 일괄은 `js_batches.status = 'submitted'`.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-06.md
- ai/spec/req-batch.md (R105, R106), ai/spec/req-collect.md (R40), ai/spec/req-usage.md (R73, R75), ai/spec/req-recommend.md (R7)
- ai/logs/L50.md
- human/mockups/recommend.html의 recommend-status 구역, sources.html의 sources-bar 구역 (CSS: recommend.css·manage.css·common.css에서 클래스 검색)
