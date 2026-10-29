# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-30

## 완료
- 이전 계획: 처음 계획 15단계 + AI 테스트 r1 (archive/plan-initial/), 수정1 7단계 + AI 테스트 r2 (archive/plan-dedupe/), 사용자 테스트 r2는 수정2 뒤 함께
- 수정2 명세 승인 (L44), 수정 계획 2 승인 (L45)
- 1단계: 서버 구조 8번 (표·칸·필터 종류·백업·예약) (자동 진행, 최종 테스트 대기)
- 2단계: 흐름 줄·카드 표시 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 3단계: 직군 추출·직군 필터 (추출 `family`, 서버 필터 `title-nondev`·`dev-only`, 필터 탭 두 줄, 팝업 "직군" 줄)
- 수정 계획: 근거 기록 L44, 커밋 접두어 "구직 관리 수정2"
- 관련 결정: D10, D27, D35, D36, D45, D64, D65, D66, D67, D68, D69, D70, D74, D78 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 1단계에서 `filterRules.ts FIXED_KINDS`에 `title-nondev`를 넣어 두었다(D78). 3단계에서 `title-nondev`를 `KIND_INFO`·`FIRST_KINDS`로 옮길 때 `FIXED_KINDS`·`AddableKind`에서 빼고, `isAddableKind`를 쓰는 곳(`grep -rn isAddableKind`)을 함께 본다. `postingFormat.ts hitLabel`의 임시 글자(D78)를 step-03 글자로 바꾼다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-03.md
- ai/spec/req-analysis.md (R46–R48, R96–R98, R101)
- ai/logs/L47.md, ai/logs/L46.md (1단계에서 넣은 임시 처리)
- human/mockups/filters.html의 filters-first·filters-second 구역, popup.html의 popup-fields 구역, filtered.html의 filtered-rows 구역 (CSS: common.css·manage.css·popup.css·recommend.css에서 클래스 검색)
