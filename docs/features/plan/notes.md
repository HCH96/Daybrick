# 플랜 (plan) 작업 노트
갱신: 2026-11-02

## 완료
- 이전 계획 9단계 + 테스트 r1 (archive/plan-initial/, L04–L14)
- 명세 수정 r1 반영 (L15), 목업 r2 승인 (L16), 수정 계획 승인 (L17)
- 1단계: 페이지 머리·배치·창 크기 (자동 진행, 최종 테스트 대기)
- 2단계: 요일 머리·완료 표시 (자동 진행, 최종 테스트 대기)
- 3단계: 상세 팝업 틀·Notes·최대화 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 4단계: 체크리스트 속성 줄·끌기 (체크리스트를 속성 줄 마지막 줄로, 항목은 값 칸에 맞춰 들여 쓰고, 끄는 항목이 마우스를 따라오게)
- 수정 계획: 근거 기록 L15, 커밋 접두어 "플랜 수정1"
- 관련 결정: D1–D33 모두 (적용이 "이후 전체"). 이 단계 핵심은 D12, D15, D20, D24 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 속성 줄은 `PropRows.tsx` 안의 `PropRow`(icon·label·children)로 한 줄을 만든다. 체크리스트 줄도 이것을 쓰면 된다. `Checklist`는 지금 `TaskDetailModal`에서 `PropRows` 바로 아래에 있고 예전 머리 줄(`task-detail__sec-head`)을 그대로 쓴다. 머리 줄을 없애면 쓰는 곳이 없어지는 `task-detail__sec-head` CSS도 지운다.

## 확인할 문서 (경로는 docs/features/plan/ 기준, 파일 통째로 읽기)
- ai/plan/step-04.md
- ai/spec/req-task-detail.md
- ai/spec/req-category.md (R8 줄만 grep)
- ai/logs/L20.md
- human/mockups/popup.html의 popup-props 구역(체크리스트 줄만)·popup-check 구역, part-row-actions.html의 row-move-check 구역 (CSS: popup.css·parts.css·common.css에서 클래스 검색)
