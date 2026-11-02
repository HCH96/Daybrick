# 플랜 (plan) 작업 노트
갱신: 2026-11-02

## 완료
- 이전 계획 9단계 + 테스트 r1 (archive/plan-initial/, L04–L14)
- 명세 수정 r1 반영 (L15), 목업 r2 승인 (L16), 수정 계획 승인 (L17)
- 1단계: 페이지 머리·배치·창 크기 (자동 진행, 최종 테스트 대기)
- 2단계: 요일 머리·완료 표시 (자동 진행, 최종 테스트 대기)
- 3단계: 상세 팝업 틀·Notes·최대화 (자동 진행, 최종 테스트 대기)
- 4단계: 체크리스트 속성 줄·끌기 (자동 진행, 최종 테스트 대기)
- 5단계: 목록 줄 휴지통 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 6단계: 목록 안 카테고리 옮기기 (목록 줄을 다른 카테고리 묶음에 끌어 놓으면 카테고리가 바뀜, 막대 놓기는 날짜만 지움)
- 수정 계획: 근거 기록 L15, 커밋 접두어 "플랜 수정1"
- 관련 결정: D1–D34 모두 (적용이 "이후 전체"). 이 단계 핵심은 D12, D19, D22, D31, D34 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `TaskRow`의 휴지통 버튼은 `pointerdown`을 막으므로 끌기는 줄의 다른 곳에서 시작된다. `DragGhost`는 `plan-task` 모양을 따로 그리므로 휴지통이 없다.

## 확인할 문서 (경로는 docs/features/plan/ 기준, 파일 통째로 읽기)
- ai/plan/step-06.md
- ai/spec/req-task-list.md
- ai/logs/L22.md
- human/mockups/part-row-actions.html의 row-move-cat 구역 (CSS: parts.css·plan.css·common.css에서 클래스 검색)
