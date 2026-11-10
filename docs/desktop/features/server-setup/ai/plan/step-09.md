# 서버 연결 9단계: 설정 서버 연결 칸과 관리 작업

- 요구사항: R32, R36, R47–R50
- 목업: settings.html (settings-server, settings-actions, settings-login), part-key-replace.html (key-replace, rerun-setup), part-confirm.html (confirm-disconnect, confirm-switch)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙

## 할 일
- `ServerSection`: 상태에 따라 Off / Connected / 로그인 필요 칸으로 나눈다. 칸 머리 오른쪽에 상태 점 + 글자(R40 색).
- `ServerSectionConnected`(R47, R48): 주소, 계정 이메일 + [로그아웃], 서버 구조 서버/앱, 마지막 접속, Anthropic 키 "등록됨 (날짜)" + [교체], [지금 다시 확인], [자동 세팅 다시 실행], 맨 아래 줄 [다른 Supabase로 바꾸기]·[서버 연결 해제].
- 로그인 필요 칸(R32): 같은 정보 + `GoogleButton`.
- `KeyReplaceDialog`: PAT + 새 키 → `check_anthropic_key` → `set_secrets` → 등록일 갱신 → `ai-key-check`.
- `RerunSetupDialog`: PAT, Google ID·비밀값 두 칸(바꿀 때만, 비우면 그대로). `setupRunner`로 1~4·6단계. 가입 막기는 켠 상태로 둔다. 초록 "서버의 데이터는 지워지지 않습니다".
- 연결 해제·바꾸기(R50): 기존 `ConfirmDialog`, [취소] 기본, 초록 데이터 유지 문구. 해제는 `server.json` 연결 정보·refresh 토큰 삭제, 바꾸기는 해제 후 마법사.
- 마무리 점검(R36): 저장소 전체에서 키 모양 문자열 검색, `server.json`·자격 증명·콘솔에 비밀값이 없는지 확인.

## 확인할 결과
- 연결됨 칸에 주소·이메일·"서버 구조 1 / 앱 1"·마지막 접속 시각, 키는 값 없이 "등록됨 (2026-…)"만.
- [로그아웃] → 칸이 로그인 필요로 바뀌고 주황 띠. [Google로 로그인] → 다시 연결됨.
- [교체]에 새 키 → 등록일이 오늘로 바뀜. 틀린 키는 거부.
- [자동 세팅 다시 실행] → 1~4·6단계 완료, 지원 관리 데이터와 서버 데이터 그대로.
- [서버 연결 해제] → 확인 팝업 → 연결 안 함 칸, 띠 없음, 로컬 기능 그대로. Supabase의 데이터는 남아 있다. [다른 Supabase로 바꾸기] → 마법사 ① 준비.
- `npm run build`, `cargo check` 성공. `npm run tauri build`로 설치 파일이 만들어진다.

## 이 단계에서 만들거나 고칠 파일
- `pages/settings/ServerSection.tsx`, `ServerSectionConnected.tsx`(+css), `KeyReplaceDialog.tsx`, `RerunSetupDialog.tsx`
- `features/server/ServerProvider.tsx`, `session.ts`, `setupRunner.ts`, `config.ts`, `messages.ts`
