# 캘린더 (calendar) 작업 노트
갱신: 2026-11-05

## 완료
- 1단계: 메뉴 교체·개인 일정 저장소 (자동 진행, 최종 테스트 대기)
- 2단계: 월 달력 틀·달 넘김 (자동 진행, 최종 테스트 대기)
- 3단계: 칩 4종과 칸 배치 (자동 진행, 최종 테스트 대기)
- 4단계: +N 목록·칩 누르기 (자동 진행, 최종 테스트 대기)
- 5단계: 개인 일정 입력·편집 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 6단계: 드래그로 옮기기 (태스크·개인 칩을 끌어 다른 날로 옮기고 튀어오름, 지원·깃발은 흔들림)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13, D14, D15 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 칩은 지금 `onClick(e)`로 `onOpen(item, e.currentTarget)`을 부른다. 칩 드래그를 붙일 때 4px 넘게 움직였으면 뒤따르는 click을 막아야 편집 팝오버·상세가 열리지 않는다. 빈 곳 드래그(`useRangeSelect`)는 `.cal-chip`에서는 시작하지 않으므로 칩 드래그와 겹치지 않는다.
- 주의: step-06은 "포인터 아래 칸은 `data-day`로 찾는다"고 하지만, 5단계는 `.cal-week[data-week]` 너비를 7로 나눠 칸을 찾는다(`useRangeSelect`의 `dayAt`, D15). 같은 방식을 가져다 쓰면 DayCell에 속성을 더하지 않아도 된다.
- 주의: "드래그 중에는 +N 목록·입력칸을 닫는다": 입력칸은 `MonthGrid`의 `draft` 상태(mousedown 때 열린 입력칸 포커스를 놓게 해 취소됨), +N 목록은 `MoreButton` 안 상태다.
- 주의: 지원관리 `CalendarView.css`가 `.cal-week`·`.cal-day` 등을 전역으로 정의해 캘린더 칸 모양에 섞일 수 있다(L07 남은 문제).

## 확인할 문서 (경로는 docs/features/calendar/ 기준, 파일 통째로 읽기)
- ai/plan/step-06.md
- ai/spec/req-interaction.md (R35–R40)
- ai/logs/L08.md
- human/mockups/part-drag.html의 drag-move·drag-bounce·drag-locked 구역 (CSS: parts.css에서 그 구역에 쓰인 클래스 검색)
- ai/plan/structure.md의 drag/ 줄 (새 파일 위치를 정할 때만)
