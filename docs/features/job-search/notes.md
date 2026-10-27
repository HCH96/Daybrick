# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-27

## 완료
- 1단계: 페이지 틀과 탭 (자동 진행, 최종 테스트 대기)
- 2단계: 서버 구조 3번과 자동 생성 비밀값 (자동 진행, 최종 테스트 대기)
- 3단계: AI 호출 모듈과 설정 탭 (한도·기준 잔액·단가) (자동 진행, 최종 테스트 대기)
- 4단계: 프로필 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 5단계: 규칙 실행기와 수집 함수 (기본 어댑터) (`_shared/adapter.ts`·`dedupe.ts`·`notify.ts`, `js-collect run`, 기본 어댑터와 `js_ensure_defaults()`)
- 관련 결정: D1–D16, D22–D29 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 시작 전 확인(게임잡·넥슨 접근, 약관·robots, deno-dom)이 step 파일에 있다. 넥슨에 공개 경로가 없으면 사용자에게 물어야 하므로 "멈춤"으로 돌려준다. `js-collect`는 AI를 부르지 않으니 `files`에 `PROMPTS`·`AI`는 넣지 않아도 된다 (`CORS`·`AUTH`는 넣는다). Deno가 없어 서버 함수 타입 검사는 못 한다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-05.md
- ai/spec/req-sources.md
- ai/spec/req-collect.md
- ai/logs/L08.md
- ai/plan/structure.md의 "1. 파일 목록" 서버 표와 "3. 어댑터 규칙 형식 v1" 절
