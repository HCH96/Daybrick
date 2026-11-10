# 백그라운드 실행 3단계: 첫 닫기 안내·타이머 종료 확인

- 요구사항: R4, R10
- 목업: 없음 (문구는 req-tray.md R4·R10, 모양은 기존 ConfirmDialog)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D1, D3

## 할 일
- 새 `background/app_settings.rs`: `app-settings.json` 읽기(없거나 깨지면 기본값)·임시 파일 후 바꿔치기 쓰기. 명령 `load_app_settings`, `mark_close_notice_seen`. `lib.rs`에 등록.
- `api.ts`: 두 명령 추가.
- 새 `components/common/NoticeDialog.tsx`: 제목·본문·버튼 하나(`buttonLabel`, 보라). `confirm-layer`/`confirm` CSS를 쓴다. Esc는 `onDismiss`(안내만 닫기), 처음 포커스는 버튼.
- `BackgroundProvider.tsx`:
  - 시작 때 `loadAppSettings()`로 `closeNoticeSeen`을 읽는다.
  - `close-requested`: 봤으면 바로 숨김. 안 봤으면 `dialog = "close-notice"`. [확인] → `markCloseNoticeSeen()` → 숨김. Esc → 안내만 닫음.
  - `quit-requested`: `ack` 후 `useToday()`의 `running`이 있으면(실행·일시정지) `showMainWindow()` + `dialog = "quit-confirm"`. [종료] → 저장 → 끔. [취소] → 닫기만. 확인 창이 떠 있으면 새 요청은 무시.
  - 상태와 처리 함수를 context로 내보낸다.
- 새 `components/background/BackgroundDialogs.tsx`: context를 읽어 NoticeDialog(R4 문구, [확인]) 또는 ConfirmDialog(제목 "앱 종료", 본문 "타이머가 실행 중이에요. 종료할까요?", [종료], `confirmTone="danger"`)를 그린다. context가 없으면 null.
- `TitleBar.tsx`: 두 모양 모두에 `<BackgroundDialogs />`.

## 확인할 결과
- `cargo check`, `npm run build` 성공.
- `app-settings.json`을 지우고 켠 뒤 X → "창을 닫아도 Daybrick은 트레이에서 계속 실행돼요. 완전히 끄려면 트레이 아이콘에서 '종료'를 누르세요." 안내 → [확인] → 창이 숨는다. 파일에 `"closeNoticeSeen": true`.
- 다시 열어 X → 안내 없이 바로 숨는다. 앱을 다시 켜도 안내가 다시 뜨지 않는다.
- 안내에서 Esc → 창이 그대로 있고, 다음 X 때 안내가 또 뜬다.
- 타이머 실행 중(또는 일시정지)에 창을 숨기고 트레이 "종료" → 창이 나타나고 확인 창이 뜬다. [취소] → 아무 일 없음, 타이머 계속. [종료] → 꺼지고 2단계처럼 lastSeenAt이 적힌다.
- 타이머가 없으면 확인 창 없이 바로 꺼진다.
- 연결 마법사 화면(사이드바 없는 화면)에서도 안내 창이 보인다.

## 이 단계에서 만들거나 고칠 파일
- 새 `src-tauri/src/background/app_settings.rs`, `background/mod.rs`, `src-tauri/src/lib.rs`
- `src/features/background/api.ts`, `BackgroundProvider.tsx`
- 새 `src/components/common/NoticeDialog.tsx`
- 새 `src/components/background/BackgroundDialogs.tsx`
- `src/components/layout/TitleBar.tsx`
