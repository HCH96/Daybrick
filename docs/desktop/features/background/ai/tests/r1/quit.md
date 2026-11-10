# r1 · 종료 흐름 (req-tray: A7–A11, A18)

읽은 파일: src-tauri/src/background/quit.rs, features/background/BackgroundProvider.tsx (`quitNow`, `handleQuit`), components/background/BackgroundDialogs.tsx, app/quit.ts, features/today/useAutoSave.ts, features/today/reducer.ts(`touchRunning` 위치), features/sync/useCloseFlush.ts

## A7 · 타이머 있을 때 확인, 없을 때 바로 종료
- 근거 요구사항: R9, R10
- 수행 방법: `handleQuit` 분기, `hasTimer` 계산, 확인 창 문구 확인
- 예상 결과: 타이머 실행·일시정지면 창 보이기 + 확인 창(제목 "앱 종료", 본문 "타이머가 실행 중이에요. 종료할까요?", [취소]/[종료]), 없으면 바로 종료
- 실제 결과: `hasTimer = today ready && data.running !== null` (일시정지도 running 객체가 남으므로 포함). 있으면 `showMainWindow()` 뒤 `setDialog("quit-confirm")`, 없으면 `quitNow()`. ConfirmDialog title "앱 종료", message 일치, confirmLabel "종료"(취소 버튼은 ConfirmDialog 기본)
- 판정: 통과

## A8 · 종료 전 저장 후 quit_app, 5초 상한
- 근거 요구사항: R12, D3
- 수행 방법: `quitNow`, app/quit.ts `runQuitHandlers`·`QUIT_WAIT_MS`
- 예상 결과: 저장 후 종료, 5초 타임아웃
- 실제 결과: `await runQuitHandlers()` 다음에 `quitApp()`. 처리기들을 `Promise.allSettled`로 함께 돌리고 `QUIT_WAIT_MS = 5_000` 타이머와 race. 실패·시간 초과여도 종료로 넘어감. 처리기는 applications·calendar·notifications·plan·today 5곳이 등록
- 판정: 통과

## A9 · 3초 안에 ack 없으면 Rust가 강제 종료
- 근거 요구사항: D2
- 수행 방법: quit.rs `request_quit`, `ack_quit_request`, `ACK_TIMEOUT`, lib.rs 명령 등록
- 예상 결과: 3초 타이머 + ack 처리
- 실제 결과: `ACK_TIMEOUT = 3초`. 요청마다 번호를 `waiting`에 두고 스레드에서 3초 뒤 같은 번호가 남아 있으면 `app.exit(0)`. `ack_quit_request`가 `waiting=None`. 프론트는 `handleQuit` 첫 줄에서 ack. 명령은 lib.rs에 등록됨
- 판정: 통과

## A10 · 종료 진행 중·확인 창 중 재요청 무시, 저장 한 번
- 근거 요구사항: 작은 규칙, L04 메모
- 수행 방법: `handleQuit`, `quitNow`의 `quittingRef`
- 예상 결과: 중복 방지 있음
- 실제 결과: 재요청도 ack는 함(강제 종료 막음). `quittingRef` 또는 `dialogRef === "quit-confirm"`이면 return. `quitNow`도 첫 줄에서 `quittingRef`를 보고 동기적으로 true로 바꾸므로 `runQuitHandlers`는 한 번만 돈다. Rust도 기다리는 중이면 감시 스레드를 새로 만들지 않음
- 판정: 통과
- 참고: 타이머가 있을 때 `showMainWindow()`를 기다리는 아주 짧은 사이에 재요청이 오면 확인 창을 두 번 세팅하지만 같은 값이라 결과는 같다.

## A11 · R11: 기존 touchRunning만 사용
- 근거 요구사항: R11
- 수행 방법: `grep touchRunning`, `git diff 7e558af~1 HEAD -- features/today/`
- 예상 결과: 기존 함수 재사용
- 실제 결과: `touchRunning`은 reducer.ts에 그대로(마지막 변경은 투데이 단계 커밋). 백그라운드 작업은 useAutoSave.ts에서 `onCloseRequested` → `onQuitRequested`로 등록 위치만 바꿈. 새 규칙 없음
- 판정: 통과

## A18 · L04 남은 문제 (sessionRef 재시도)
- 근거 요구사항: R12, L04
- 수행 방법: useCloseFlush.ts, `quitNow`·`handleQuit` 순서
- 예상 결과: 해결됐으면 통과
- 실제 결과: `sessionRef`는 여전히 비우지 않지만, 확인 창이 저장 **앞**에 오고 [취소]는 `setDialog(null)`만 한다. 따라서 [취소] 뒤에는 `runQuitHandlers`(→ closeFlush)가 한 번도 돌지 않아 sessionRef가 만들어지지 않고, 다음 종료 때 올리기를 처음부터 시도한다. L04가 걱정한 경로는 막힘
- 판정: 통과
- 참고: `quit_app` 호출 자체가 실패하면 `quittingRef`를 풀어 다시 종료할 수 있는데, 이때는 sessionRef가 이미 끝난 Promise로 남아 두 번째 종료에서 올리기를 다시 하지 않는다. 드문 경로라 판정에는 넣지 않았다.
