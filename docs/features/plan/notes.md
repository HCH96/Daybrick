# 플랜 (plan) 작업 노트
갱신: 2026-11-02

## 완료
- 이전 계획 9단계 + 테스트 r1 (archive/plan-initial/, L04–L14)
- 명세 수정 r1 반영 (L15), 목업 r2 승인 (L16), 수정 계획 승인 (L17)
- 1단계: 페이지 머리·배치·창 크기 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 2단계: 요일 머리·완료 표시 (영어 요일 한 줄·오늘 알약, 완료는 초록 원+체크, 취소선 빼기, 풍선 안내 줄 지우기)
- 수정 계획: 근거 기록 L15, 커밋 접두어 "플랜 수정1"
- 관련 결정: D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13, D14, D15, D16, D18, D19, D21, D23, D26, D27, D28, D29, D30, D32, D33 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 1단계에서 `WeekCalendar.css` 맨 아래에 `@container plan-week (max-width: 620px)`로 `.plan-day-h` 여백을 줄였다. 요일 머리 모양을 바꿀 때 이 규칙도 함께 맞춘다.

## 확인할 문서 (경로는 docs/features/plan/ 기준, 파일 통째로 읽기)
- ai/plan/step-02.md
- ai/spec/req-calendar.md, ai/spec/req-task-list.md, ai/spec/req-applications.md
- ai/logs/L18.md
- human/mockups/plan.html의 plan-week·plan-sched·plan-bars·plan-list 구역, part-list.html의 list-rows 구역, part-calendar.html의 cal-events 구역 (CSS: plan.css·common.css·parts.css에서 클래스 검색)
