# 캘린더 (calendar) 작업 노트
갱신: 2026-11-05

## 완료
- 1단계: 메뉴 교체·개인 일정 저장소 (자동 진행, 최종 테스트 대기)
- 2단계: 월 달력 틀·달 넘김 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 3단계: 칩 4종과 칸 배치 (보이는 기간 항목 모으기·깃발·배지·주 줄 배치 계산, 태스크·지원·깃발·개인 칩)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D11, D12 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `MonthGrid`의 `MonthPage`가 주마다 `WeekRow`(week·todayKey·isFirstWeek)를 그린다. 칩은 `WeekRow`의 `.cal-week` 안, `.cal-week__bg` 다음에 `gridRow` 2~5·`gridColumn`으로 놓는다(D12). 밀려나는 page도 같은 `WeekRow`를 쓰므로 칩 데이터는 `MonthPage`의 index(년·월)로 구한다. 개인 일정은 `useCalendar().state`가 ready일 때 `state.data.events`.

## 확인할 문서 (경로는 docs/features/calendar/ 기준, 파일 통째로 읽기)
- ai/plan/step-03.md
- ai/spec/req-chips.md
- ai/spec/mockup.md (칩 모양·종류 아이콘)
- ai/logs/L05.md
- human/mockups/part-chips.html의 chips-board·chips-app-kinds·chips-badges 구역, calendar.html의 cal-grid 구역 (주 줄 한두 개의 .ch·.more만) (CSS: calendar.css에서 클래스 검색, 아이콘: icons.js의 k-*·f-todo·f-ok)
- ai/plan/structure.md의 "새 데이터·계산 (features/calendar/)" 표와 "2. 데이터 모양" (새 파일 위치·CalItem·WeekLayout 모양)
