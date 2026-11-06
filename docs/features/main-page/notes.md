# 메인 페이지 (main-page) 작업 노트
갱신: 2026-11-07

## 완료
- 이전 계획: 처음 6단계 + B안 5단계 + 제목 표시줄 T1~T3, 2차 AI·사용자 테스트 통과 (archive/plans/)
- 1단계: 카드 틀 6개·세 상태 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 2단계: 다가오는 7일 (buildUpcoming 순수 함수 + UpcomingCard로 다가오는 7일 body 교체)
- 수정 계획: 근거 기록 L34, 커밋 접두어 "메인 페이지 수정1"
- 관련 결정: D1, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: large 카드 본문은 이미 `dashboard-card__scroll`(absolute, overflow auto, flex column) 안에 그려진다. UpcomingCard는 이 칸을 채우기만 하면 된다. 빈 상태는 `CardState kind="empty"`를 쓴다 (props는 CardState.tsx의 CardStateProps).

## 확인할 문서 (경로는 docs/features/main-page/ 기준, 파일 통째로 읽기)
- ai/plan/index.md
- ai/plan/step-02.md
- ai/spec/req-home-upcoming.md
- ai/logs/L37.md
- human/mockups/dash.html의 dash-upcoming 구역 (CSS: dash.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 features/home/·pages/home/upcoming 줄과 "데이터 모양" 구역
