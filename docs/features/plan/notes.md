# 플랜 (plan) 작업 노트
갱신: 2026-11-02

## 완료
- 이전 계획 9단계 + 테스트 r1 (archive/plan-initial/, L04–L14)
- 명세 수정 r1 반영 (L15), 목업 r2 승인 (L16), 수정 계획 승인 (L17)
- 1단계: 페이지 머리·배치·창 크기 (자동 진행, 최종 테스트 대기)
- 2단계: 요일 머리·완료 표시 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 3단계: 상세 팝업 틀·Notes·최대화 (팝업 머리·속성 줄·Notes 칸을 지원관리식으로, 최대화 버튼)
- 수정 계획: 근거 기록 L15, 커밋 접두어 "플랜 수정1"
- 관련 결정: D1–D33 모두 (적용이 "이후 전체"). 팝업 핵심은 D16, D17, D20, D24, D25, D26, D32 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 완료 상태 표시는 `StatusDot.css`의 배경 SVG 체크로 바뀌었다(::after 없음). 팝업 상태 칩도 `StatusDot`을 그대로 쓴다.

## 확인할 문서 (경로는 docs/features/plan/ 기준, 파일 통째로 읽기)
- ai/plan/step-03.md
- ai/spec/req-task-detail.md
- ai/logs/L19.md
- human/mockups/popup.html의 popup-head·popup-props·popup-notes·popup-bare 구역, popup-max.html 전체 (CSS: popup.css·common.css에서 클래스 검색)
- apps/desktop/src/pages/applications/detail/ApplicationDetailModal.tsx의 머리·최대화 부분만 (grep `maximized`)
