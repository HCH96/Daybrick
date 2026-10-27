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
- 10단계: 추천 공고 탭 (자동 진행, 최종 테스트 대기)
- 11단계: 상세 팝업·걸러진 공고·보관함 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 12단계: 지원하기·일정 제안 (지원 관리 수정) (팝업 [지원하기] → 서버 지원 건·로컬 카드·`applied_at`, 일정 제안 창, 카드 상태 → 서버 동기화)
- 관련 결정: D1, D2, D11, D14, D20, D21, D22, D26, D27, D36, D37, D38, D39 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: [지원하기]는 `PostingPopup`에서 `PopupFoot`에 `onApply`를 넘기면 풀린다(점수 있는 공고만 `mode = scored`). 카드에 쓸 추출 항목·요약은 팝업의 `PostingDetail`(`fields`·`score.summary`·`url`)에 이미 있다. 지원 뒤에는 `onChanged()`로 추천 목록을 다시 읽고 팝업을 닫는다. 일정 날짜 글자는 `postingFormat.ts`의 `dateTime`·`scheduleLine`을 같이 쓸 수 있다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-12.md
- ai/spec/req-apply.md (R54–R59)
- ai/logs/L15.md
- human/mockups/part-schedule.html의 apply-schedule-done·apply-schedule-list·apply-schedule-vague 구역 (CSS: popup.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 buildCard.ts·statusSync.ts·popup/ScheduleSuggestDialog.tsx·applications 수정 줄 (새 파일 위치를 정할 때만)
