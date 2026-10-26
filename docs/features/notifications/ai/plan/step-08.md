# 알림 8단계: 서버 확인 기록·오프라인

- 요구사항: R33
- 목업: 없음
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙

## 할 일
- 서버 알림을 확인하거나, 되돌리거나, [모두 확인]하면 로컬 사본을 먼저 바꾼다. 그다음 `serverSync.ts`의 `writeReadState(client, ids, readAt)`로 서버의 `read_at`을 update한다.
- `pendingAcks.ts`:
  - `addPending`: 같은 id는 마지막 기록만 남긴다.
  - `applyPending(list)`: 받아 온 서버 목록에 대기 기록을 덮어씌운다.
  - `flushPending(client)`: 앞에서부터 하나씩 반영하고, 성공한 것만 지운다.
- 쓰기가 실패하거나 연결이 없으면 `pendingAcks`에 넣고 `notifications.json`에 저장한다.
- `useServerNotifications`:
  - 상태가 `connected`가 되면 `flushPending`을 먼저 하고, 그다음 전체를 다시 받는다.
  - 받아 온 결과나 실시간으로 받은 행에는 `applyPending`을 적용한다 (대기 기록 우선).

## 확인할 결과
- 서버 알림에서 ✓를 누르면 SQL 편집기에서 그 행의 `read_at`이 채워져 있다. ↺를 누르면 null로 돌아간다.
- 와이파이를 끈 채 서버 알림을 확인하면 목록에는 확인으로 보인다. 와이파이를 다시 켜면 서버에 반영되고 `pendingAcks`가 비워진다.
- 오프라인에서 확인한 뒤 앱을 끄고 연결된 상태로 다시 켜도 반영된다.
- `npm run build`가 성공한다.

## 이 단계에서 만들거나 고칠 파일
- `features/notifications/serverSync.ts`, `pendingAcks.ts`, `useServerNotifications.ts`
- `features/notifications/reducer.ts`, `NotificationsProvider.tsx`
