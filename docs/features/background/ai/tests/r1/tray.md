# r1 · 창 숨기기·트레이·첫 닫기 안내 (req-tray: A3–A5, A12, A13)

## A3 · `onCloseRequested`가 코드에 없음
- 테스트 내용: 프론트의 창 닫기 가로채기가 모두 빠졌는지
- 근거 요구사항: D4, R1, R2
- 수행 방법: `grep -rn "onCloseRequested" src src-tauri/src | wc -l` (apps/desktop)
- 예상 결과: 0건
- 실제 결과: 0건 (종료 전 저장은 app/quit.ts의 `onQuitRequested` 등록소로 옮겨짐)
- 판정: 통과

## A4 · Rust가 닫기 요청을 막고 이벤트 전송, 최소화는 그대로
- 테스트 내용: X·Alt+F4 닫기 요청 처리
- 근거 요구사항: R1, R2, R5, D1
- 수행 방법: src-tauri/src/background/mod.rs `on_window_event`, `CLOSE_REQUESTED_EVENT`, lib.rs의 `.on_window_event` 등록 확인
- 예상 결과: prevent_close + `daybrick://close-requested` 이벤트, 최소화 가로채기 없음
- 실제 결과: main 창의 `WindowEvent::CloseRequested`에서만 `api.prevent_close()` 후 `daybrick://close-requested`를 emit. 다른 창 이벤트(크기·최소화 등)는 처리하지 않음. 창 숨기기는 프론트가 `hide_main_window` 명령으로 정함
- 판정: 통과

## A5 · 트레이 아이콘
- 테스트 내용: 툴팁, 왼쪽 클릭, 메뉴
- 근거 요구사항: R6–R8
- 수행 방법: background/tray.rs `create_tray`, background/window.rs `show_main_window`
- 예상 결과: 툴팁 "Daybrick", 왼쪽 클릭 = 최소화 해제·보이기·포커스, 메뉴 "열기"/"종료"(열기 = 왼쪽 클릭과 같음)
- 실제 결과: `.tooltip("Daybrick")`, 왼쪽 버튼 Up 클릭 → `show_main_window`(unminimize → show → set_focus 순서). 메뉴 "열기"(→ 같은 `show_main_window`), "종료"(→ `request_quit`). `show_menu_on_left_click(false)`로 왼쪽 클릭에 메뉴가 뜨지 않음
- 판정: 통과

## A12 · 첫 닫기 안내
- 테스트 내용: 안내 문구, [확인], Esc 처리
- 근거 요구사항: R4
- 수행 방법: components/background/BackgroundDialogs.tsx `CLOSE_NOTICE`, components/common/NoticeDialog.tsx, features/background/BackgroundProvider.tsx `confirmCloseNotice`·`dismissCloseNotice`, src-tauri/src/background/app_settings.rs `mark_close_notice_seen`
- 예상 결과: 문구 일치, [확인] → closeNoticeSeen 저장 후 숨김, Esc → 안내만 닫음(저장 안 함)
- 실제 결과: 문구가 글자 그대로 일치. [확인] → 창 상태 비움, `noticeSeenRef=true`, `markCloseNoticeSeen()`(Rust에서 `close_notice_seen=true` 저장), `hide()`. Esc → `useEscapeLayer(onDismiss)` → `dismissCloseNotice`는 `setDialog(null)`만 함 (저장·숨김 없음). 바깥 클릭으로는 닫히지 않음
- 판정: 통과

## A13 · 안내·확인 창이 떠 있을 때 X·Alt+F4 무시
- 테스트 내용: 창이 떠 있는 동안 다시 온 닫기 요청 처리
- 근거 요구사항: L05 (자동 진행 중 판단)
- 수행 방법: BackgroundProvider.tsx `listenCloseRequested` 처리기
- 예상 결과: 무시 분기 있음
- 실제 결과: `dialogRef.current !== null`이면 바로 return. 안내("close-notice")·종료 확인("quit-confirm") 둘 다 해당. Rust는 닫기를 항상 막으므로 창이 닫히지도 않음
- 판정: 통과
