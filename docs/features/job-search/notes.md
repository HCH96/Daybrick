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
- 6단계: 예약 실행·[지금 평가]·상태 줄 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 7단계: 기존 공고 직군 채우기·옮기기 (batch 맨 앞 `familyBackfill`로 직군 없는 공고를 family 일괄로 맡기고, 저장 뒤 비개발 scored 공고를 filtered2로 옮김, force는 점수 재사용)
- 수정 계획: 근거 기록 L44, 커밋 접두어 "구직 관리 수정2"
- 관련 결정: D26, D37, D39, D43, D56, D64, D65, D66, D67, D68, D69, D70, D71, D72, D73, D74, D75, D80, D81, D82 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `pollBatches`는 지금 `kind family` 행을 읽지 않는다(D81). `loadInFlight`(`js-process/batch.ts`)는 family 행도 진행 중으로 세므로 앱 상태 줄에 "직군 N개 맡김"이 이미 보인다. 월 한도 예상 비용 계산은 `batch.ts`의 `estimateCost`·`loadInFlight().estSum`을 같이 쓴다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-07.md
- ai/spec/req-analysis.md (R47, R99, R100, R101)
- ai/logs/L51.md
- human/mockups/filtered.html의 filtered-rows 구역 (CSS: recommend.css에서 클래스 검색)
- ai/plan/structure.md의 js-process/ 줄 (새 파일 familyBackfill.ts 위치 확인할 때만)
