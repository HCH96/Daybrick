# 투데이 (today) 작업 노트
갱신: 2026-11-03

## 완료
- 1단계: 메뉴·저장소 틀 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 2단계: 이번 주 진행 바·칸반 보기 (`tasksInRange`, WeekProgress, 칸반 세 열·카드·빈 열, 카드 누르면 상세 팝업)
- 관련 결정: D1, D2, D3, D4, D5, D7, D8 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `TodayPage.tsx`는 플랜·투데이 둘 다 ready일 때만 틀을 그린다. 위 한 줄은 `section.today-page__week`(높이 54), 칸반 자리는 `section.today-page__kanban`이고 둘 다 공용 `.today-panel`(바탕·테두리)을 쓴다. 오늘 날짜는 `useTodayKey()`의 "YYYY-MM-DD"를 넘겨 쓴다

## 확인할 문서 (경로는 docs/features/today/ 기준, 파일 통째로 읽기)
- ai/plan/step-02.md
- ai/spec/req-page.md
- ai/spec/req-kanban.md
- ai/logs/L05.md
- human/mockups/today.html의 today-week·today-kanban 구역, today-idle.html의 idle-week·idle-kanban 구역 (CSS: today.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 "화면 (pages/today/)" 표 (새 파일 위치를 정할 때만)
