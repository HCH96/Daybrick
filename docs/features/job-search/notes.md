# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-29

## 완료
- 이전 계획 15단계 + AI 테스트 r1 통과, 사용자 테스트 r1 진행 중 (archive/plan-initial/, 이후 수정 L20–L32)
- 수정 계획: 수정1 7단계 (승인, L34)
- 1단계: 서버 구조 7번 (칸·stage·백업·SQL 함수) (자동 진행, 최종 테스트 대기)
- 2단계: 수집 사이트 자사 여부 (자동 진행, 최종 테스트 대기)
- 3단계: 정리 규칙·중복 판정 함수 (자동 진행, 최종 테스트 대기)
- 4단계: 수집 단계에서 묶기 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 5단계: 처리 단계 중복 확인·소급 적용 (새 `js-process/dedupe.ts`로 추출 뒤·2차 필터 전 중복 확인, 서버 업데이트 뒤 1회 소급 묶기)
- 수정 계획: 근거 기록 L33, 커밋 접두어 "구직 관리 수정1"
- 관련 결정: D17, D31, D35, D37, D43, D52, D53, D54, D55, D56, D57, D58, D59, D60 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `_shared/dedupe.ts`(`isSameJob`·`pickRep`·`cleanTitle`·`normKey`)는 가져다 쓰기만 한다(export만 grep). 대표 바꾸기는 `js_switch_rep(p_user, p_old, p_new)` rpc — 사용 예는 `js-collect/index.ts`의 `saveNew` 끝부분을 grep. 실제 서버 확인(SQL)은 /test로 넘기고 build로만 확인.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-05.md
- ai/spec/req-dedupe.md (R83–R89), ai/spec/req-analysis.md (R41, R47, R53)
- ai/logs/L38.md
- ai/plan/structure.md의 `js-process/` 줄·`migrations.rs` 줄과 2절(칸·stage) 부분
