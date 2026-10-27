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
- 8단계: 필터 탭 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 9단계: 처리 함수 (필터·추출·채점) (`js-process`가 공고를 몇 개씩 1차 필터 → Haiku 추출·인젝션 검사 → 2차 필터 → Opus 채점으로 넘김)
- 관련 결정: D1–D17, D22–D35 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 필터는 `_shared/filters.ts`의 `applyFirst`·`applySecond`를 그대로 쓰고, 추출 결과를 `ExtractionForFilter`(`skills`·`minYears`·`employment[]`)로, 저장된 프로필 기술스택을 `{ skills: 이름[] }`로 바꿔 넘긴다. 걸리면 `hits`를 `filtered_by`에 넣는다. `filters.ts`를 `migrations.rs`의 `js-process` `files`에 넣는다. 추출 스키마에 경력 연수(숫자로 쓸 최소 연수)와 고용 형태 목록을 꼭 둔다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-09.md
- ai/spec/req-analysis.md
- ai/spec/req-usage.md (R74, R78)
- ai/spec/ai-rules.md
- ai/logs/L12.md
- ai/logs/L09.md (`js-collect` 구조·`migrations.rs` 함수 묶음 방식 참고)
- ai/plan/structure.md의 "2. 데이터 모양" 절 (`js_postings`·`js_extractions`·`js_scores` 줄)
