# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-29

## 완료
- 이전 계획 15단계 + AI 테스트 r1 통과, 사용자 테스트 r1 진행 중 (archive/plan-initial/, 이후 수정 L20–L32)
- 수정 계획: 수정1 7단계 (승인, L34)
- 1단계: 서버 구조 7번 (칸·stage·백업·SQL 함수) (자동 진행, 최종 테스트 대기)
- 2단계: 수집 사이트 자사 여부 (자동 진행, 최종 테스트 대기)
- 3단계: 정리 규칙·중복 판정 함수 (자동 진행, 최종 테스트 대기)
- 4단계: 수집 단계에서 묶기 (자동 진행, 최종 테스트 대기)
- 5단계: 처리 단계 중복 확인·소급 적용 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 6단계: 목록·카드에 출처 표시 (새 `bundleApi.ts`의 `loadBundleSources`, 보관함에서 duplicate 빼기, 카드·행에 `SourceNames` 한 줄)
- 수정 계획: 근거 기록 L33, 커밋 접두어 "구직 관리 수정1"
- 관련 결정: D38, D39, D47, D53, D54, D57, D58, D61 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 앱 타입 `BundleSource`는 1단계에서 `types.ts`에 이미 넣었는지 grep으로 먼저 확인. 나눠 읽기는 `features/job-search/api.ts`의 방식을 grep으로만 보고 따른다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-06.md
- ai/spec/req-recommend.md (R91, R4, R7, R9, R15–R16)
- ai/logs/L39.md
- human/mockups/recommend.html의 recommend-cards 구역, filtered.html의 filtered-rows 구역, archived.html의 archived-rows 구역 (CSS: recommend.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 1절 "앱" 표 중 6단계 줄 (새 파일 위치)
