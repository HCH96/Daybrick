# 투데이 (today) 작업 노트
갱신: 2026-11-03

## 완료
- 1단계: 메뉴·저장소 틀 (자동 진행, 최종 테스트 대기)
- 2단계: 이번 주 진행 바·칸반 보기 (자동 진행, 최종 테스트 대기)
- 3단계: 타이머 동작·카드 글자 (자동 진행, 최종 테스트 대기)
- 4단계: 종료·강제 종료 복구, 태스크 감시 (자동 진행, 최종 테스트 대기)
- 5단계: 달리기 트랙·애니메이션 (자동 진행, 최종 테스트 대기)
- 6단계: 오늘 요약 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 7단계: 칸반 끌기 (카드를 다른 열로 끌어 상태 바꾸기, 실행 중 카드 처리)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D12, D13 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: step 파일의 "플랜 D12"는 플랜 기능의 결정이다. docs/features/plan/ai/spec/decisions.md에서 `D12.` 줄만 grep으로 읽는다. 칸반은 `pages/today/kanban/`(Kanban → KanbanColumn → KanbanCard, running props), 타이머 완료·중단은 `useToday()`의 `complete`·`stop`
- 주의: 오늘 요약(`pages/today/summary/`)은 플랜 데이터에서 바로 계산하므로 끌기로 상태가 바뀌면 완료 타일도 같이 바뀐다. 따로 손댈 것 없음

## 확인할 문서 (경로는 docs/features/today/ 기준, 파일 통째로 읽기)
- ai/plan/step-07.md
- ai/spec/req-kanban.md
- ai/logs/L10.md
- human/mockups/part-drag.html의 drag-kanban 구역 (CSS: today.css에서 lifted·ghost·drop 등 그 구역에 쓰인 클래스 검색)
- ai/plan/structure.md의 useKanbanDrag·DragCardGhost 줄 (새 파일 위치를 정할 때만)
