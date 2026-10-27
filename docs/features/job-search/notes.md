# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-27

## 완료
- 1단계: 페이지 틀과 탭 (자동 진행, 최종 테스트 대기)
- 2단계: 서버 구조 3번과 자동 생성 비밀값 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 3단계: AI 호출 모듈과 설정 탭(한도·잔액·단가) (`_shared/ai.ts`·`auth.ts`, 사용액 계산, 설정 탭 3판, 추천 탭 사용액 줄)
- 관련 결정: D1–D15, D22, D23, D24 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 설정 읽기는 `features/job-search/api.ts`의 `loadSettings`(RPC `js_ensure_settings`)가 이미 있다. 단가·한도 저장, 기준 잔액 넣기, 호출 기록 읽기 함수는 같은 파일에 더한다. `js_ai_calls`는 앱에서 넣을 수 없다(RLS 읽기만). D23의 캐시 단가 기본값이 공식 단가와 맞는지 시작 때 확인하고, 다르면 새 서버 구조 번호로 고친다 (0003은 고치지 않음).

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-03.md
- ai/spec/req-usage.md
- ai/logs/L06.md
- human/mockups/settings.html의 settings-limits·settings-balance·settings-prices 구역 (CSS: common.css·manage.css에서 클래스 검색)
- human/mockups/recommend.html의 recommend-status 구역 (CSS: common.css·recommend.css에서 클래스 검색)
- ai/plan/structure.md의 "1. 파일 목록" 서버·프론트 로직·화면 표에서 3단계 줄 (새 파일 위치를 정할 때만)
