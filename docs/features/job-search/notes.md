# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-27

## 완료
- 1단계: 페이지 틀과 탭 (자동 진행, 최종 테스트 대기)
- 2단계: 서버 구조 3번과 자동 생성 비밀값 (자동 진행, 최종 테스트 대기)
- 3단계: AI 호출 모듈과 설정 탭 (한도·기준 잔액·단가) (자동 진행, 최종 테스트 대기)

## 다음 진행
- 4단계: 프로필 (자료 넣기·Storage, `js-profile` 서버 함수와 `_shared/prompts.ts`, 초안 편집·버전 저장)
- 관련 결정: D1–D15, D22–D26 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `migrations.rs`에 `js-profile`을 `FUNCTIONS`에 더할 때 `files`에 `CORS`·`AUTH`·`AI`(+ prompts)를 넣고 `AUTH`·`AI`의 `#[allow(dead_code)]`를 지운다. `ai.ts`·`auth.ts`는 Deno 타입 검사를 못 했으니 배포 오류가 나면 먼저 본다. 사용액 줄을 새로 고치려면 생성 뒤 `useJobSearch().refresh()`를 부른다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-04.md
- ai/spec/req-profile.md
- ai/spec/ai-rules.md
- ai/logs/L07.md
- human/mockups/profile.html의 profile-sources·profile-editor·profile-foot 구역 (CSS: common.css·profile.css에서 클래스 검색)
- ai/plan/structure.md의 "1. 파일 목록" 서버·프론트 로직·화면 표에서 4단계 줄 (새 파일 위치를 정할 때만)
