# 캘린더 (calendar) 작업 노트
갱신: 2026-11-05

## 완료
- 1단계: 메뉴 교체·개인 일정 저장소 (자동 진행, 최종 테스트 대기)
- 2단계: 월 달력 틀·달 넘김 (자동 진행, 최종 테스트 대기)
- 3단계: 칩 4종과 칸 배치 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 4단계: +N 목록·칩 누르기 (+N을 누르면 칸 아래 250px 목록, 칩 종류별로 플랜 상세·지원 상세·프로젝트 상세 열기)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D11, D12, D13 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 지금 "+N"은 `WeekRow`가 `layout.more`마다 `.cal-more` div(gridRow 5)로 글자만 그린다. 이것을 `MoreButton`으로 바꾸고, 목록은 `more[].items`(그날 칩 전부, 칸 순서)를 쓴다. 칩 4종은 `CalChip`이 `ChipFrameProps`(className·style)를 넘겨 그리므로, 누르기는 `CalChip`에 `onOpen(item)` 같은 콜백을 더해 각 칩 div에 붙이면 된다. 항목 모양 `CalItem`은 features/calendar/items.ts, 기간 표시는 `itemRange(item)`.

## 확인할 문서 (경로는 docs/features/calendar/ 기준, 파일 통째로 읽기)
- ai/plan/step-04.md
- ai/spec/req-page.md (R5), ai/spec/req-chips.md (R19)
- ai/logs/L06.md
- human/mockups/part-more.html의 more 구역 (CSS: parts.css에서 .pop·.day-list 검색, calendar.css의 .more)
