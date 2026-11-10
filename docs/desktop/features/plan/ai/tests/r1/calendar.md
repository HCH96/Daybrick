# 주간 달력 (req-calendar)

## A6 막대 자리 배치
- 테스트 내용: `layoutWeekBars` 실행 (주 시작 2026-11-02)
- 근거 요구사항: R23, R29
- 수행 방법: Node 실행 (features/plan/weekLayout.ts). 이번 주에 걸리지 않는 10/26–10/28 태스크도 함께 넣음
- 예상 결과: 11/2–11/4, 11/3–11/5, 11/6 → 줄 0,1,0 / 10/30–11/3 → col 0, cutLeft
- 실제 결과: 줄 `a:0, b:1, c:0`, 지난주 태스크는 빠짐. 10/30–11/3은 `col 0, span 2, cutLeft true, cutRight false`
- 판정: 통과

## A7 끌어 놓기 계산
- 테스트 내용: `dragMath`의 옮기기·끝 끌기·하루 미만 방지·목록에서 놓기
- 근거 요구사항: R22, R25, R26
- 수행 방법: Node 실행 (features/plan/dragMath.ts `moveBy`, `resizeEnd`, `resizeStart`, `placeOnDay`)
- 예상 결과: 11/3–11/5 moveBy(+2) → 11/5–11/7, resizeEnd(11/2) → 11/3–11/3, 날짜 없는 태스크 놓기 → 하루짜리
- 실제 결과:
  - moveBy(+2) → 11/5–11/7
  - resizeEnd(11/2) → 11/3–11/3, resizeStart(11/9) → 11/5–11/5 (반대쪽도 멈춤)
  - 날짜 없는 태스크를 11/4에 놓기 → 11/4–11/4, 기간 있는 태스크를 11/6에 놓기 → 11/6–11/8 (길이 유지)
- 판정: 통과

## A18 더블클릭 바로 만들기 제외 대상
- 테스트 내용: 막대·입력칸·지원 일정 알약에서 더블클릭하면 바로 만들기가 열리지 않는지
- 근거 요구사항: R28, L08, L10
- 수행 방법: pages/plan/calendar/WeekCalendar.tsx `handleDoubleClick`, BarLayer.tsx·SchedPill.tsx의 클래스 이름 확인
- 예상 결과: 제외 목록에 들어 있음
- 실제 결과: `target.closest(".plan-tbar, .plan-bars__draft, .plan-ev")`면 return. `.plan-bars__draft`는 바로 만들기 입력칸을 감싼 div(BarLayer), `.plan-ev`는 알약 버튼(SchedPill)의 클래스
- 판정: 통과
