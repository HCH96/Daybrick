# 지원 관리 (applications) 작업 노트
갱신: 2026-10-23

## 완료
- 이전 계획 10단계 + 사용자 테스트 r1 (archive/plan-initial/)
- 수정 명세 L18 승인, 수정 계획 수정1 승인 (L19)
- 1단계: 저장 데이터 v2와 자동 옮기기 (자동 진행, 최종 테스트 대기)
- 2단계: 카드·📅 옆 표시 규칙과 정렬 (자동 진행, 최종 테스트 대기)
- 3단계: 📅 창 지원 마감 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 4단계: 최대화 움직임 (최대화 순간엔 left 전환 없이 바로 채우고, 최대화 중 사이드바 접고 펼 때만 전환 R13)
- 수정 계획: 근거 기록 L18, 커밋 접두어 "지원 관리 수정1"
- 관련 결정: D2, D4, D5, D6, D8, D10, D11, D13, D15, D17, D18, D19, D20, D21 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 이번 단계는 `components/common/Modal.tsx`·`Modal.css`만 고친다. 다른 기능도 쓰는 공용 컴포넌트라 props 모양은 바꾸지 않는다.

## 확인할 문서 (경로는 docs/features/applications/ 기준, 파일 통째로 읽기)
- ai/plan/step-04.md
- ai/plan/index.md
- ai/spec/req-popup.md
- ai/logs/L22.md
- human/mockups/popup-max.html의 popup-max 구역 (CSS: popup.css·common.css에서 클래스 검색)
