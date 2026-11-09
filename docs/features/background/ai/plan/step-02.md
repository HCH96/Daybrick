# 백그라운드 실행 2단계: 닫기와 종료 나누기

- 요구사항: R1, R2, R3, R5, R9, R11, R12
- 목업: 없음 (화면 없음)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D1, D2, D3, D4

## 할 일
- `lib.rs`: `on_window_event`에서 "main" 창의 `CloseRequested`를 `api.prevent_close()`로 막고 `daybrick://close-requested`를 보낸다 (X·Alt+F4 모두 여기로 온다).
- 새 `background/quit.rs`:
  - 명령 `show_main_window`, `hide_main_window`, `quit_app`(→ `app.exit(0)`), `ack_quit_request`.
  - `request_quit(app)`: 대기 표시를 켜고 `daybrick://quit-requested`를 보낸 뒤 3초 기다린다. 그동안 `ack_quit_request`가 없으면 바로 `app.exit(0)` (D2). 이미 대기 중이면 다시 알리기만 한다.
- `tray.rs`: "종료"를 `request_quit`로 바꾼다.
- 새 `app/quit.ts`: `onQuitRequested(fn: () => Promise<void>): () => void`(등록·해제), `runQuitHandlers(): Promise<void>`(모두 `allSettled`, 전체 최대 5초, D3).
- 다섯 `useAutoSave.ts`(지원·캘린더·알림·플랜·투데이): `getCurrentWindow().onCloseRequested(...)`를 `onQuitRequested(...)`로 바꾼다. 처리기 본문(투데이 `touchRunning`, `closeFlush`)은 그대로 둔다. 투데이 주석의 "창 닫기"를 "종료"로.
- `useCloseFlush.ts`: 주석만 종료 기준으로 고친다 (동작 같음).
- 새 `features/background/api.ts`: 위 명령과 두 이벤트 감싸기.
- 새 `features/background/BackgroundProvider.tsx`: `close-requested` → `hideMainWindow()`. `quit-requested` → `ackQuitRequest()` → `runQuitHandlers()` → `quitApp()` (이 단계에서는 확인 창 없음). Tauri가 아니면 아무것도 하지 않는다.
- `App.tsx`: `TodayProvider` 안(`JobStatusSync` 옆)에 `BackgroundProvider`로 감싼다.

## 확인할 결과
- `cargo check`, `npm run build` 성공. `onCloseRequested`가 코드에 남아 있지 않다 (`grep`).
- X를 누르면 창만 사라지고 트레이 아이콘은 남는다. Alt+F4도 같다. 아이콘을 누르면 같은 화면 그대로 다시 보인다.
- 최소화 버튼은 지금처럼 작업표시줄로 내린다 (R5).
- 투데이 타이머를 켜고 창을 숨긴 뒤 2분 후 열면 그동안의 시간이 흘러 있다 (R3).
- 타이머를 켠 채 트레이 "종료" → 프로세스가 끝나고 `today.json`의 `running.lastSeenAt`이 종료 시각이다. 다시 켜면 그 시각까지 기록되고 태스크는 "시작 전"이다 (R11).
- 플랜에서 글자를 고치고 0.5초 안에 트레이 "종료" → 다시 켜면 고친 내용이 남아 있다 (R12).

## 이 단계에서 만들거나 고칠 파일
- `src-tauri/src/lib.rs`, `background/tray.rs`, 새 `background/quit.rs`
- 새 `src/app/quit.ts`, 새 `src/features/background/api.ts`, 새 `src/features/background/BackgroundProvider.tsx`
- `src/features/{applications,calendar,notifications,plan,today}/useAutoSave.ts`
- `src/features/sync/useCloseFlush.ts`
- `src/App.tsx`
