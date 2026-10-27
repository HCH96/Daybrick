# r1 공통: 빌드·서버 타입·SQL·공유 웹·비밀값 (A1–A5)

## A1 빌드·타입 검사·Rust
- 테스트 내용: 프론트 빌드, 타입 검사, Rust 컴파일
- 근거 요구사항: 전체
- 수행 방법: apps/desktop에서 `npm run build`, `npx tsc --noEmit`, src-tauri에서 `cargo check`
- 예상 결과: 모두 성공
- 실제 결과: build 종료 코드 0 (455 모듈, 청크 500kB 넘음 경고만), tsc 0, cargo check 0
- 판정: 통과

## A2 서버 함수 4개 타입 검사
- 테스트 내용: js-profile·js-collect·js-process·js-gmail와 _shared 전체를 strict로 타입 검사
- 근거 요구사항: R25, R72
- 수행 방법: 임시 폴더에 Deno 대용 선언(`Deno.env.get`·`Deno.serve`, deno-dom은 DOM 타입, `@std/encoding/base64`)과 tsconfig(strict, `allowImportingTsExtensions`, `jsr:@supabase/supabase-js@2` → 앱 node_modules의 supabase-js 경로)를 만들고 `tsc -p`. `--noImplicitAny --noUnusedLocals`도 한 번 더
- 예상 결과: 오류 없음
- 실제 결과: 19개 서버 파일 검사, 오류 0 (supabase-js 실제 타입으로 해석됨을 `--listFiles`로 확인)
- 판정: 통과

## A3 SQL 0003–0005
- 테스트 내용: js_ 테이블 RLS, 비공개 버킷, 0005 중복 정리·고유 색인·잠금, 0003 그대로
- 근거 요구사항: data.md, R26–R27, L20
- 수행 방법: 0003·0004·0005 전체 읽기. 글자 비교 스크립트(t3-sql): `$rule$…$rule$` 추출 비교, adapters/*.json과 JSON 비교, 테이블 목록과 RLS 목록 대조. `git log`로 0003 변경 이력 확인
- 예상 결과: 모두 있음, 0005 규칙 문자열이 0003과 같음
- 실제 결과:
  - 0003이 만든 16개 테이블 모두 RLS 켬·anon 권한 회수. 본인 행 정책은 14개, `js_ai_calls`는 읽기 정책만(쓰기 회수), `js_gmail_tokens`는 정책 없음+authenticated 권한 회수. `to anon` 정책 없음
  - 버킷 `job-search` public=false, 저장소 정책은 본인 폴더(`<user_id>/…`)만
  - 0005: 사이트 옮김 → 중복 어댑터 삭제 → 중복 사이트 삭제(공고·수집 기록 있는 사이트 제외), `js_adapters_builtin_name_uq (user_id, name) where builtin`, `pg_advisory_xact_lock`, `on conflict … do nothing`
  - 규칙 문자열 2개와 기본값 블록 전체가 0003과 글자 그대로 같고, adapters/*.json과도 같음
  - 0003은 마지막 수정 커밋(811815c)에서 바뀌지 않음, migrations.rs에 0005 포함
- 판정: 통과

## A4 공유 웹이 js_ 데이터를 읽지 않음
- 테스트 내용: apps/web 코드에 구직 관리 테이블·함수 참조가 없는지
- 근거 요구사항: R3
- 수행 방법: `grep -rn "js_|job-search|js-collect|js-process|js-gmail" apps/web` (node_modules 제외)
- 예상 결과: 참조 없음
- 실제 결과: 걸린 파일 없음. 0003에 anon 정책도 없어 공개 키로는 읽을 수 없음
- 판정: 통과

## A5 비밀값
- 테스트 내용: 코드에 비밀값 없음, 키·토큰이 문구·기록에 안 들어감, 앱에 Gmail 토큰 저장 안 함
- 근거 요구사항: R62
- 수행 방법: `git grep`으로 `sk-ant-`·`eyJ…`·`AIza`·`GOCSPX-`·`sbp_`·`ghp_` 모양 검색, 추적 중인 .env 확인. 서버·앱 job-search의 console 출력 확인. gmailConnect.ts·gmailApi.ts·supabaseClient.ts 읽기. t2-flow에서 모든 알림 글에 키·토큰 문자열이 없는지 검사
- 예상 결과: 위반 없음
- 실제 결과: 걸린 것은 입력 칸 안내 글자(`GOCSPX-…`)와 문서 속 예시뿐. 추적 중인 .env 없음. console 출력은 고정 문구·알림 종류·오류 종류만. Gmail 갱신 토큰은 메모리 저장소(`createMemoryStorage`)의 임시 PKCE 클라이언트에서 받아 바로 `js-gmail`로 넘기고 로그아웃, 파일·자격 증명 관리자에 쓰지 않음. 서버는 암호문만 저장(A35). 알림 글에 키·토큰 없음
- 판정: 통과
