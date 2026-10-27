# 보내기·데이터 (req-send, D8)

## A2 notify() 공용 함수·대기 줄
- 테스트 내용: `notify()` 하나로 저장·합치기·배지 갱신, Provider가 뜨기 전 알림을 줄 세움
- 근거 요구사항: R21, D9
- 수행 방법: notify.ts 읽기·실행, NotificationsProvider의 receiver 등록 effect와 reducer `notify` 동작 읽기
- 예상 결과: 공용 함수 하나, 대기 줄 처리 있음
- 실제 결과: 받는 쪽이 없으면 `queue`에 넣고, `registerNotifyReceiver`가 줄을 차례로 넘김. 실행: 등록 전 q1·q2 → 등록 시 q1,q2 전달, 이후 q3 즉시, 해제 후 q4는 줄에 남았다가 다시 등록 시 전달. Provider는 파일을 다 읽은(ready) 뒤 등록하고, reducer가 `mergeNotification`으로 합친 뒤 상태가 바뀌면 useAutoSave 저장, unreadCount 다시 계산
- 판정: 통과

## A3 알림 데이터 항목
- 테스트 내용: source·kind·importance·title·body·target?·mergeKey?·origin·id 접두어
- 근거 요구사항: R22
- 수행 방법: types.ts `AppNotification`·`NotifyInput`, logic.ts `newLocalId` 읽기·실행
- 예상 결과: 항목이 모두 있고 로컬 id는 `local-`
- 실제 결과: 모든 항목 있음(target·mergeKey는 선택, origin `"local"|"server"`, 그 밖에 createdAt·updatedAt·readAt). `newLocalId()`가 `local-` + uuid
- 판정: 통과

## A4 합치기
- 테스트 내용: 같은 source+mergeKey 안 읽음→갱신·맨 위, 모두 확인됨→새로, mergeKey 없음→항상 새로
- 근거 요구사항: R24
- 수행 방법: logic.ts `mergeNotification`·`sortForList` 실행
- 예상 결과: 세 경우 모두 기대대로
- 실제 결과: ① 개수 유지, id·createdAt 그대로, 제목·내용·updatedAt 갱신, 최신순 정렬 첫 번째 ② 같은 키가 확인됨이면 새 알림(readAt null) 생성, 다른 source 같은 키도 새로 ③ 키 없으면 두 번 모두 새로 생성
- 판정: 통과

## A5 30일 정리
- 테스트 내용: 확인 31일 전 삭제, 29일 유지, 안 읽음은 오래돼도 유지
- 근거 요구사항: R27
- 수행 방법: logic.ts `pruneRead` 실행, NotificationsProvider `loadAndPrune`(로컬·서버 사본 모두 정리 후 저장) 읽기
- 예상 결과: 기대대로
- 실제 결과: `["r29","u100"]` 남음(31일 전 확인 삭제, 100일 된 안 읽음 유지)
- 판정: 통과

## A6 하나씩 지우기 없음
- 테스트 내용: 알림 하나를 지우는 기능·버튼이 없는지
- 근거 요구사항: R28
- 수행 방법: reducer 동작 목록 확인, components/notifications·features/notifications에서 delete/remove/삭제/지우기 grep, NotificationRow·PanelHead 버튼 확인
- 예상 결과: 삭제 동작 없음
- 실제 결과: reducer에 삭제 동작 없음. 행 버튼은 확인/되돌리기 하나, 패널 머리는 필터·모두 확인뿐. 검색 결과는 대기 기록 지우기(removeSent)·채널 해제·서버 30일 정리뿐
- 판정: 통과

## A10 보낸 기능 이름
- 테스트 내용: PageId면 PAGE_LABELS, 아니면 "Daybrick"
- 근거 요구사항: R26
- 수행 방법: sourceLabel.ts 실행(rolldown으로 pageLabels 함께 묶음)
- 예상 결과: 기대대로
- 실제 결과: applications→"지원 현황", timer→"타이머", home→"홈", server·빈 문자열·"toString"→"Daybrick"(hasOwnProperty로 상속 속성도 거름)
- 판정: 통과

## A14 notifications.json 저장 방식
- 테스트 내용: 쓰기가 임시 파일 바꿔치기 방식인지
- 근거 요구사항: D8
- 수행 방법: src-tauri/src/notifications.rs `save_notifications`, lib.rs 명령 등록 읽기
- 예상 결과: 맞음
- 실제 결과: `notifications.json.tmp`에 `fs::write` 후 `fs::rename`으로 바꿈. load·save 명령이 lib.rs에 등록됨
- 판정: 통과
