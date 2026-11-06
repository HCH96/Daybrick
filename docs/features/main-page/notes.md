# 메인 페이지 (main-page) 작업 노트
갱신: 2026-11-07

## 완료
- 이전 계획: 처음 6단계 + B안 5단계 + 제목 표시줄 T1~T3, 2차 AI·사용자 테스트 통과 (archive/plans/)
- 1단계: 카드 틀 6개·세 상태 (자동 진행, 최종 테스트 대기)
- 2단계: 다가오는 7일 (자동 진행, 최종 테스트 대기)
- 3단계: 상단 빠른 추가·요약 줄 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 4단계: 지금 하는 것 (kanbanOrder.ts로 칸반 순서 옮기기, NowCard·NowTimer·NowTaskList 연결)
- 수정 계획: 근거 기록 L34, 커밋 접두어 "메인 페이지 수정1"
- 관련 결정: D1, D3, D4, D5, D6, D7, D8, D10, D11, D12, D13, D14 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 카드 body는 props 없는 `ComponentType`이라 NowCard는 `useTodayKey()`를 직접 부른다. 경과 시계처럼 매초 바뀌는 글자는 3단계 SummaryStrip의 FocusItem처럼 작은 컴포넌트 안에서만 `useNow`를 부른다. 실행 중 판정은 `state.data.running?.state === "running"`(일시정지는 "paused").

## 확인할 문서 (경로는 docs/features/main-page/ 기준, 파일 통째로 읽기)
- ai/plan/index.md
- ai/plan/step-04.md
- ai/spec/req-home-cards.md
- ai/logs/L39.md
- human/mockups/part-now.html의 now-running·now-paused·now-tasks·now-empty 구역, dash.html의 dash-now 구역 (CSS: dash.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 kanbanOrder.ts·now/ 줄
