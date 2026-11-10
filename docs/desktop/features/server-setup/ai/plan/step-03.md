# 서버 연결 3단계: ② 주소·키 확인

- 요구사항: R4–R6, R8
- 목업: wizard-keys.html (wiz-keys-form, -guide, -result)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙

## 할 일
- 시작 전에 확인(추측 검증): supabase-js가 publishable 키를 받는지, 일시정지 프로젝트 응답(상태 코드·본문), 구조 없는 서버에서 RPC를 부를 때 응답(PGRST202 예상). 결과를 진행 기록에 적는다.
- `npm install @supabase/supabase-js`.
- `validate.ts`: `https://<ref>.supabase.co` 형식 확인·`ref` 뽑기, 키 형식 두 가지(R5).
- `supabaseClient.ts`: 주소·키로 클라이언트 생성. 세션은 메모리 어댑터(6단계에서 저장 연결).
- `probe.ts`: RPC `daybrick_schema_version` 호출 → `ok(번호)` / 함수 없음 → `ok(null)` / 401 → `bad-key` / 네트워크 오류 → `unreachable` / 일시정지 응답 → `paused`.
- `messages.ts`: 원인별 제목·설명 한 줄.
- `KeysStep`: 주소·키 입력, `HelpToggle`("어디서 찾나요?" 펼침: 메뉴 경로 칩 + 작은 그림), `CheckResultLine`(성공 초록·오류 빨강·일시정지 주황·이미 세팅/업데이트 필요 보라). 버튼은 [확인] → 성공하면 [다음 →] (R4).
- `SecretInput`: ●로 가리고 눈 아이콘으로 잠깐 보기 (4단계부터 씀, 여기서 만듦).
- 다음 화면 정하기(R6): `null` → ③ 자동 세팅, 같은 번호 → 로그인(진행 표시 3번 이름 "로그인"), 낮은 번호 → 로그인 후 서버 업데이트(8단계), 높은 번호 → 앱 업데이트 안내(8단계). 6·8단계 전까지는 해당 화면 자리에 "다음 단계에서 연결" 표시.

## 확인할 결과
- `abc` 같은 주소 → 빨강 "주소 형식이 올바르지 않습니다". 맞는 주소 + 틀린 키 → 빨강 키 오류. 네트워크를 끄고 확인 → 빨강 접속 불가.
- 테스트용 빈 Supabase 프로젝트의 주소와 anon 키, publishable 키 각각 → 초록 성공 + [다음 →] → ③ 자리로 이동.
- 입력값을 고치면 확인 결과가 지워지고 다시 [확인]이 된다.
- 일시정지 판정은 실제 일시정지 프로젝트가 없으면 추측으로 남긴다고 기록.
- `npm run build` 성공.

## 이 단계에서 만들거나 고칠 파일
- `package.json`
- `features/server/validate.ts`, `supabaseClient.ts`, `probe.ts`, `messages.ts`
- `pages/server-setup/wizard/KeysStep.tsx`, `HelpToggle.tsx`, `CheckResultLine.tsx`, `SecretInput.tsx`(+css), `useWizard.ts`, `guides.ts`
