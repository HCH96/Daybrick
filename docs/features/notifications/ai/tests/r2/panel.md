# 패널·정렬·합치기 (r2) — req-panel R10·R16·R18–R20, req-send R24

검사 스크립트: `logic.ts` 사본을 임시 폴더에 두고 `node run.ts`로 실행 (저장소에 넣지 않음).
고정 시각 now = 2026-10-27T03:00:00.000Z, id는 순번으로 만드는 함수를 넘김.

## A2. 같은 ms에 로컬 알림 60개
- 테스트 내용: 같은 now로 mergeNotification을 60번 불러 "알림 1"–"알림 60"을 만듦 (합치기 키 없음)
- 근거 요구사항: R10, D17 (저장 시각 = max(now, 목록의 가장 늦은 updatedAt + 1ms))
- 수행 방법: logic.ts의 `mergeNotification`·`nextStamp` 읽기 + 스크립트 실행
- 예상 결과: updatedAt 60개가 모두 다르고 보낸 순서대로 커짐
- 실제 결과: 60개, 서로 다른 값 60개, 순증가. 첫 03:00:00.000Z → 끝 03:00:00.059Z
- 판정: 통과

## A3. sortForList 정렬·50개 자르기
- 테스트 내용: A2 목록을 sortForList로 정렬. 별도로 updatedAt이 같은 3개(createdAt·id만 다름)의 순서 확인
- 근거 요구사항: R10, D17 (updatedAt 최신 → createdAt 최신 → id 내림차순, 최대 50개)
- 수행 방법: `sortForList`·`desc`·`timeOf` 읽기 + 스크립트 실행
- 예상 결과: 길이 50, 맨 위 "알림 60", 50번째 "알림 11"
- 실제 결과: 길이 50, 맨 위 "알림 60", 50번째 "알림 11". 동률 검사: createdAt 늦은 것 먼저, createdAt도 같으면 id "z" → "a" 순
- 판정: 통과

## A4. 합치기 회귀 (m1 → 다른 알림 → m1)
- 테스트 내용: 같은 source로 mergeKey "m1", 키 없는 알림, 다시 "m1" 순서로 보냄 → m1 확인 처리 → 다시 "m1" 보냄. 다른 source의 "m1"도 보냄
- 근거 요구사항: R24
- 수행 방법: `mergeNotification`(같은 source·mergeKey·안 읽음 찾기) 읽기 + 스크립트 실행
- 예상 결과: 한 줄로 합쳐져 맨 위, 같은 키 알림이 모두 확인된 뒤엔 새로 생성
- 실제 결과: 줄 수 2, 맨 위가 "m1-둘"(id는 첫 알림 local-m1 유지). 확인 뒤 보낸 "m1-셋"은 새 id(local-m3)·안 읽음으로 맨 위. 다른 source는 따로 생성
- 판정: 통과

## A5. 서버 알림은 시각을 고치지 않음
- 테스트 내용: 같은 updatedAt(02:00)의 서버 알림 3개(s1·s2는 createdAt 01:00, id 1111…/ffff…, s3는 createdAt 01:30)와 같은 시각에 만든 로컬 알림 1개를 합쳐 정렬
- 근거 요구사항: R10
- 수행 방법: reducer의 `notify`(mergeNotification에 `file.local`만 넘김)·`server-loaded`·`server-upsert`(시각 손대지 않음), serverSync `rowToNotification`(updated_at 그대로), Provider(`[...local, ...serverCopy]` → sortForList) 읽기 + 스크립트 실행
- 예상 결과: 서버 알림 시각 그대로, 같은 시각이면 createdAt → id 순
- 실제 결과: 서버 알림 객체·updatedAt 변화 없음. 순서 "로컬, s3, s2, s1"
  - 로컬 알림은 createdAt도 02:00이라 서버 알림(01:00·01:30)보다 앞서는 것이 규칙대로임. 스크립트의 처음 기대값("s3,s2,s1,로컬")이 잘못 적혀 NG로 찍혔으나 코드 오류 아님
  - 서버끼리: createdAt 늦은 s3 → id 큰 s2(ffff…) → s1 로 기대대로
- 판정: 통과

## A6. 필터 계산
- 테스트 내용: 알림 5개 중 1개 확인 → 안 읽음/전체 필터 결과
- 근거 요구사항: R19, D18
- 수행 방법: NotificationPanel.tsx `filterList` 읽기, 같은 식으로 스크립트 실행
- 예상 결과: 안 읽음 탭은 확인한 알림 제외, 전체 탭은 포함, 패널 안에 따로 기억하는 목록 없음
- 실제 결과: 안 읽음 4개(확인한 것 빠짐), 전체 5개. 패널 상태는 `filter` 하나뿐이고 보이는 목록은 매번 `filterList(list, filter)`로 계산 (기억해 두는 id 목록·ref 없음)
- 판정: 통과

## A7. 빈 문구와 [모두 확인] 비활성
- 테스트 내용: 필터별 빈 문구 선택, [모두 확인] disabled 조건
- 근거 요구사항: R18, R20
- 수행 방법: PanelEmpty.tsx, PanelHead.tsx, Provider의 `unreadCount: countUnread(all)` 읽기 + markAllRead 후 countUnread 실행
- 예상 결과: 전체 빈 목록 "새 알림이 없습니다", 안 읽음 빈 목록 "안 읽은 알림이 없습니다", 안 읽은 알림 0개면 비활성
- 실제 결과: filter === "unread"면 "안 읽은 알림이 없습니다"(체크 아이콘), 아니면 "새 알림이 없습니다"(종 아이콘). 버튼은 `disabled={unreadCount === 0}`, unreadCount는 로컬+서버 전체 기준(50개 자르기 전). markAllRead 후 0 확인
- 판정: 통과

## A8. 본문 클릭
- 테스트 내용: 갈 곳 없으면 확인만 하고 패널 유지, 있으면 이동 후 패널 닫기
- 근거 요구사항: R16
- 수행 방법: NotificationPanel.tsx `handleOpen`, NotificationRow.tsx의 `onClick={() => onOpen(notification)}`, pageIntent `useOpenTarget`(boolean 반환) 읽기
- 예상 결과: 코드가 그대로임
- 실제 결과: 안 읽음이면 markRead. `n.target`이 있고 `openTarget`이 true를 돌려줄 때만 onClose. target이 없거나 이동 실패(false)면 패널 유지
- 판정: 통과
