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
- 7단계: 기존 공고 직군 채우기·옮기기 (자동 진행, 최종 테스트 대기)
- 8단계: 같은 사이트 재등록 묶기 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 9단계: 애매한 쌍 AI 판정 (처리 단계 중복 확인에서 R113 애매한 쌍을 `js_pair_checks` 먼저 보고 Haiku 바로 호출로 묻기)
- 수정 계획: 근거 기록 L44, 커밋 접두어 "구직 관리 수정2"
- 관련 결정: D26, D31, D45, D53, D54, D55, D57, D59, D60, D61, D64, D65, D66, D67, D68, D69, D70, D71, D72, D73, D74, D77, D79, D80, D81, D82, D83 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 판정 함수가 순수 함수면 Node(`node --experimental-strip-types`)로 step 파일의 경우를 실행해 확인한다. 서버 TS 타입 검사는 저장소 밖 임시 tsconfig(jsr supabase-js → apps/desktop/node_modules 타입, deno-dom·Deno 자리 채움, `paths`만 쓰고 `baseUrl`은 빼기)로 `tsc`를 돌릴 수 있다 (L53). deno-dom 자리 채움 때문에 adapter.ts의 unknown 오류 3줄은 무시.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-09.md
- ai/spec/req-dedupe.md (R113–R115, 참고 R84)
- ai/logs/L53.md
- 목업 없음
