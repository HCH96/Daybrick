# 설정 서버 연결 칸 (req-settings) — r1

## A21. 관리 작업
- 테스트 내용: 로그아웃, 키 교체, 자동 세팅 다시 실행, 연결 해제
- 근거 요구사항: R49, L06, L14
- 수행 방법: ServerProvider.tsx `logout`·`clearConnection`, session.ts `signOut`, pages/settings/KeyReplaceDialog.tsx `replaceKey`, features/server/rerunSetup.ts 전체, management.rs `configure_auth`·`set_secrets` 빈 값 처리, config.rs `clear_server_connection` 읽음
- 예상 결과: 충족
- 실제 결과
  - 로그아웃: `signOut`(로컬 범위) → 자격 증명 관리자 토큰 삭제. 오류가 나도 토큰 삭제는 따로 시도
  - 키 교체: 새 키 Anthropic 확인(R12) → 비밀값 `ANTHROPIC_API_KEY`만 교체(Google 값은 빈 값으로 건너뜀) → 본인 행 등록일을 지금 시각으로 → 서버 `ai-key-check`로 동작 확인
  - 다시 실행: `RERUN_STEPS` = 자동 세팅 단계에서 계정 등록만 뺀 1~4·6단계. 인증 설정은 Google 값이 비면 지금 값 유지, 새 가입 막기는 다시 켬. 비밀값 단계는 Google ID·비밀값 둘 다 있을 때만 등록, 아니면 "바꿀 값 없음". 실패하면 그 단계부터 다시 시도
  - 연결 해제: 로그인 토큰 삭제 → server.json 삭제 → 기본값에 `welcomeDismissed: true`만 남긴 server.json 저장
- 판정: **통과**
- 참고: 다시 실행에서 Google 클라이언트 ID만 넣고 비밀값을 비우면 인증 설정에는 ID만 바뀌고 비밀값 등록 단계는 건너뜀(입력 화면에서 막는지는 확인하지 않음)

## A24. 외부 링크·키 값 미표시·확인 팝업 문구
- 테스트 내용: 외부 링크 기본 브라우저, 설정에 Anthropic 키 값 미표시, 해제·바꾸기 팝업 문구
- 근거 요구사항: R9, R48, R50
- 수행 방법: wizard/openExternal.ts, guides.ts 링크, `openExternal(` 쓰는 곳 grep, `href=`·`window.open` grep, capabilities/default.json, ServerSectionConnected.tsx 키 줄, ServerDangerRow.tsx, messages.ts 확인 문구 읽음
- 예상 결과: 충족
- 실제 결과
  - 가이드·도움말·결과 줄·재개 팝업의 링크는 모두 `openExternal` → `@tauri-apps/plugin-opener` `openUrl`(기본 브라우저). 권한 `opener:default` 있음. 서버 연결 화면에 `href`·`window.open` 없음
  - 설정의 Anthropic 키 줄은 "등록됨" 알약과 "<날짜> 등록"만, 값을 받는 곳 자체가 없음(health는 등록일만 돌려줌)
  - 연결 해제·다른 Supabase로 바꾸기 모두 확인 팝업을 거치고, 두 팝업에 `SERVER_DATA_KEPT` = "서버의 데이터는 지워지지 않습니다"를 붙임
- 판정: **통과**
