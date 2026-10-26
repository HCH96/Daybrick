# 알림 (notifications) 작업 노트
갱신: 2026-10-27

## 완료
- 계획: 구현 계획 8단계 (승인)
- 1단계: 데이터·로컬 저장·보내기 함수 (자동 진행, 최종 테스트 대기)
- 2단계: 종 아이콘·배지 (자동 진행, 최종 테스트 대기)
- 3단계: 펼침 패널과 알림 행 (자동 진행, 최종 테스트 대기)
- 4단계: 확인·필터·모두 확인 (자동 진행, 최종 테스트 대기)
- 5단계: 갈 곳 이동 (자동 진행, 최종 테스트 대기)
- 6단계: 서버 구조 0002 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 7단계: 서버 알림 받기·실시간·사본 (`serverSync.ts`·`useServerNotifications.ts`로 받기·30일 정리·실시간 구독·`serverCopy` 반영)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9, D11, D12, D13, D14 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 서버 열 이름은 snake_case(`merge_key`, `read_at` 등)이니 `AppNotification`으로 바꿀 때 옮긴다. `useServer()`·Supabase 클라이언트는 `src/features/server/`에서 export만 grep으로 확인한다.

## 확인할 문서 (경로는 docs/features/notifications/ 기준, 파일 통째로 읽기)
- ai/plan/step-07.md
- ai/spec/req-server.md
- ai/logs/L09.md
- ai/plan/structure.md의 "1. 파일 목록 > 프론트 로직" 표와 "2. 데이터 모양" 구역
- supabase/migrations/0002_notifications.sql (저장소 루트 기준, 열 정의 확인)
