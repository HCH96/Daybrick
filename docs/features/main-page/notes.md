# 메인 페이지 (main-page) 작업 노트
갱신: 2026-11-07

## 완료
- 이전 계획: 처음 6단계 + B안 5단계 + 제목 표시줄 T1~T3, 2차 AI·사용자 테스트 통과 (archive/plans/)
- 1단계: 카드 틀 6개·세 상태 (자동 진행, 최종 테스트 대기)
- 2단계: 다가오는 7일 (자동 진행, 최종 테스트 대기)
- 3단계: 상단 빠른 추가·요약 줄 (자동 진행, 최종 테스트 대기)
- 4단계: 지금 하는 것 (자동 진행, 최종 테스트 대기)
- 5단계: 이번 주 집중 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 6단계: 프로젝트 진행·지원 현황 (features/home/projectRows.ts, ProjectProgressCard·ProjectRow, 지원 현황 2×2 타일)
- 수정 계획: 근거 기록 L34, 커밋 접두어 "메인 페이지 수정1"
- 관련 결정: D1, D3, D4, D11, D12 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 카드 body는 props 없는 `ComponentType`이라 카드가 저장소 훅(`usePlan`·`useToday`·`useTodayKey`)을 직접 부른다. 누적 시간이 실행 중 타이머를 포함하면 5단계 `pages/home/week/WeekFocusCard.tsx`의 `WeekBars`처럼 작은 안쪽 컴포넌트에서만 `useNow(running, 60_000)`를 부른다. projectRows는 Node로 확인한다 (저장소 밖 임시 폴더에서 `npx rolldown <entry.ts> --file out.mjs --format esm --platform node` 후 `node`).

## 확인할 문서 (경로는 docs/features/main-page/ 기준, 파일 통째로 읽기)
- ai/plan/index.md
- ai/plan/step-06.md
- ai/spec/req-home-cards.md
- ai/logs/L41.md
- human/mockups/dash.html의 dash-projects·dash-apps 구역, part-empty.html의 empty-projects 구역 (CSS: dash.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 projectRows.ts·projects/·ApplicationsSummaryCard 줄
