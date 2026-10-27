# 패널 (req-panel)

## A8 목록 계산
- 테스트 내용: 로컬+서버를 합쳐 updatedAt 최신순, 50개 자르기, 안 읽음 필터는 50개 목록 안에서 거름
- 근거 요구사항: R10
- 수행 방법: `sortForList`(logic.ts) 실행. NotificationsProvider의 `list: sortForList([...local, ...serverCopy])`, NotificationPanel의 `filterList`가 `list`(50개)를 거르는지 읽기. 60개 중 잘린 10개가 모두 안 읽음인 경우를 만들어 같은 조건으로 거름
- 예상 결과: 기대대로
- 실제 결과: 섞은 순서 → `["S2","L2","S1","L1"]`(최신순). 60개 → 목록 50개, 안 읽음 필터 10개(전체 안 읽음 20개 중 50개 안의 것만)
- 판정: 통과

## A9 상대 시각
- 테스트 내용: 방금/N분 전/N시간 전(오늘)/어제/M월 D일, 자정 경계
- 근거 요구사항: R12
- 수행 방법: utils/relativeTime.ts `formatRelativeTime` 실행(TZ=Asia/Seoul). NotificationRow가 `updatedAt`으로 부르는지 확인
- 예상 결과: 기대대로
- 실제 결과: 30초 전·미래→"방금", 5분 전→"5분 전", 00:30 기준 어제 23:31→"59분 전", 어제 23:29→"어제", 15:00 기준 12:00→"3시간 전", 오늘 00:00→"15시간 전", 어제 23:59·00:00→"어제", 그제 23:59→"10월 25일", 월·연 경계 전날→"어제". 12건 모두 기대와 같음
- 판정: 통과

## A11 갈 곳 처리
- 테스트 내용: 없는 page면 이동 안 함, 연결 마법사 화면에선 이동 없이 확인만, 이미 확인된 알림 본문 클릭 시 확인 상태 유지
- 근거 요구사항: R16, R17, R25
- 수행 방법: app/pageIntent.tsx `findPageId`·`openTarget`·`useOpenTarget`, NotificationPanel `handleOpen`, App.tsx의 Provider 배치 읽기. `markRead`를 확인된 알림에 실행
- 예상 결과: 기대대로
- 실제 결과:
  - `findPageId`가 `pages.find((p) => p.id === page)`로 찾고, 없으면 `openTarget`이 false를 돌려 navigate하지 않음. 패널은 false면 닫지 않음
  - `PageIntentProvider`는 평소 화면(AppLayout)만 감싸고, 마법사·첫 실행 안내(FullScreen)는 바깥이라 `useOpenTarget`이 `() => false`. NotificationsProvider는 둘 다 감싸므로 확인 처리는 됨
  - `handleOpen`은 `readAt === null`일 때만 확인 처리. `markRead`도 이미 확인된 알림의 readAt을 바꾸지 않음(실행: 원래 시각 유지)
- 판정: 통과
