# 알림 (notifications) 작업 노트
갱신: 2026-10-27

## 완료
- 계획: 구현 계획 8단계 (승인)
- 1단계: 데이터·로컬 저장·보내기 함수 (자동 진행, 최종 테스트 대기)
- 2단계: 종 아이콘·배지 (자동 진행, 최종 테스트 대기)
- 3단계: 펼침 패널과 알림 행 (자동 진행, 최종 테스트 대기)
- 4단계: 확인·필터·모두 확인 (자동 진행, 최종 테스트 대기)
- 5단계: 갈 곳 이동 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 6단계: 서버 구조 0002 (`supabase/migrations/0002_notifications.sql`로 테이블·인덱스·RLS·`daybrick_notify`·실시간 발행을 만들고 `migrations.rs`에 2번 추가)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D13 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 0001 SQL은 고치지 않는다. RLS 작성 방식과 단계 규칙은 `supabase/migrations/0001_*.sql`과 `src-tauri/src/server/migrations.rs` 머리 주석을 grep으로 확인한다. Rust를 고치므로 `cargo check`도 한다.

## 확인할 문서 (경로는 docs/features/notifications/ 기준, 파일 통째로 읽기)
- ai/plan/step-06.md
- ai/spec/req-server.md
- ai/logs/L08.md
- ai/plan/structure.md의 "1. 파일 목록 > 서버" 줄과 "2. 데이터 모양" 구역 (열 정의)
