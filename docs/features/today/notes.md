# 투데이 (today) 작업 노트
갱신: 2026-11-03

## 완료
- 1단계: 메뉴·저장소 틀 (자동 진행, 최종 테스트 대기)
- 2단계: 이번 주 진행 바·칸반 보기 (자동 진행, 최종 테스트 대기)
- 3단계: 타이머 동작·카드 글자 (자동 진행, 최종 테스트 대기)
- 4단계: 종료·강제 종료 복구, 태스크 감시 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 5단계: 달리기 트랙·애니메이션 (타이머 카드 오른쪽 하루 목표 트랙·캐릭터·골인·일시정지 장면, 애니메이션 줄이기)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D12, D13 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 오늘 전체 기록 시간·태스크 누적은 3단계 `features/today/stats.ts`의 함수를 grep으로 찾아 쓴다. 타이머 카드 테두리·바탕은 `today-panel`이 그리고 `TimerCard.css`는 안쪽만 그린다(L07). 실행 중 타이머는 store `state.data.running`에서 본다

## 확인할 문서 (경로는 docs/features/today/ 기준, 파일 통째로 읽기)
- ai/plan/step-05.md
- ai/spec/req-timer.md
- ai/spec/timer-visual.md
- ai/logs/L08.md
- human/mockups/part-timer.html의 timer-running·timer-paused·timer-empty 구역, part-timer-goal.html의 timer-goal·timer-goal-paused 구역, today-idle.html의 idle-timer 구역 (CSS: timer.css에서 클래스 검색, 캐릭터: sprites.js에서 run1·run2·sit·cheer·stand 검색)
- ai/plan/structure.md의 "timer/RunTrack.tsx" 줄 (새 파일 위치를 정할 때만)
