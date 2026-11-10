# 알림 1단계: 데이터·로컬 저장·보내기 함수

- 요구사항: R21, R22, R24, R27, R28
- 목업: 없음 (화면 없는 단계)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙, 데이터 모양은 [structure.md](structure.md) 2절

## 할 일
- Rust `notifications.rs`: `load_notifications`(파일이 없으면 None)와 `save_notifications`(임시 파일 바꿔치기)를 만들고 `lib.rs`에 등록한다. `storage.rs`의 applications 방식을 그대로 따른다.
- `features/notifications/types.ts`, `storage.ts`: `version: 1`을 확인한다. 파일이 깨졌거나 모르는 버전이면 예외를 던지고 저장을 막는다. Tauri 밖에서는 메모리에만 둔다.
- `logic.ts`에 순수 함수를 만든다:
  - `mergeNotification(list, input, now)`: 같은 `source`·`mergeKey`의 안 읽은 알림이 있으면 제목·내용·`updatedAt`만 바꾸고, 없으면 새로 만든다 (R24).
  - `pruneRead(list, now)`: 확인한 지 30일이 지난 알림을 지운다. 안 읽은 알림은 지우지 않는다 (R27).
  - `countUnread`, `markRead`, `markUnread`, `markAllRead`, `sortForList`(`updatedAt` 최신순, 50개)
- `reducer.ts`, `NotificationsProvider.tsx`, `useNotifications.ts`, `useAutoSave.ts`(applications의 `useAutoSave`와 같은 방식)를 만든다. 앱을 켤 때 읽고 바로 `pruneRead`를 한다.
- `notify.ts`: `notify(input)`. Provider가 받는 쪽을 등록하고, 등록 전에 온 알림은 줄에 세웠다가 등록되면 처리한다 (R21).
- `devNotify.ts`: `import.meta.env.DEV`일 때만 `window.daybrickNotify = notify`를 연다.
- `App.tsx`에서 `ServerProvider` 바로 안쪽을 `NotificationsProvider`로 감싼다. `TitleBar`와 `FullScreen`을 모두 감싸야 한다.
- 알림을 지우는 동작은 만들지 않는다 (R28).

## 확인할 결과
- 개발 모드 콘솔에서 `daybrickNotify({source:"applications", kind:"test", importance:"info", title:"t", body:"b"})`를 부르면 앱 데이터 폴더의 `notifications.json`에 저장된다.
- 같은 `mergeKey`로 두 번 보내면 1개가 갱신된다. 첫 알림을 확인 처리한 뒤 보내면 새로 생긴다. 확인 처리는 콘솔이나 임시 코드로 하고, 임시 코드는 커밋하지 않는다.
- 파일에서 `readAt`을 31일 전으로 고치고 앱을 켜면 그 알림이 지워진다.
- `npm run build`, `cargo check`가 성공한다.

## 이 단계에서 만들거나 고칠 파일
- `src-tauri/src/notifications.rs`, `src-tauri/src/lib.rs`
- `features/notifications/types.ts`, `storage.ts`, `logic.ts`, `reducer.ts`, `NotificationsProvider.tsx`, `useNotifications.ts`, `useAutoSave.ts`, `notify.ts`, `devNotify.ts`
- `App.tsx`
