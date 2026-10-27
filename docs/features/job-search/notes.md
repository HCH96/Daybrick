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
- 9단계: 처리 함수 (필터·추출·채점) (자동 진행, 최종 테스트 대기)

## 다음 진행
- 10단계: 추천 공고 탭 (채점된 공고 카드 3열·정렬·"새" 표시·이전 프로필 기준 다시 채점·수집 상태 줄)
- 관련 결정: D7, D11, D21, D22, D23, D25, D26, D27, D31, D32, D36, D37 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 카드의 경력·고용 형태·근무지·마감은 `js_extractions.fields`(D36의 `experience.text`·`employment`·`location`·`deadline.date/text`)에서, 점수·등급은 `js_scores`(`grade` id `strong|good|fair|low`)에서 읽는다. [다시 채점]은 `js-process` `{ mode: "rescore" }`(D37, 응답 `remaining`이 0이 될 때까지 다시 부를지 정한다). "채점 대기 N개"는 `stage = 'waiting'` 공고 수.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-10.md
- ai/spec/req-recommend.md (R4–R8), ai/spec/req-profile.md (R23), ai/spec/req-usage.md (R75)
- ai/spec/mockup.md의 "점수 색"·"마감 표시" 줄 (grep으로 그 줄만)
- ai/logs/L13.md
- human/mockups/recommend.html의 recommend-status·recommend-toolbar·recommend-cards 구역 (CSS: recommend.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 recommend/ 줄과 "2. 데이터 모양" 절의 job-search.json 부분 (새 파일 위치를 정할 때만)
