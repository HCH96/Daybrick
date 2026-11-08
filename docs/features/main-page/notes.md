# 메인 페이지 (main-page) 작업 노트
갱신: 2026-11-09

## 완료
- 이전 계획: 처음 6단계 + B안 5단계 + 제목 표시줄 T1~T3 (archive/plans/), 홈 개편 수정1 8단계 + AI 테스트 r1 통과 (archive/plan-home-revamp/). 사용자 테스트 r1은 대기
- 홈 다듬기 목업 승인 (L49), 수정 계획 승인 (L50)
- 1단계: 색 A안·지원 현황 칸 (자동 진행, 최종 테스트 대기)
- 2단계: 다가오는 7일 계산 (자동 진행, 최종 테스트 대기)
- 3단계: 다가오는 7일 화면 (자동 진행, 최종 테스트 대기)
- 4단계: 지금 하는 것 타이머 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 5단계: 마무리 (1~4단계에서 고친 CSS를 design-direction.md 규칙으로 다시 보고, files.md에 `UpcomingGap` 추가, build·cargo check)
- 수정 계획: 근거 기록 L49, 커밋 접두어 "메인 페이지 수정2"
- 관련 결정: D1, D3–D19 (D2 제외, 모두 "이후 전체"). 특히 D3(창 크기), D15, D18, D19 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 고친 CSS는 styles/theme.css, pages/home/ 아래 ApplicationsSummaryCard.css·upcoming/Upcoming.css·now/Now.css다 (L51·L53·L54 주요 파일 줄). 창 크기 확인은 화면을 띄우지 말고 /test 체크리스트로 넘긴다. Now.css의 위 띠는 `:has()`로 카드에 `position: relative`를 준다 (L54)

## 확인할 문서 (경로는 docs/features/main-page/ 기준, 파일 통째로 읽기)
- ai/plan/step-05.md
- ai/spec/req-common.md (R19), ai/spec/req-home-upcoming.md (R33), ai/spec/req-home-cards.md (R35, R42)
- ai/logs/L51.md, ai/logs/L53.md, ai/logs/L54.md
- ai/spec/files.md
- docs/common/ai/design/design-direction.md (저장소 루트 기준, 규칙 점검용)
- 목업은 다시 만들 구역이 없어 읽지 않는다. 모양이 의심될 때만 compare-home-timer.html의 tm-running 구역 (CSS: compare.css에서 `.tm-proj` 검색)
