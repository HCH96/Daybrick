# 알림 (notifications) 작업 노트
갱신: 2026-10-27

## 완료
- 계획: 구현 계획 8단계 (승인)
- 1단계: 데이터·로컬 저장·보내기 함수 (자동 진행, 최종 테스트 대기)
- 2단계: 종 아이콘·배지 (자동 진행, 최종 테스트 대기)
- 3단계: 펼침 패널과 알림 행 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 4단계: 확인·필터·모두 확인 (✓/↺ 버튼, [전체 | 안 읽음] 필터와 R19 흐리게 남기기, [모두 확인])
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `NotificationPanel`의 필터는 지금 `const filter = "all"` 고정이고, `PanelHead`는 `unreadCount`·`filter`만 받는다(필터 버튼·[모두 확인]에 onClick 없음, [모두 확인]은 0개면 이미 `disabled`). 행 버튼은 `.notification-row__act`(onClick 없음). 동작은 `useNotifications()`의 `markRead`·`markUnread`·`markAllRead`를 쓴다. 패널은 닫히면 언마운트되므로 패널 안 상태는 다시 열 때 자연히 비워진다.

## 확인할 문서 (경로는 docs/features/notifications/ 기준, 파일 통째로 읽기)
- ai/plan/step-04.md
- ai/plan/index.md
- ai/spec/req-panel.md
- ai/logs/L06.md
- human/mockups/panel-states.html의 states-unread·states-all-read 구역 (CSS: notif.css에서 `just-read`·`link-btn.off` 등 클래스 검색)
