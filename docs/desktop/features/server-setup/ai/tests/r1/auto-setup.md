# 자동 세팅 (req-auto-setup) — r1

## A13. 자동 세팅 6단계·재실행 안전·실패 단계부터 다시 시도
- 테스트 내용: 단계 순서, 있는 것 건너뜀, `uri_allow_list` 덧붙이기, 비밀값 이름, 다시 시도 시작점
- 근거 요구사항: R15–R17
- 수행 방법: features/server/setupRunner.ts 전체, src-tauri/src/server/management.rs `configure_auth`·`apply_migrations`·`deploy_functions`·`set_secrets`, supabase/migrations/0001_server_setup.sql, wizard/useWizard.ts `retryRun`·`beginRun` 읽음
- 예상 결과: 충족
- 실제 결과
  - 순서 `RUN_STEPS`: 인증 설정 → 서버 구조 적용 → 서버 함수 배포 → 비밀값 등록 → 계정 등록 → 마무리 확인 (명세 R15 표와 같음)
  - 재실행 안전: SQL은 `create table if not exists`, `drop policy if exists` 뒤 생성, `create or replace function`. 함수 배포는 같은 이름 덮어쓰기, 비밀값은 같은 이름 덮어쓰기, 번호 기록은 `on conflict do nothing`
  - `configure_auth`가 지금 `uri_allow_list`를 읽어 쉼표로 나눈 뒤 `http://127.0.0.1:*/**`가 없을 때만 덧붙임
  - 비밀값 이름 `ANTHROPIC_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (빈 값은 보내지 않음)
  - `runSteps`는 실패하면 그 단계를 `fail`로 두고 멈춤. `retryRun`은 `failure.index`부터 다시 실행하고 앞 단계의 완료 표시는 그대로 둠
- 판정: **통과**
- 참고: 관리 API 실제 호출(포트 와일드카드 허용 여부 포함)은 실행하지 않음. 코드 주석도 와일드카드는 추측이라고 적음

## A14. 비밀값을 저장·출력하지 않음
- 테스트 내용: PAT·Anthropic 키·Google 비밀값이 파일·로그·오류에 남지 않고, 취소·완료 때 비워지는지
- 근거 요구사항: R18, R36, D11
- 수행 방법
  - types.ts `ServerConfig`, config.ts 직렬화, src-tauri/src/server/config.rs 읽음
  - src-tauri/src/server/http.rs 오류 변환, management.ts `call`
  - `console.(log|error|warn|…)` 전체 grep(서버 관련 폴더), Rust `println`/`eprintln`/`log::`/`dbg!` grep
  - useWizard.ts `goDone`·`cancel`·`finish`, KeyReplaceDialog·ResumeDialog·ServerUpdateScreen의 PAT 상태 읽음
- 예상 결과: 어디에도 남지 않음
- 실제 결과
  - server.json 형태: `version`, `connection{url, anonKey, connectedAt}`, `welcomeDismissed`, `lastCheck{status, at}`만. Rust는 받은 문자열을 그대로 씀
  - Rust 오류는 `unauthorized`·`network` 같은 종류 글자만 돌려주고 `reqwest` 오류 원문은 버림. 프론트 `call`도 종류로만 바꾸고 원문을 찍지 않음
  - `console.error`에 값을 넘기는 곳은 config 읽기 실패·로그아웃 오류·상태 확인 실패·링크 열기 실패의 오류 객체뿐이고 PAT·키를 담는 곳 없음. Rust 쪽 출력 문 없음
  - 완료(`goDone`)는 주소·anon 키만 남기고 입력값 비움, 취소(`cancel`)·끝(`finish`)은 전부 비움. 재개·서버 업데이트는 요청 직후 `setPat("")`, 키 교체는 창 안 상태라 닫히면 사라짐
- 판정: **통과**
- 참고: 실패 뒤 [다시 시도]를 위해 실행 중·실패 상태에서는 메모리에 남음(명세대로)

## A23. 세팅 전 사전 확인
- 테스트 내용: Anthropic 확인이 요금 없는 호출인지, PAT 프로젝트 권한 확인, 빈 프로젝트 검사
- 근거 요구사항: R12–R14
- 수행 방법: management.ts `runSetupPrecheck`, src-tauri/src/server/anthropic.rs, management.rs `check_pat_access`·`inspect_project`, messages.ts `notEmptyConfirm` 읽음
- 예상 결과: 충족
- 실제 결과
  - Anthropic: `GET https://api.anthropic.com/v1/models?limit=1` (모델 목록 조회, 요금 없음)
  - PAT: `GET /v1/projects/<주소에서 뽑은 ref>`. 401·403·404를 종류별로 돌려줌
  - 빈 프로젝트: `daybrick_schema_versions` 유무와 `daybrick_`로 시작하지 않는 public 테이블 수를 읽고, 구조 번호 없음 + 다른 테이블 있음이면 `not-empty`(계속할지 묻는 확인 팝업)
  - 순서는 키 → PAT → 빈 프로젝트, 앞이 실패하면 뒤를 부르지 않음
- 판정: **통과**
