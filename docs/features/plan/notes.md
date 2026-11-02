# 플랜 (plan) 작업 노트
갱신: 2026-11-02

## 완료
- 1단계: 페이지·주 이동·저장소 (자동 진행, 최종 테스트 대기)
- 2단계: 카테고리 (자동 진행, 최종 테스트 대기)
- 3단계: 태스크 목록 (자동 진행, 최종 테스트 대기)
- 4단계: 상세 팝업 기본 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 5단계: 주간 달력 표시 (weekLayout, WeekCalendar·DayHeader·BarLayer·TaskBar, 빈 곳 더블클릭 바로 만들기, 막대 클릭 → 팝업, 빈 주 안내)
- 관련 결정: D2, D3, D6, 그 밖 이후 전체 D1, D4, D5, D7–D20 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `PlanPage`에 `openTaskId` state와 `setOpenTaskId`가 이미 있다 → 막대 클릭은 `WeekCalendar`에 `onOpenTask={setOpenTaskId}`를 내려 쓰면 된다. 지금 `PlanPage`의 달력 칸은 `WeekNav` + 빈 `<div className="plan-week" />`(PlanPanelContent 안)이다. 상태 표시는 `StatusDot`(`size="sm"`이 막대용), 막대 제목 짧은 기간 글자는 `format.ts`. 하루짜리 태스크 만들기는 `addTask(title, null, { start: key, end: key })`. 날짜 계산은 `utils/date.ts`의 `addDays`·`diffDays`·`parseDateKey`·`toDateKey`. 카테고리 색은 `features/plan/color.ts`의 `NONE_CATEGORY_COLOR`(미분류).

## 확인할 문서 (경로는 docs/features/plan/ 기준, 파일 통째로 읽기)
- ai/plan/step-05.md
- ai/spec/req-calendar.md
- ai/logs/L07.md
- human/mockups/plan.html의 plan-week·plan-bars 구역, part-calendar.html의 cal-new 구역, plan-empty.html의 plan-empty-cal 구역 (CSS: plan.css·parts.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 "화면 (`pages/plan/`)" 표의 calendar/ 줄과 `features/plan/` weekLayout 줄 (새 파일 위치를 정할 때만)
