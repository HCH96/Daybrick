# 캘린더 (calendar) 작업 노트
갱신: 2026-11-05

## 완료
- 1단계: 메뉴 교체·개인 일정 저장소 (자동 진행, 최종 테스트 대기)
- 2단계: 월 달력 틀·달 넘김 (자동 진행, 최종 테스트 대기)
- 3단계: 칩 4종과 칸 배치 (자동 진행, 최종 테스트 대기)
- 4단계: +N 목록·칩 누르기 (자동 진행, 최종 테스트 대기)
- 5단계: 개인 일정 입력·편집 (자동 진행, 최종 테스트 대기)
- 6단계: 드래그로 옮기기 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 7단계: 회고 패널 (지난 칸 빈 곳을 누르면 오른쪽 380px 패널에 그날 하루 종일·타임라인·완료 태스크·개인 일정 추가)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13, D14, D15, D16 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 지난 칸 빈 곳 누르기는 지금 `MonthGrid`의 `useRangeSelect` `onClick`에서 `day < todayKey`이면 `setDraft(null)`만 한다. 여기서 회고 날짜를 위로(CalendarPage) 알리게 바꾸면 된다. 패널이 열린 채 오늘·미래 칸을 누르면 패널은 두고 입력칸을 연다.
- 주의: `DayCell`은 지금 `selection`(기간 입력 범위)·`drop`(칩 옮기기) 두 표시를 받는다. 회고로 고른 칸의 회색 테두리는 별도 prop으로 더한다.
- 주의: 칩 누르기는 `CalOpenHandler(item, anchor)`(D15). 패널 안 칩도 이걸로 같은 창을 연다. 패널 안 칩은 드래그를 붙이지 않는다(D16의 `ChipDrag`는 주 줄 칩만).
- 주의: 지원관리 `CalendarView.css`가 `.cal-week`·`.cal-day` 등을 전역으로 정의해 캘린더 칸 모양에 섞일 수 있다(L07 남은 문제).

## 확인할 문서 (경로는 docs/features/calendar/ 기준, 파일 통째로 읽기)
- ai/plan/step-07.md
- ai/spec/req-review.md (R42–R48), ai/spec/req-personal.md (R30만 grep)
- ai/logs/L09.md
- human/mockups/review.html의 review-grid·review-panel·review-allday·review-timeline·review-done·review-add 구역 (CSS: review.css 전체, calendar.css에서 고른 칸 클래스 검색)
- human/mockups/part-review-states.html의 review-empty·review-adding 구역 (CSS: review.css)
- ai/plan/structure.md의 review/ 줄 (새 파일 위치를 정할 때만)
