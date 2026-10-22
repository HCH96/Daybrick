# 지원 관리 (applications) 작업 노트
갱신: 2026-10-23

## 완료
- 이전 계획 10단계 + 사용자 테스트 r1 (archive/plan-initial/)
- 수정 명세 L18 승인, 수정 계획 수정1 승인 (L19)

## 다음 진행
- 1단계: 저장 데이터 v2와 자동 옮기기 (마감일·지원일 속성과 "지원 완료" 일정 없애고 지원 마감 일정으로 옮기기, 달력 R8)
- 수정 계획: 근거 기록 L18, 커밋 접두어 "지원 관리 수정1"
- 관련 결정: D3, D4, D10, D11, D13, D18, D20, D21 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 이 단계에서는 카드 아래쪽 줄 규칙을 바꾸지 않는다(2단계). 마감을 읽는 곳만 속성 → 지원 마감 일정으로 바꾼다.

## 확인할 문서 (경로는 docs/features/applications/ 기준, 파일 통째로 읽기)
- ai/plan/step-01.md
- ai/plan/index.md, ai/plan/structure.md의 "2. 데이터 모양"
- ai/spec/req-properties.md, req-status.md, req-calendar.md, req-schedule.md
- ai/spec/data.md
- ai/logs/L18.md
- human/mockups/calendar.html의 calendar-grid 구역 (CSS: calendar.css·common.css에서 클래스 검색)
