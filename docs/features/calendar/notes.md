# 캘린더 (calendar) 작업 노트
갱신: 2026-11-05

## 완료
- 1단계: 메뉴 교체·개인 일정 저장소 (자동 진행, 최종 테스트 대기)
- 2단계: 월 달력 틀·달 넘김 (자동 진행, 최종 테스트 대기)
- 3단계: 칩 4종과 칸 배치 (자동 진행, 최종 테스트 대기)
- 4단계: +N 목록·칩 누르기 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 5단계: 개인 일정 입력·편집 (빈 곳 누르기·드래그로 입력, 개인 칩 누르면 편집 팝오버·삭제 확인)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13, D14 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 개인 칩 누르기는 `CalendarPage`의 `openItem`에서 `item.kind === "personal"`만 아직 아무 동작이 없다. 여기서 편집 팝오버를 열면 되고, 팝오버 anchor가 필요하면 `CalOpenHandler`에 누른 칩 요소를 함께 넘기도록 바꾼다(쓰는 곳: CalChip·MoreList·WeekRow·MonthGrid). 칩은 지금 `onClick`만 받으므로 D10의 "칩에서 시작하면 옮기기"는 6단계 몫이고, 빈 곳 판정은 칩·`.cal-week-more`가 아닌 곳으로 한다.
- 주의: 지원관리 `CalendarView.css`가 `.cal-week`·`.cal-day` 등을 전역으로 정의해 캘린더 칸 모양에 섞일 수 있다(L07 남은 문제). 칸 높이·클릭 영역이 이상하면 이것부터 의심한다.

## 확인할 문서 (경로는 docs/features/calendar/ 기준, 파일 통째로 읽기)
- ai/plan/step-05.md
- ai/spec/req-personal.md (R23–R29)
- ai/logs/L07.md
- human/mockups/part-personal.html의 personal-quick·personal-range·personal-edit·personal-delete 구역 (CSS: parts.css에서 그 구역에 쓰인 클래스 검색)
- ai/plan/structure.md의 personal/·grid/useRangeSelect·features/calendar/personalForm 줄 (새 파일 위치를 정할 때만)
