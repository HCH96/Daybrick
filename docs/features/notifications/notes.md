# 알림 (notifications) 작업 노트
갱신: 2026-10-27

## 완료
- 계획: 구현 계획 8단계 (승인)
- 1단계: 데이터·로컬 저장·보내기 함수 (자동 진행, 최종 테스트 대기)
- 2단계: 종 아이콘·배지 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 3단계: 펼침 패널과 알림 행 (종을 누르면 여는 패널, 머리·알림 행·빈 상태 모양, 상대 시각)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 종 버튼은 `components/notifications/NotificationBell.tsx`에 있고 지금은 onClick이 없다. 열림 상태 배경은 `.titlebar__button--pressed`와 같은 값(rgba(255,255,255,.08))으로 맞춘다. 목록·안 읽은 수는 `useNotifications()`의 `list`·`unreadCount`를 쓴다.

## 확인할 문서 (경로는 docs/features/notifications/ 기준, 파일 통째로 읽기)
- ai/plan/step-03.md
- ai/plan/index.md
- ai/spec/req-panel.md
- ai/spec/req-send.md
- ai/logs/L05.md
- human/mockups/panel.html의 panel-head·panel-list 구역, panel-states.html의 states-empty·states-empty-unread 구역 (CSS: notif.css·common.css에서 클래스 검색, 아이콘은 icons.js에서 id 검색)
- ai/plan/structure.md의 1절 화면 표 (새 파일 위치를 정할 때만)
