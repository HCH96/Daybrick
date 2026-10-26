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
- 7단계: 서버 알림 받기·실시간·사본 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 8단계: 서버 확인 기록·오프라인 (서버 알림 확인·되돌림·모두 확인을 서버 `read_at`에 쓰고, 실패하면 `pendingAcks`에 쌓았다가 연결되면 반영)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9, D11, D12, D13, D14, D15 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 지금 reducer의 `mark-read`·`mark-unread`·`mark-all-read`는 `local`만 바꾼다. 서버 알림(`origin: "server"`)은 `serverCopy`를 바꾸도록 넓혀야 한다. 받기 흐름(`refetch`)은 `useServerNotifications.ts` 안에 있으니 flush를 그 앞에 넣는다. `useServer()`는 `features/server/useServer.ts`, 세션은 `serverSession.client`·`userId`.

## 확인할 문서 (경로는 docs/features/notifications/ 기준, 파일 통째로 읽기)
- ai/plan/step-08.md
- ai/spec/req-server.md
- ai/logs/L10.md
- ai/plan/structure.md의 "1. 파일 목록 > 프론트 로직" 표와 "2. 데이터 모양" 구역 (`PendingAck` 모양)
