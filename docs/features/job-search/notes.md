# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-30

## 완료
- 이전 계획: 처음 계획 15단계 + AI 테스트 r1 (archive/plan-initial/), 수정1 7단계 + AI 테스트 r2 (archive/plan-dedupe/), 사용자 테스트 r2는 수정2 뒤 함께
- 수정2 명세 승인 (L44), 수정 계획 2 승인 (L45)
- 1단계: 서버 구조 8번 (표·칸·필터 종류·백업·예약) (자동 진행, 최종 테스트 대기)

## 다음 진행
- 2단계: 흐름 줄·카드 표시 (흐름 줄 단계 목록·묶음 칩, 카드 "new" 칩, 목록 출처 줄 빼기·SourceNames 삭제)
- 수정 계획: 근거 기록 L44, 커밋 접두어 "구직 관리 수정2"
- 관련 결정: D35, D38, D39, D58, D62, D78 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `filterRules.ts`는 1단계에서 `FIXED_KINDS`를 더했다(D78). `FlowCounts`를 고칠 때 그 부분은 그대로 둔다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-02.md
- ai/spec/req-analysis.md의 처리 흐름 줄 구역 (R94–R95), ai/spec/req-recommend.md (R8, R91)
- ai/logs/L46.md
- human/mockups/filters.html의 filters-flow 구역, recommend.html의 recommend-cards 구역, filtered.html의 filtered-rows 구역, archived.html의 archived-rows 구역 (CSS: manage.css·recommend.css·common.css에서 클래스 검색)
