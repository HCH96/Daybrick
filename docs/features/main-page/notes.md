# 메인 페이지 (main-page) 작업 노트
갱신: 2026-11-07

## 완료
- 이전 계획: 처음 6단계 + B안 5단계 + 제목 표시줄 T1~T3, 2차 AI·사용자 테스트 통과 (archive/plans/)
- 1단계: 카드 틀 6개·세 상태 (자동 진행, 최종 테스트 대기)
- 2단계: 다가오는 7일 (자동 진행, 최종 테스트 대기)
- 3단계: 상단 빠른 추가·요약 줄 (자동 진행, 최종 테스트 대기)
- 4단계: 지금 하는 것 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 5단계: 이번 주 집중 (features/home/weekFocus.ts 순수 함수, WeekFocusCard 막대·목표선·말풍선 연결)
- 수정 계획: 근거 기록 L34, 커밋 접두어 "메인 페이지 수정1"
- 관련 결정: D1, D3, D4, D5, D6, D7, D8, D10, D11, D12, D13, D14, D15 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 카드 body는 props 없는 `ComponentType`이라 WeekFocusCard는 `useTodayKey()`·`useToday()`를 직접 부른다. 매초 바뀌는 값은 4단계 `pages/home/now/NowTimer.tsx`의 `LiveTimes`처럼 작은 컴포넌트에서만 `useNow`를 부른다 (막대는 1분 간격이면 충분). 실행 중 판정은 `state.data.running?.state === "running"`. 하루 목표는 `today.data.settings.dailyGoalMinutes`. weekFocus는 Node로 step의 예시 데이터를 넣어 확인한다 (저장소 밖 임시 폴더).

## 확인할 문서 (경로는 docs/features/main-page/ 기준, 파일 통째로 읽기)
- ai/plan/index.md
- ai/plan/step-05.md
- ai/spec/req-home-cards.md
- ai/logs/L40.md
- human/mockups/dash.html의 dash-week 구역 (CSS: dash.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 weekFocus.ts·week/ 줄
