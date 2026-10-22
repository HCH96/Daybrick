# 지원 관리 (applications) 작업 노트
갱신: 2026-10-23

## 완료
- 이전 계획 10단계 + 사용자 테스트 r1 (archive/plan-initial/)
- 수정 명세 L18 승인, 수정 계획 수정1 승인 (L19)
- 1단계: 저장 데이터 v2와 자동 옮기기 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 2단계: 카드·📅 옆 표시 규칙과 정렬 (상태별 다음 일정 R38, 📅 옆 같은 규칙 R24, 보이는 날짜 순 정렬 R5)
- 수정 계획: 근거 기록 L18, 커밋 접두어 "지원 관리 수정1"
- 관련 결정: D3, D4, D10, D11, D13, D20, D21 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 1단계에서 `getNextItem(app, today, includeDeadline = true)`로 임시 인자를 두었고 `ScheduleButton`이 false로 부른다. 2단계에서 이 인자를 없애고 R38 규칙으로 합친다.
- 주의: `countEventsThisWeek`(지원 준비 카드의 지원 마감만)와 `getLastEvent`(지원 마감 제외)는 1단계에서 이미 D21대로 바꿨다. 지원 마감 날짜는 `schedule.ts`의 `getApplicationDueDate`로 읽는다.

## 확인할 문서 (경로는 docs/features/applications/ 기준, 파일 통째로 읽기)
- ai/plan/step-02.md
- ai/plan/index.md
- ai/spec/req-page-gallery.md, ai/spec/req-schedule.md
- ai/logs/L20.md
- human/mockups/gallery.html의 gallery-toolbar·gallery-cards 구역 (CSS: gallery.css·common.css에서 클래스 검색)
- human/mockups/popup.html의 popup-status 구역 (CSS: popup.css·common.css에서 클래스 검색)
