# 메인 페이지 (main-page) 작업 노트
갱신: 2026-11-09

## 완료
- 이전 계획: 처음 6단계 + B안 5단계 + 제목 표시줄 T1~T3 (archive/plans/), 홈 개편 수정1 8단계 + AI 테스트 r1 통과 (archive/plan-home-revamp/). 사용자 테스트 r1은 대기
- 홈 다듬기 목업 승인 (L49), 수정 계획 승인 (L50)
- 1단계: 색 A안·지원 현황 칸 (자동 진행, 최종 테스트 대기)
- 2단계: 다가오는 7일 계산 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 3단계: 다가오는 7일 화면 (`groupUpcoming` 결과로 날짜 열 + 칩 + 빈 날 합친 줄을 그리고 Upcoming.css를 다시 씀)
- 수정 계획: 근거 기록 L49, 커밋 접두어 "메인 페이지 수정2"
- 관련 결정: D6, D11, D13, D19 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 2단계 함수는 `features/home/upcoming.ts`의 `dayParts(dateKey, todayKey)`·`groupUpcoming(days)`·`gapLabel(from, to)`와 타입 `DayParts`·`UpcomingBlock`. `dayParts`의 `weekend`는 오늘·내일에도 붙으니 오늘 묶음은 `--accent`를 먼저 적용한다. 색·크기는 theme.css 토큰만 쓴다

## 확인할 문서 (경로는 docs/features/main-page/ 기준, 파일 통째로 읽기)
- ai/plan/step-03.md
- ai/spec/req-home-upcoming.md (R29–R34)
- ai/logs/L52.md
- ai/plan/structure.md의 "컴포넌트 구조" 절 (UpcomingGap.tsx 위치 확인)
- human/mockups/compare-home-cards.html의 cmp-v1-upcoming 구역 (CSS: compare.css에서 `u1-day`·`u1-date`·`u1-list`·`u1-gap`·`chip`·`iniB`·`ddot` 클래스 검색)
