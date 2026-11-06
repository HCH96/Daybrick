# 메인 페이지 (main-page) 작업 노트
갱신: 2026-11-07

## 완료
- 이전 계획: 처음 6단계 + B안 5단계 + 제목 표시줄 T1~T3, 2차 AI·사용자 테스트 통과 (archive/plans/)
- 1단계: 카드 틀 6개·세 상태 (자동 진행, 최종 테스트 대기)
- 2단계: 다가오는 7일 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 3단계: 상단 빠른 추가·요약 줄 (HomePage todayKey, QuickAdd 실제 입력, features/home/summary.ts + SummaryStrip 4칸 연결)
- 수정 계획: 근거 기록 L34, 커밋 접두어 "메인 페이지 수정1"
- 관련 결정: D1, D3, D4, D5, D6, D7, D8, D10, D11, D12, D13 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 카드 body는 props 없는 `ComponentType`이라 2단계 UpcomingCard는 `useTodayKey()`를 직접 부른다. HomePage에서 todayKey를 내려 줄 때 카드 body 모양을 바꾸지 않아도 된다 (바꾸면 dashboardCards.tsx·DashboardCard.tsx를 함께 고칠 것). 다음 일정 계산은 `features/home/upcoming.ts`의 `buildUpcoming`·`shortDateLabel`을 재사용할 수 있다.

## 확인할 문서 (경로는 docs/features/main-page/ 기준, 파일 통째로 읽기)
- ai/plan/index.md
- ai/plan/step-03.md
- ai/spec/req-home.md
- ai/logs/L38.md
- human/mockups/dash.html의 dash-head·dash-summary 구역, part-empty.html의 empty-head 구역 (CSS: dash.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 summary.ts·HomePage·HomeHeader·QuickAdd·SummaryStrip 줄
