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

## 다음 진행
- 11단계: 상세 팝업·걸러진 공고·보관함 (카드를 누르면 상세 팝업, 인젝션 경고·그래도 채점, 이미지 크게 보기, 지원 안 함·보관함 되돌리기, 걸러진 공고 목록)
- 관련 결정: D5, D11, D14, D21, D22, D26, D27, D31, D35, D36, D37, D38 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 팝업 열기는 `PostingGrid`에서 `PostingCard`에 `onOpen`을, 목록 열기는 `RecommendTab`에서 `RecommendToolbar`에 `onOpenArchived`·`onOpenFiltered`를 넘기면 단추가 풀린다(D38). 팝업에 필요한 강점·부족한 점·요약·추출 전체·원문·이미지는 `recommendApi.ts`의 `loadRecommend`가 읽지 않으니 공고 하나를 따로 읽는 함수를 같은 파일에 더한다. 지원 안 함·되돌리기·그래도 채점 뒤에는 `RecommendTab`의 `reload()`로 목록과 개수를 다시 읽는다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-11.md
- ai/spec/req-recommend.md (R9–R16), ai/spec/req-analysis.md (R46, R49)
- ai/logs/L14.md
- human/mockups/popup.html의 popup-head·popup-score·popup-reasons·popup-fields·popup-source·popup-foot 구역 (CSS: popup.css·common.css에서 클래스 검색)
- human/mockups/popup-warn.html의 popup-warn-alert·popup-warn-score·popup-warn-image·popup-warn-foot 구역 (CSS: popup.css·common.css)
- human/mockups/part-image-zoom.html의 image-zoom 구역 (CSS: popup.css·common.css)
- human/mockups/filtered.html의 filtered-head·filtered-rows 구역, archived.html의 archived-head·archived-rows 구역 (CSS: recommend.css·common.css)
- ai/plan/structure.md의 popup/ 줄 (새 파일 위치를 정할 때만)
