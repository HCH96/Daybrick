# 알림 (notifications) 작업 노트
갱신: 2026-10-27

## 완료
- 계획: 구현 계획 8단계 (승인)
- 1단계: 데이터·로컬 저장·보내기 함수 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 2단계: 종 아이콘·배지 (제목 표시줄에 종 버튼과 안 읽은 수 배지, 단순 버전 제목 표시줄 포함)
- 관련 결정: D1, D2, D3, D5, D6, D8, D9 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 안 읽은 수는 `useNotifications()`의 `unreadCount`를 쓴다 (features/notifications/useNotifications.ts에서 export만 grep).

## 확인할 문서 (경로는 docs/features/notifications/ 기준, 파일 통째로 읽기)
- ai/plan/step-02.md
- ai/plan/index.md
- ai/spec/req-bell.md
- ai/logs/L04.md
- human/mockups/bell.html의 bell-states 구역 (CSS: notif.css·common.css에서 클래스 검색, 종 모양은 icons.js에서 id 검색)
- ai/plan/structure.md의 1절 화면 표 (새 파일 위치를 정할 때만)
