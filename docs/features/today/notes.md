# 투데이 (today) 작업 노트
갱신: 2026-11-03

## 완료
- 1단계: 메뉴·저장소 틀 (자동 진행, 최종 테스트 대기)
- 2단계: 이번 주 진행 바·칸반 보기 (자동 진행, 최종 테스트 대기)
- 3단계: 타이머 동작·카드 글자 (자동 진행, 최종 테스트 대기)
- 4단계: 종료·강제 종료 복구, 태스크 감시 (자동 진행, 최종 테스트 대기)
- 5단계: 달리기 트랙·애니메이션 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 6단계: 오늘 요약 (집중·완료·스트릭 타일, 목표 고치기, 카테고리별 막대, 타임라인)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D12, D13 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 하루 목표는 `state.data.settings.dailyGoalMinutes`이고, 트랙(`pages/today/timer/RunTrack.tsx`)이 이 값을 바로 읽으므로 reducer `set-goal`만 더하면 트랙 진행률도 같이 바뀐다. `dayTotal`·`collectSlices`·`splitByDay`는 `features/today/stats.ts`에 이미 있다(grep으로 export만 확인)

## 확인할 문서 (경로는 docs/features/today/ 기준, 파일 통째로 읽기)
- ai/plan/step-06.md
- ai/spec/req-summary.md
- ai/logs/L09.md
- human/mockups/part-summary.html의 summary-focus·summary-goal·summary-done·summary-category·summary-streak·summary-timeline·summary-streak-mid 구역, today.html의 today-summary·today-streak 구역 (CSS: today.css·parts.css에서 클래스 검색)
- ai/plan/structure.md의 summary/ 줄 (새 파일 위치를 정할 때만)
