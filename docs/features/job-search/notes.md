# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-27

## 완료
- 1단계: 페이지 틀과 탭 (자동 진행, 최종 테스트 대기)
- 2단계: 서버 구조 3번과 자동 생성 비밀값 (자동 진행, 최종 테스트 대기)
- 3단계: AI 호출 모듈과 설정 탭 (한도·기준 잔액·단가) (자동 진행, 최종 테스트 대기)
- 4단계: 프로필 (자동 진행, 최종 테스트 대기)
- 5단계: 규칙 실행기와 수집 함수 (기본 어댑터) (자동 진행, 최종 테스트 대기)

## 다음 진행
- 6단계: 수집 사이트 탭 (사이트 표·켜기/끄기·삭제, [지금 수집], 어댑터 카드)
- 관련 결정: D1–D16, D22–D31 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 앱이 기본 사이트를 넣는 곳이 아직 없다. 수집 사이트 탭을 열 때 `js_ensure_defaults()`를 먼저 부르고(`js_ensure_settings`를 부르는 방식과 같게) 표를 읽는다. [지금 수집]의 "새 공고 N개"는 응답 `sites[].added`의 합이고, `pending`이 남으면 "원문 N개는 다음 수집 때 받아요" 같은 안내를 붙여도 된다. 수집은 최대 2분쯤 걸린다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-06.md
- ai/spec/req-sources.md
- ai/spec/req-collect.md
- ai/logs/L09.md
- human/mockups/sources.html의 sources-bar·sources-table·sources-adapters 구역 (CSS: common.css·manage.css에서 클래스 검색)
- ai/plan/structure.md의 "1. 파일 목록" 화면 표와 "4. 컴포넌트 구조" 절 (sources/ 줄)
