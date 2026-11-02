# 플랜 (plan) 작업 노트
갱신: 2026-11-02

## 완료
- 이전 계획 9단계 + 테스트 r1 (archive/plan-initial/, L04–L14)
- 명세 수정 r1 반영 (L15), 목업 r2 승인 (L16), 수정 계획 승인 (L17)

## 다음 진행
- 1단계: 페이지 머리·배치·창 크기 (제목 Plan, 기간·주 이동·스위치를 제목 줄로, 2:5 배치, 960×640 대응)
- 수정 계획: 근거 기록 L15, 커밋 접두어 "플랜 수정1"
- 관련 결정: D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13, D14, D15, D16, D18, D19, D21, D23, D26, D27, D28, D29, D30, D32 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `formatWeekPeriod`를 지우기 전에 쓰는 곳을 grep으로 확인한다.

## 확인할 문서 (경로는 docs/features/plan/ 기준, 파일 통째로 읽기)
- ai/plan/index.md, ai/plan/step-01.md
- ai/spec/req-page.md, ai/spec/req-window.md
- ai/logs/L17.md
- human/mockups/plan.html의 plan-head·plan-quick·plan-list 구역, plan-narrow.html 전체 (CSS: plan.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 1절 1단계 줄 (고칠 파일 위치를 볼 때만)
