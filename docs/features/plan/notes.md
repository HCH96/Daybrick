# 플랜 (plan) 작업 노트
갱신: 2026-11-02

## 완료
- 1단계: 페이지·주 이동·저장소 (자동 진행, 최종 테스트 대기)
- 2단계: 카테고리 (자동 진행, 최종 테스트 대기)
- 3단계: 태스크 목록 (자동 진행, 최종 테스트 대기)
- 4단계: 상세 팝업 기본 (자동 진행, 최종 테스트 대기)
- 5단계: 주간 달력 표시 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 6단계: 끌어 놓기 (dragMath, PlanDragProvider·usePlanDrag·DragGhost, 목록→달력·막대 옮기기·끝 끌기·막대→목록 날짜 지우기)
- 관련 결정: D2, D12, D21, 그 밖 이후 전체 D1, D3–D11, D13–D20 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 막대 클릭은 지금 `TaskBar`의 `<button onClick>`으로 팝업을 연다 → 끌기(4px)와 클릭을 가르도록 바꿔야 한다. 막대 층(`.plan-bars`)이 세로줄(`.plan-cols i[data-day]`) 위를 덮으므로 놓을 날짜는 `elementFromPoint`보다 `.plan-cols` 사각형 기준 x 위치로 계산하는 편이 쉽다 (WeekCalendar의 더블클릭 계산과 같은 방식). 목록 줄은 `list/TaskRow.tsx`, 기간 바꾸기는 `updateTask(id, { start, end })`.

## 확인할 문서 (경로는 docs/features/plan/ 기준, 파일 통째로 읽기)
- ai/plan/step-06.md
- ai/spec/req-calendar.md
- ai/logs/L08.md
- human/mockups/part-calendar.html의 cal-drag·cal-move·cal-resize 구역, part-list.html의 list-drop 구역 (CSS: parts.css·plan.css에서 클래스 검색)
- ai/plan/structure.md의 "화면 (`pages/plan/`)" 표의 drag/ 줄과 `features/plan/` dragMath 줄 (새 파일 위치를 정할 때만)
