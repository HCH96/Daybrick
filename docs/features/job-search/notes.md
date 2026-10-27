# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-27

## 완료
- 1단계: 페이지 틀과 탭 (자동 진행, 최종 테스트 대기)
- 2단계: 서버 구조 3번과 자동 생성 비밀값 (자동 진행, 최종 테스트 대기)
- 3단계: AI 호출 모듈과 설정 탭 (한도·기준 잔액·단가) (자동 진행, 최종 테스트 대기)
- 4단계: 프로필 (자동 진행, 최종 테스트 대기)
- 5단계: 규칙 실행기와 수집 함수 (기본 어댑터) (자동 진행, 최종 테스트 대기)
- 6단계: 수집 사이트 탭 (자동 진행, 최종 테스트 대기)
- 7단계: 사이트 추가·시험 수집·어댑터 가이드 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 8단계: 필터 탭 (`_shared/filters.ts` 순수 함수, `js_refilter()` RPC, 처리 순서 줄과 1차·2차 필터 판)
- 관련 결정: D1–D16, D22–D34 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 필터 탭은 `pages/job-search/tabs.ts`의 탭 id로 `JobSearchPage`의 `TabPlaceholder`를 바꾼다 (D22). 칩·표·스위치 모양은 `sources/SourcesTab.css`의 `js-sources__chip`·`js-sources__switch` 클래스를 참고하되, 새 탭 css에 같은 값으로 따로 둬도 된다. 순수 함수 확인 스크립트는 저장소 밖 임시 폴더에서 node로 돌린다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-08.md
- ai/spec/req-analysis.md
- ai/logs/L11.md
- human/mockups/filters.html의 filters-flow·filters-first·filters-second 구역 (CSS: common.css·manage.css에서 클래스 검색)
- ai/plan/structure.md의 "2. 데이터 모양" 절 (`js_postings.stage`·`js_filters` 줄)
- supabase/migrations/0003_job_search.sql의 `js_filters` 테이블 정의 줄 (grep으로만)
