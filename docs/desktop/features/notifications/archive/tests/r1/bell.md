# 종·배지 (req-bell)

## A7 배지 글자·셈 기준
- 테스트 내용: 배지 글자 함수 0→숨김, 3→"3", 99→"99", 100·120→"99+". 배지 수가 목록 50개가 아니라 저장된 안 읽음 전체인지
- 근거 요구사항: R2–R4
- 수행 방법: NotificationBell.tsx의 비공개 함수 `badgeText` 원문을 정규식으로 꺼내 실행. 안 읽음 120개 목록으로 `countUnread`·`sortForList` 실행. NotificationsProvider에서 `unreadCount: countUnread(all)`(all = 로컬+서버 사본 전체, 50개 자르기 전) 확인
- 예상 결과: 기대대로
- 실제 결과: `[null,"3","99","99+","99+"]`. 120개 → countUnread 120, 목록 50, 배지 "99+". 배지 수는 자르기 전 전체 목록으로 셈
- 판정: 통과

## A12 종 버튼·오른쪽 여백
- 테스트 내용: 종이 `<button>`이고 `data-tauri-drag-region`이 없으며, 오른쪽 여백 4px이 `.notification-bell`에 있는지
- 근거 요구사항: R1
- 수행 방법: NotificationBell.tsx 읽기, components/notifications에서 `data-tauri-drag-region` grep, NotificationBell.css `.notification-bell` 규칙 읽기
- 예상 결과: 맞음
- 실제 결과: `<button type="button" className="... notification-bell">`. 속성으로서의 `data-tauri-drag-region`은 없음(주석 한 줄에만 등장). `.notification-bell { position: relative; flex-shrink: 0; margin-right: 4px; }`
- 판정: 통과
