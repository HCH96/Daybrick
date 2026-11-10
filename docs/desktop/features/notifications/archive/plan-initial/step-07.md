# 알림 7단계: 서버 알림 받기·실시간·사본

- 요구사항: R30–R32, R34, R35
- 목업: 없음
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙 (D11, D12)

## 할 일
- `features/notifications/serverSync.ts`를 만든다.
  - `fetchServerNotifications(client)`: 확인한 지 30일이 지난 내 행을 먼저 지운다 (D11). 그다음 안 읽은 행 전체와 확인한 지 30일 안의 행을 받아 `AppNotification`(`origin: "server"`)으로 바꾼다 (R30).
  - `subscribeServerNotifications(client, userId, onChange, onSubscribed)`: `postgres_changes`(insert·update, `user_id=eq.<id>` 필터)를 구독한다. 반환값은 구독 해제 함수 (R31).
- `useServerNotifications`를 만든다 (Provider 안에서 쓴다).
  - `useServer()`의 `serverSession`이 있고 `status === "connected"`일 때만 동작한다.
  - 구독 상태가 `SUBSCRIBED`가 될 때마다(처음 연결과 다시 연결 모두) `fetchServerNotifications`로 전체를 다시 받아 `serverCopy`를 바꾼다 (R32).
  - 실시간으로 받은 행은 `serverCopy`에서 같은 id를 바꾸거나 새로 넣는다.
  - 연결이 끊기거나 상태가 바뀌면 구독을 해제하고, 목록은 `serverCopy`로 계속 보여준다 (R34).
- 서버 상태 문제는 알림을 만들지 않는다. 기존 `ServerBanner`가 그대로 맡는다 (R35).
- Supabase 무료 플랜의 실시간 한도를 공식 문서로 확인하고 진행 기록에 적는다. 계획의 숫자와 다르면 index.md 작은 규칙도 고친다.

## 확인할 결과
- 연결된 상태에서 SQL 편집기로 `daybrick_notify`를 부르면 1~2초 안에 배지와 목록에 나타난다. 같은 키로 다시 부르면 그 행이 갱신되어 맨 위로 온다.
- 와이파이를 끈 동안 SQL로 알림을 넣고 다시 켜면, 재연결 뒤 그 알림이 나타난다.
- 서버를 일시정지하거나 연결 정보를 지운 상태로 앱을 켜도 마지막으로 받은 서버 알림이 목록에 보이고, 알림 대신 안내 띠만 나온다.
- 확인한 지 31일이 지난 서버 행은 앱을 켜면 서버에서 지워진다.
- `npm run build`가 성공한다.

## 이 단계에서 만들거나 고칠 파일
- `features/notifications/serverSync.ts`, `useServerNotifications.ts`
- `features/notifications/NotificationsProvider.tsx`, `reducer.ts`, `types.ts`
