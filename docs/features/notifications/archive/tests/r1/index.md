# 알림 AI 테스트 r1

## 테스트 환경
- 날짜: 2026-10-27, Windows 11, Node v24.20.0, rolldown v1.2.14 (apps/desktop/node_modules)
- 커밋 기준: `1d5c974` (알림 구현 완료)

## 방법
- 빌드: `npm run build`(apps/desktop), `cargo check`(apps/desktop/src-tauri)
- 순수 함수: 임시 폴더의 테스트 스크립트를 rolldown으로 묶어 `TZ=Asia/Seoul node`로 실행 (logic.ts, relativeTime.ts, sourceLabel.ts, notify.ts, NotificationBell.tsx의 badgeText 원문). 스크립트는 저장소에 넣지 않음
- 그 밖: 판정에 필요한 함수·SQL·Rust 코드만 읽어 확인. 앱·서버는 띄우지 않음

## 결과 한눈에 보기
| ID | 항목 | 판정 | 파일 |
|---|---|---|---|
| A1 | 빌드·cargo check | 통과 | common.md |
| A2 | notify() 공용 함수·대기 줄 | 통과 | send.md |
| A3 | 알림 데이터 항목·local- 접두어 | 통과 | send.md |
| A4 | 합치기 세 경우 | 통과 | send.md |
| A5 | 30일 정리 | 통과 | send.md |
| A6 | 하나씩 지우기 없음 | 통과 | send.md |
| A7 | 배지 글자·안 읽음 전체 수 | 통과 | bell.md |
| A8 | 목록 계산(최신순·50개·필터) | 통과 | panel.md |
| A9 | 상대 시각 | 통과 | panel.md |
| A10 | 보낸 기능 이름 | 통과 | send.md |
| A11 | 갈 곳 처리 | 통과 | panel.md |
| A12 | 종 버튼·오른쪽 여백 | 통과 | bell.md |
| A13 | daybrickNotify 개발 모드 전용 | 통과 | common.md |
| A14 | notifications.json 임시 파일 바꿔치기 | 통과 | send.md |
| A15 | 0002_notifications.sql | 통과 | server.md |
| A16 | 서버 받기·정리·사본 | 통과 | server.md |
| A17 | 실시간 구독·다시 받기 | 통과 | server.md |
| A18 | 서버 상태로 알림 안 만듦 | 통과 | server.md |
| A19 | 서버 확인 기록 재시도·되돌리기 | 통과 | server.md |

통과 19 · 실패 0

## 실패 항목
없음

## 참고 사항
- 빌드 시 번들 크기 500kB 초과 경고(기존부터 있던 경고, 실패 아님)
- A15–A19는 코드·SQL을 읽어 판정했다. 실제 Supabase에 적용·실시간 수신은 실행하지 않았다(사용자 테스트에서 확인 필요)
- A11의 마법사 화면 동작은 Provider 배치를 읽어 판정했다. 화면에서 직접 누르지는 않았다
