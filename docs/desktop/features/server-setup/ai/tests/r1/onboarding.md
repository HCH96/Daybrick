# 첫 실행·연결 마법사 (req-onboarding) — r1

순수 함수 실행은 임시 폴더에 테스트 진입 파일을 만들고, `@supabase/supabase-js`·`@tauri-apps/*`를 가짜 모듈로 바꿔 rolldown으로 묶은 뒤 `node out.mjs`로 돌렸다. 앱 최신 번호는 Tauri 밖 기본값 1이 쓰였다.

## A4. 주소 형식 검사
- 테스트 내용: `parseSupabaseUrl`에 `abc`, http://, 끝 `/`, 정상 주소
- 근거 요구사항: R4
- 수행 방법: features/server/validate.ts `parseSupabaseUrl` 실행
- 예상 결과: `abc`는 형식 오류, 정상 주소 통과
- 실제 결과: `abc`→null, `http://…supabase.co`→null, 다른 도메인→null, 끝 `/`·대문자·앞뒤 공백→`/` 뗀 주소와 ref로 정리, 정상 주소 통과 (6/6)
- 판정: **통과**

## A5. 키 종류 판정
- 테스트 내용: anon JWT, `sb_publishable_…`, `sb_secret_…`, service_role JWT, 빈 값
- 근거 요구사항: R5, L08
- 수행 방법: validate.ts `keyFormat`, probe.ts `checkKeys`, messages.ts `keysCheckMessage` 실행 (JWT는 role만 바꿔 만든 가짜 토큰)
- 예상 결과: anon·publishable 통과, secret/service_role은 "Secret 키는 넣을 수 없습니다"
- 실제 결과: anon→`anon`, publishable→`publishable`, sb_secret→`secret`, service_role JWT→`secret`, 빈 값·아무 글자→null(키 형식 오류). `checkKeys`는 secret·service_role 모두 `secret-key`를 돌려주고 문구 제목은 "Secret 키는 넣을 수 없습니다"
- 판정: **통과**

## A6. 프로젝트 id 추출·리디렉션 주소
- 테스트 내용: 주소 → ref, Google용 리디렉션 주소
- 근거 요구사항: R13, R54
- 수행 방법: `parseSupabaseUrl` 실행, wizard/RedirectUrlRow.tsx `googleRedirectUrl`(파일 안 비공개 함수) 읽고 같은 식 계산
- 예상 결과: `https://abcd.supabase.co` → `abcd`, `https://abcd.supabase.co/auth/v1/callback`
- 실제 결과
  - 20자 ref `https://abcdabcdabcdabcdabcd.supabase.co` → ref `abcdabcdabcdabcdabcd`, 리디렉션 `https://abcdabcdabcdabcdabcd.supabase.co/auth/v1/callback`
  - 예시 그대로의 4자 `abcd`는 ref 길이 규칙(10~40자)에 걸려 형식 오류(null). 실제 Supabase ref는 20자라 실사용에는 문제없다고 봄
- 판정: **통과** (추출·생성 식은 맞음. 4자 예시는 R4 형식 검사에서 거절되는 점을 참고로 남김)

## A7. 접속 결과 구분과 다음 화면 4갈래
- 테스트 내용: 형식·키·접속 불가·일시정지 구분, 서버 번호로 다음 화면 결정
- 근거 요구사항: R4, R6
- 수행 방법: probe.ts `checkKeys`·`probeServer`·`routeForSchema` 실행 (가짜 RPC 응답)
- 예상 결과: 빈 서버→자동 세팅, 같음→로그인, 낮음→로그인 후 업데이트, 높음→앱 업데이트
- 실제 결과
  - 형식: 주소 오류→`bad-url`, 키 형식→`bad-key-format`, secret→`secret-key` (서버에 묻기 전)
  - 응답: 200→`ok`, PGRST202(함수 없음)→빈 서버(`schema: null`), 401→`bad-key`, 540→`paused`, status 0→`unreachable`
  - 갈래: null→`setup`, 같음→`login`, 낮음→`login-update`, 높음→`app-update`
- 판정: **통과**
- 참고: 일시정지를 540 응답으로 본 것은 코드 주석대로 추측이고 실제 일시정지 서버로는 확인 못 함

## A22. 첫 실행 안내 조건
- 테스트 내용: 연결 정보 없음 + "나중에 하기" 안 누름일 때만 안내
- 근거 요구사항: R1, R2
- 수행 방법: App.tsx `AppScreens`, WelcomeScreen.tsx 버튼 처리, config.ts 기본값 읽음
- 예상 결과: 충족
- 실제 결과: `!config.connection && !config.welcomeDismissed`일 때만 `WelcomeScreen`. [나중에 하기]는 `welcomeDismissed: true`를 server.json에 저장, [서버 연결 시작]은 마법사를 엶. 파일이 없거나 깨지면 기본값(연결 없음, 안 닫음)
- 판정: **통과**
