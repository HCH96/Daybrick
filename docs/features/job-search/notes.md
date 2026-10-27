# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-27

## 완료
- 1단계: 페이지 틀과 탭 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 2단계: 서버 구조 3번과 자동 생성 비밀값 (`js_` 테이블·비공개 버킷·`js_ensure_settings` SQL, 서버 업데이트 때 없는 비밀값만 생성)
- 관련 결정: D1–D14, D19, D22 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 화면 변경은 없다. 시작 전에 관리 API 비밀값 이름 목록·Storage 버킷 SQL 생성 가능 여부를 먼저 확인하고, 다르면 기록에 적는다. R3에 따라 공개(anon) 정책은 두지 않는다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-02.md
- ai/spec/data.md
- ai/spec/req-usage.md (R79 기본 단가)
- ai/logs/L05.md
- ai/plan/structure.md의 "2. 데이터 모양" 절과 1절의 Rust·`features/server/` 수정 줄
