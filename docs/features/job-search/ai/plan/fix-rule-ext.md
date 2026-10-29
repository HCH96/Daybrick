# 수정 계획: 규칙 형식 v1에 칸 틀·세션 준비·여러 본문 더하기
- 작성일: 2026-10-29 · 상태: 완료 (2026-10-29, L31)
- 계기: L30. 게임사 규칙 7개 중 스마일게이트·엔씨소프트를 제대로 읽지 못하고, 펄어비스·시프트업은 회사명이 틀리고, 넷마블은 링크가 302 이동에 기댄다.
- 요구사항: R25, R29, R30 · 커밋 이름: "구직 관리 수정: …"

## 더할 기능 (모두 선택 칸, 기존 규칙은 그대로 동작)

### 1. 칸 틀 `template` (목록 칸)
- `"link": { "template": "https://careers.smilegate.com/apply/announce/view?seq={id}" }`처럼 쓴다.
- `{이름}`에는 같은 공고의 다른 칸 값과 사이트 변수(vars)가 들어간다. 틀이 없는 칸을 먼저 읽고, 틀 칸은 그다음에 채운다.
- `{이름}` 값이 비어 있으면 그 칸은 빈 값(null)이 된다. 그래서 optional·필수 판정이 지금처럼 동작한다.
- `{}`가 없는 틀은 고정 글자다. 예: `"company": { "template": "펄어비스" }`.
- 보조 칸: id·title·company·link·duty·body 말고 다른 이름의 칸(예: `regOpId`)은 틀 안에서만 쓰고 저장하지 않는다. 지금도 다른 이름의 칸은 형식 검사를 통과하므로 바뀌는 점은 설명뿐이다.
- 형식 검사: template은 빈 글자가 아닌 문자열이어야 한다. template과 sel·attr·regex·base를 함께 쓰면 오류로 본다(어느 쪽이 쓰이는지 헷갈리지 않게).

### 2. 세션 준비 `list.session`
```json
"session": { "url": "https://careers.ncsoft.com/apply/list",
  "token": { "regex": "<meta name=\"_csrf\" content=\"([^\"]+)\"", "header": "X-CSRF-TOKEN" } }
```
- 목록 첫 쪽을 받기 전에 `session.url`을 GET으로 한 번 받는다. 응답의 Set-Cookie를 모아 `Cookie` 헤더로 만들고, token이 있으면 HTML에서 정규식의 첫 괄호 값을 뽑아 `header` 이름으로 붙인다. 이 둘을 목록의 모든 쪽 요청에 붙인다.
- 상세 요청에는 붙이지 않는다. 상세는 다른 실행에서 따로 받기 때문이다. 엔씨소프트 상세는 쿠키 없이 열린다(L30에서 확인).
- 준비 요청이 실패하거나 토큰을 못 찾으면 목록 실패로 본다. 이유 예: "세션 준비 실패 (HTTP 403)", "세션 토큰을 찾지 못함".
- 형식 검사: url은 필수, token.regex는 올바른 정규식, token.header는 빈 글자가 아니어야 한다.

### 3. 여러 본문 `detail.body` 배열
- `"body": ["$.workInfo", "$.qualificationDesc", "$.abilityDesc", "$.specialDesc", "$.requirementDoc", "$.description"]`처럼 쓴다.
- 문자열 하나는 지금과 같다. 배열이면 각 경로(json) 또는 선택자(html)에서 읽은 글을 차례로 이어 붙인다. 빈 칸은 건너뛰고, 이미지는 모든 칸에서 모은다.
- JSON 본문 값에 `<`가 없고 `&lt;`가 있으면, 이스케이프된 HTML로 보고 한 번 풀어서 읽는다(스마일게이트 `description`). 따로 켜는 칸은 두지 않는다.

## 바꿀 파일
- 서버 `supabase/functions/_shared/adapter.ts`: 형식 검사, 칸 읽기(틀), readDetail(배열·이스케이프 풀기).
- 서버 `_shared/adapterSession.ts` (새 파일): 세션 준비 요청과 헤더 만들기. adapter.ts가 이미 450줄이라 나눈다.
- 앱 `features/job-search/adapterRule.ts`: 같은 형식 검사.
- 앱 `features/job-search/guideContent.ts`: 키 표·AI 프롬프트 틀·자주 나는 오류에 세 기능을 설명한다. 파일이 150줄이라 키 표를 `guideKeys.ts`로 나눈다.
- 규칙 `supabase/adapters/custom/`:
  - ncsoft: session을 넣고, regOpId 보조 칸을 둔다. link 틀은 `view?regOpId={regOpId}&jopenId={id}`, 상세 url은 `{link}`.
  - smilegate: link 틀, body 배열.
  - netmarble: link 틀 `view?anno_id={id}`.
  - pearlabyss, shiftup: company 고정 틀.
- 문서: plan/structure.md 3절, spec/decisions.md D49–D51, logs L31, PROJECT.md 한 줄.

## 확인
- 넥슨·게임잡 기본 규칙: 고치기 전·후 목록과 앞 3개 상세 결과가 글자까지 같은지 비교한다 (L29와 같은 방법).
- custom 규칙 7개를 시험 스크립트로 실행한다.
  - 엔씨소프트: 목록 약 73개와 NC AI 공고 본문까지.
  - 스마일게이트: 링크가 화면 주소이고, 본문이 여러 칸에서 들어오는지(6249 포함).
  - 넷마블: 링크가 view 주소인지.
  - 펄어비스·시프트업: 회사명.
- 형식 검사: 서버와 앱이 잘못된 template·session·body를 같은 이유로 거절하는지 본다.
- 빌드: `deno check js-collect/index.ts`, `npm run build`, `cargo check`.
- 확인하지 못하는 것: Supabase 서버에서의 실행. 사용자가 `js-collect`를 다시 올린 뒤 앱에서 사이트를 추가하고 시험 수집해야 한다.

## 이번에 하지 않는 것
- 본문 안 `data:` 이미지 받기 (넷마블 1개 공고). 처리 함수의 이미지·PDF 흐름(D47)까지 바꿔야 한다.
- 공고 0개를 실패로 보지 않는 설정 (데브시스터즈). 명세 R36 판정 규칙을 바꾸는 일이다.
- 기본 어댑터(SQL)에 게임사 추가. 지금처럼 사용자가 앱에서 추가한다.
