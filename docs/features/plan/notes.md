# 플랜 (plan) 작업 노트
갱신: 2026-11-02

## 완료
- 1단계: 페이지·주 이동·저장소 (자동 진행, 최종 테스트 대기)
- 2단계: 카테고리 (자동 진행, 최종 테스트 대기)
- 3단계: 태스크 목록 (자동 진행, 최종 테스트 대기)
- 4단계: 상세 팝업 기본 (자동 진행, 최종 테스트 대기)
- 5단계: 주간 달력 표시 (자동 진행, 최종 테스트 대기)
- 6단계: 끌어 놓기 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 7단계: 지원 일정 표시 (applicationEvents, SchedLayer·SchedPill·SchedTooltip·ScheduleSwitch, 알약 클릭 → 지원관리 상세 팝업)
- 관련 결정: D8, D10, D16, D21, D22, 그 밖 이후 전체 D1–D7, D9, D11–D15, D17–D20 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 일정 층은 `WeekCalendar`의 `.plan-wk-inner` 안 막대 층 위에 넣는다. 알약에서는 `startDrag`를 부르지 않아 끌리지 않게 하고(D22), 알약 위로 끌어도 날짜 계산은 `.plan-cols` x 위치라 그대로 된다. 알약 층이 막대 위쪽 공간을 차지하면 더블클릭 바로 만들기 계산(`handleDoubleClick`의 `.closest` 제외 목록)에 알약 클래스도 넣는다. 지원 상세 팝업 `openApplicationId`는 `PlanPage`의 `PlanDragProvider` 밖(지금 `TaskDetailModal` 옆)에 둔다.

## 확인할 문서 (경로는 docs/features/plan/ 기준, 파일 통째로 읽기)
- ai/plan/step-07.md
- ai/spec/req-applications.md
- ai/logs/L09.md
- docs/features/applications/ai/spec/req-schedule.md (저장소 기준 경로, 일정 규칙 R23–R27·R39 줄만)
- human/mockups/plan.html의 plan-sched·plan-calbar 구역, part-calendar.html의 cal-events 구역, plan-empty.html의 plan-empty-cal 구역 (CSS: plan.css·parts.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 calendar/ Sched·ScheduleSwitch 줄과 `features/plan/applicationEvents.ts` 줄 (새 파일 위치를 정할 때만)
