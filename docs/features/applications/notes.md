# 지원 관리 (applications) 작업 노트
갱신: 2026-10-23

## 완료
- 이전 계획 10단계 + 사용자 테스트 r1 (archive/plan-initial/)
- 수정 명세 L18 승인, 수정 계획 수정1 승인 (L19)
- 1단계: 저장 데이터 v2와 자동 옮기기 (자동 진행, 최종 테스트 대기)
- 2단계: 카드·📅 옆 표시 규칙과 정렬 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 3단계: 📅 창 지원 마감 (종류 버튼 순서, 지원 마감은 카드당 하나라 다시 고르면 날짜만 바꿈 R39, 목록에서 회색)
- 수정 계획: 근거 기록 L18, 커밋 접두어 "지원 관리 수정1"
- 관련 결정: D1, D2, D4, D10, D11, D13, D14, D15, D20, D21 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 1단계에서 `SchedulePopover.tsx`의 KINDS를 이미 `application-due`로 바꿨다(순서·색만 남음). 일정 종류 이름은 `statuses.ts`의 `EVENT_KIND_LABELS`.

## 확인할 문서 (경로는 docs/features/applications/ 기준, 파일 통째로 읽기)
- ai/plan/step-03.md
- ai/plan/index.md
- ai/spec/req-schedule.md
- ai/logs/L21.md
- human/mockups/part-schedule.html의 parts-schedule 구역 (CSS: parts.css·popup.css·common.css에서 클래스 검색)
