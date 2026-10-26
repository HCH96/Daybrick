# 서버 구조 단계 (req-migrations) — r1

## A9. 1번 SQL의 테이블·RLS·공개 RPC
- 테스트 내용: 테이블마다 `user_id`, RLS 켜짐, 본인 행 정책, 구조 기록은 읽기만, 공개 RPC가 DB를 읽음
- 근거 요구사항: R20, R34, R39, D17
- 수행 방법: supabase/migrations/0001_server_setup.sql 전체 읽음
- 예상 결과: 모두 충족
- 실제 결과
  - `daybrick_schema_versions(version, applied_at, app_version)`: 적용 기록(R20). RLS 켜짐, `authenticated`에 select만 허용, anon·authenticated의 insert·update·delete 권한 회수. 사용자 데이터가 아닌 구조 기록이라 `user_id`가 없음(R34의 "구조 기록 테이블은 읽기만" 예외에 해당)
  - `daybrick_server_state(user_id pk → auth.users, anthropic_key_registered_at)`: RLS 켜짐, select·insert·update 정책 모두 `user_id = auth.uid()`. delete 정책 없음(지울 수 없음)
  - `daybrick_schema_version()`: `security definer`, `search_path = ''`, `select max(version) from public.daybrick_schema_versions`로 테이블을 실제로 읽음. public 실행 권한 회수 뒤 anon·authenticated에만 허용
- 판정: **통과**

## A10. 단계마다 한 요청·한 묶음 적용
- 테스트 내용: `begin…번호 기록…commit` 한 요청, 서버 지금 번호 다음부터 적용, 실패 시 그 단계만 되돌아감
- 근거 요구사항: R22, R26, D16, D28
- 수행 방법: management.rs `current_schema_version`·`apply_migrations`·`run_statement` 읽음, 0001 SQL에 자체 begin/commit이 없는지 확인
- 예상 결과: 실패 시 그 단계만 되돌아가고 번호는 성공 단계까지
- 실제 결과
  - 시작 번호는 매번 서버에서 읽음(구조 테이블 없으면 0). `MIGRATIONS` 중 그보다 큰 번호만 차례로
  - 단계마다 `begin;\n<SQL>\ninsert … (version, app_version) … on conflict do nothing;\ncommit;`을 `POST /database/query` 한 번으로 보냄
  - 실패하면 `?`로 바로 멈추므로 뒤 단계는 보내지 않고, 번호는 앞서 commit된 단계까지만 남음. 다시 시도하면 서버 번호를 다시 읽어 성공한 단계를 건너뜀
- 판정: **통과**
- 참고: 관리 API가 한 요청 안의 여러 문을 하나의 연결에서 실행해 begin/commit이 의도대로 묶이는지는 실제 서버로 확인하지 않음(코드 판정)

## A11. 단계 SQL 포함과 최신 번호 기준
- 테스트 내용: `include_str!`로 포함, 최신 번호 기준이 `migrations.rs`
- 근거 요구사항: R21, R27, D15
- 수행 방법: src-tauri/src/server/migrations.rs 전체, management.ts `getAppSchemaVersion` 읽음
- 예상 결과: 새 단계는 파일 추가만으로 됨
- 실제 결과
  - `MIGRATIONS = [(1, include_str!("…/supabase/migrations/0001_server_setup.sql"))]`, 서버 함수 `health`·`ai-key-check`·`_shared/cors.ts`도 `include_str!`
  - `latest()`가 `MIGRATIONS` 마지막 번호, `latest_schema_version` 명령으로 프론트에 줌. 프론트는 이 값을 한 번 받아 기억(Tauri 밖에서만 미리보기 값 1)
  - 새 단계는 SQL 파일 추가 + `MIGRATIONS` 배열 끝에 한 줄. 파일 머리 주석에 규칙(번호 차례, 배포한 단계 수정 금지, RLS) 있음
- 판정: **통과** (엄밀히는 "파일 추가 + 배열 한 줄"이며, 나머지 코드 수정은 필요 없음)

## A20. 서버·앱 번호가 다를 때
- 테스트 내용: 낮음→업데이트 필요, 높음→서버 기능 막음, 업데이트 중 막음, 끝나면 PAT 버리고 recheck
- 근거 요구사항: R23–R25
- 수행 방법: health.ts `checkServerStatus` 실행(가짜 health 응답, onboarding.md와 같은 방법), ServerProvider.tsx `blocked`·`serverSession`, serverUpdate.ts `useServerUpdateRun`, ServerUpdateScreen.tsx `start`·`onUpdated` 읽음
- 예상 결과: 충족
- 실제 결과
  - 실행: 로그인 상태에서 서버 0 < 앱 1 → `server-update`, 서버 2 > 앱 1 → `app-update`, 같음 → `connected`. 로그인 없이 서버가 높으면 `app-update`
  - `server-update`·`app-update`면 `serverSession = null`로 서버 기능에 세션을 내주지 않음. 업데이트 중에는 상태가 recheck 전까지 `server-update`라 계속 막힘. 로컬 기능은 영향 없음
  - 업데이트 화면은 [업데이트] 직후 입력 칸 PAT를 비우고, 실행 묶음의 PAT는 완료 때 버림(실패면 다시 시도용으로 유지). 완료되면 `onUpdated = recheck`
- 판정: **통과**
- 참고: `serverSession`을 실제로 쓰는 서버 기능 화면은 아직 없음(이후 기능에서 사용). 막는 장치만 확인함
