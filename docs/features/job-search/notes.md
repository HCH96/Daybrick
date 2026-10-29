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
- 6단계: 목록·카드에 출처 표시 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 7단계: 상세 팝업 출처·따로 보기 (`PostingDetail.sources`, 새 `PopupSources`의 출처 줄·↗ 링크·[따로 보기], `bundleApi.ts`에 `unbundlePosting`)
- 수정 계획: 근거 기록 L33, 커밋 접두어 "구직 관리 수정1"
- 관련 결정: D38, D39, D40, D53, D54, D57, D58, D61, D62 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `loadBundleSources`·`BundleSource`는 6단계에 만들었다(`features/job-search/bundleApi.ts`·`types.ts`). `unbundlePosting`은 같은 파일에 더한다. 출처 줄 `SourceNames`(recommend/)는 팝업에 쓰지 않는다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-07.md
- ai/spec/req-recommend.md (R92, R93)
- ai/logs/L40.md
- human/mockups/popup.html의 popup-head 구역, popup-warn.html의 popup-warn-alert 아래 머리 (CSS: popup.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 1절 "앱" 표 중 7단계 줄 (새 파일 위치)
