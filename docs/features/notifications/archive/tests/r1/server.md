# 서버 알림 (req-server)

A15–A19는 코드·SQL을 읽어 판정했다. 실제 Supabase 적용·실시간 수신은 실행하지 않았다.

## A15 0002_notifications.sql
- 테스트 내용: 새 번호 단계, RLS(로그인한 주인만 읽기·쓰기, anon 불가), `daybrick_notify` 합치기·부분 고유 인덱스, 다시 실행해도 오류 없음
- 근거 요구사항: R29, R36
- 수행 방법: supabase/migrations/0002_notifications.sql 전체 읽기, src-tauri/src/server/migrations.rs에서 include_str 등록 grep
- 예상 결과: 맞음
- 실제 결과:
  - 0001 다음 0002로 migrations.rs에 포함됨
  - RLS 켬, anon 모든 권한 회수, authenticated insert 회수. select·update·delete 정책 모두 `user_id = auth.uid()`, update는 with check도 같음
  - 부분 고유 인덱스 `(user_id, source, merge_key) where read_at is null and merge_key is not null`, `daybrick_notify`가 같은 조건 `on conflict ... do update`로 제목·내용·updated_at 갱신. security definer + `search_path = ''`, anon 실행 권한 회수
  - `create table/index if not exists`, `drop policy if exists`, `create or replace function`, 발행 목록 추가는 존재 확인 후 → 다시 실행해도 오류 없게 작성됨
- 판정: 통과

## A16 서버 받기
- 테스트 내용: 연결됨일 때만 최근 30일 받기, 확인 31일 지난 서버 행 정리, 받은 서버 알림 로컬 사본 저장
- 근거 요구사항: R30, R34, D11
- 수행 방법: useServerNotifications.ts, serverSync.ts `fetchServerNotifications`, reducer `server-loaded`, useAutoSave 사용 읽기
- 예상 결과: 맞음
- 실제 결과: `active`가 파일 읽음 + 세션 있음 + `status === "connected"`일 때만 동작. 받기 전 `read_at < now-30일` 행 delete(실패해도 받기 계속), 받기는 `read_at is null or read_at >= cutoff`. 결과는 `serverCopy`에 넣어 notifications.json에 저장되고, 연결이 끊겨도 사본을 계속 보여줌
- 판정: 통과

## A17 실시간
- 테스트 내용: `user_id` 필터 구독, SUBSCRIBED마다 + 연결 직후 한 번 전체 다시 받기
- 근거 요구사항: R31, R32, D12
- 수행 방법: serverSync.ts `subscribeServerNotifications`, useServerNotifications.ts 연결 effect 읽기
- 예상 결과: 맞음
- 실제 결과: INSERT·UPDATE 모두 `filter: user_id=eq.<userId>`. 상태가 SUBSCRIBED일 때마다 `refetch`. 연결 직후 `flush().then(refetch)`로 한 번 받음. 겹친 요청은 마지막 결과만 씀
- 판정: 통과

## A18 서버 상태로 알림 만들지 않음
- 테스트 내용: 서버 연결 상태 문제로 notify를 부르지 않는지
- 근거 요구사항: R35
- 수행 방법: apps/desktop/src 전체에서 `notify(`·`notifications/notify` import grep
- 예상 결과: notify 호출 없음
- 실제 결과: notify를 쓰는 곳은 devNotify.ts(개발 모드 콘솔용)뿐. 서버 쪽 코드는 오류를 console.error로만 남김
- 판정: 통과

## A19 서버 확인 기록
- 테스트 내용: pendingAcks에 먼저 넣고 성공 시 지움, 다음 확인 동작/재연결 때 재시도, 되돌리기는 read_at null
- 근거 요구사항: R33
- 수행 방법: reducer `changeRead`·`acks-sent`, pendingAcks.ts `addPending`·`removeSent`·`flushPending`, useServerNotifications.ts flush 읽기, `markUnread` 실행
- 예상 결과: 맞음
- 실제 결과: 확인·되돌리기·모두 확인은 서버 사본을 바꾸면서 바뀐 항목을 pendingAcks에 먼저 쌓음(파일에 저장됨). flush 성공분만 `acks-sent`로 지우고, 실패하면 남김. pendingAcks가 바뀔 때(다음 확인 동작)와 연결될 때마다 다시 flush. 다시 받은 서버 목록엔 대기 기록이 우선 적용됨. 되돌리기는 readAt null → `update({ read_at: null })`
- 판정: 통과
