# 투데이 (today) 작업 노트
갱신: 2026-11-03

## 완료
- 1단계: 메뉴·저장소 틀 (자동 진행, 최종 테스트 대기)
- 2단계: 이번 주 진행 바·칸반 보기 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 3단계: 타이머 동작·카드 글자 (reducer start·pause·resume·finish, store 동작, 타이머 카드 글자·버튼, 카드 ▶ 동작·막힘 안내)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 카드 ▶는 `kanban/KanbanCard.tsx`의 `kanban-card__play` 버튼(지금은 stopPropagation만)이다. 칸반은 `Kanban`이 `data`·`todayKey`·`onOpenTask`를 받아 `KanbanColumn` → `KanbanCard`로 내려 준다. 타이머 칸은 `TodayPage.tsx`의 `section.today-page__timer`(높이 250)다. 아이콘은 `components/icons/TodayIcons.tsx`에 더한다

## 확인할 문서 (경로는 docs/features/today/ 기준, 파일 통째로 읽기)
- ai/plan/step-03.md
- ai/spec/req-timer.md
- ai/spec/req-kanban.md
- ai/logs/L06.md
- human/mockups/part-timer.html의 timer-running·timer-paused·timer-empty 구역, today.html의 today-timer·today-blocked 구역 (CSS: timer.css·today.css에서 클래스 검색)
- ai/plan/structure.md의 "화면 (pages/today/)" 표 (새 파일 위치를 정할 때만)
