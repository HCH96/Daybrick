# 알림 (notifications) 작업 노트
갱신: 2026-10-27

## 완료
- 계획: 구현 계획 8단계 (승인)
- 1단계: 데이터·로컬 저장·보내기 함수 (자동 진행, 최종 테스트 대기)
- 2단계: 종 아이콘·배지 (자동 진행, 최종 테스트 대기)
- 3단계: 펼침 패널과 알림 행 (자동 진행, 최종 테스트 대기)
- 4단계: 확인·필터·모두 확인 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 5단계: 갈 곳 이동 (`app/pageIntent.tsx`의 `openTarget`/`usePageIntent`, 행 본문 누르면 확인 후 이동·패널 닫기)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9, D10 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `NotificationRow`는 지금 `onMarkRead`·`onMarkUnread`만 받고 행 본문(`div.notification-row`)에 onClick이 없다. ✓/↺ 버튼은 이미 `stopPropagation`한다. 본문 클릭 확인도 `NotificationPanel`의 `handleMarkRead`를 거치면 안 읽음 필터의 흐리게 남기기(R19)가 함께 된다. 패널을 닫는 것은 `NotificationPanel`의 `onClose`.

## 확인할 문서 (경로는 docs/features/notifications/ 기준, 파일 통째로 읽기)
- ai/plan/step-05.md
- ai/plan/index.md
- ai/spec/req-panel.md
- ai/spec/req-send.md
- ai/logs/L07.md
- human/mockups/panel.html의 panel-list 구역 (행 클릭 동작만, CSS: notif.css에서 클래스 검색)
- ai/plan/structure.md의 app/pageIntent.tsx 줄 (새 파일 위치를 정할 때만)
