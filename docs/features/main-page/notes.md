# 메인 페이지 (main-page) 작업 노트
갱신: 2026-11-09

## 완료
- 이전 계획: 처음 6단계 + B안 5단계 + 제목 표시줄 T1~T3 (archive/plans/), 홈 개편 수정1 8단계 + AI 테스트 r1 통과 (archive/plan-home-revamp/). 사용자 테스트 r1은 대기
- 홈 다듬기 목업 승인 (L49), 수정 계획 승인 (L50)
- 1단계: 색 A안·지원 현황 칸 (자동 진행, 최종 테스트 대기)
- 2단계: 다가오는 7일 계산 (자동 진행, 최종 테스트 대기)
- 3단계: 다가오는 7일 화면 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 4단계: 지금 하는 것 타이머 (`NowTimer.tsx` 배치를 T1으로 바꾸고 묶음 색 `--tc`를 띠·시계 바탕·초·막대에 씀, `Now.css`의 `.now-timer` 부분만 고침)
- 수정 계획: 근거 기록 L49, 커밋 접두어 "메인 페이지 수정2"
- 관련 결정: D4, D11, D15, D18 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 색은 theme.css 토큰만 쓰고, 묶음 색만 인라인 `--tc`로 넘긴다 (plan/index.md 작은 규칙). 띠는 `box-shadow: inset 0 3px 0 <색>`

## 확인할 문서 (경로는 docs/features/main-page/ 기준, 파일 통째로 읽기)
- ai/plan/step-04.md
- ai/spec/req-home-cards.md (R35)
- ai/logs/L53.md
- human/mockups/compare-home-timer.html의 tm-running·tm-paused 구역, compare-home-cards.html의 cmp-v1-now 구역 (CSS: compare.css에서 `.n1-`·`.tm-`로 시작하는 클래스 중 구역에 실제로 쓰인 이름 검색)
