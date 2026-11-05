# 캘린더 (calendar) 작업 노트
갱신: 2026-11-05

## 완료
- 1단계: 메뉴 교체·개인 일정 저장소 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 2단계: 월 달력 틀·달 넘김 (머리 [<] 년월 [>] [오늘], 7열 5~6주 그리드, 칸 모양, 달 넘김 애니메이션)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D11 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `CalendarPage`는 지금 제목·읽는 중/실패 안내만 있다(`useCalendar().state`). 머리 클래스는 `calendar-page__head`·`__title`. 오늘 날짜는 `features/today/useTodayKey`, 그리드는 `utils/calendarGrid.ts`의 `getMonthGrid`.

## 확인할 문서 (경로는 docs/features/calendar/ 기준, 파일 통째로 읽기)
- ai/plan/step-02.md
- ai/spec/req-page.md, ai/spec/req-interaction.md (R41)
- ai/logs/L04.md
- human/mockups/calendar.html의 cal-head·cal-grid 구역 (칩은 3단계라 날짜 칸·주 줄 틀만), part-flip.html의 flip 구역 (CSS: calendar.css·parts.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 "새 화면 (pages/calendar/)" 표와 3절 컴포넌트 구조 (새 파일 위치)
