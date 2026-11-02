# 플랜 (plan) 작업 노트
갱신: 2026-11-02

## 완료
- 이전 계획 9단계 + 테스트 r1 (archive/plan-initial/, L04–L14)
- 명세 수정 r1 반영 (L15), 목업 r2 승인 (L16), 수정 계획 승인 (L17)
- 1단계: 페이지 머리·배치·창 크기 (자동 진행, 최종 테스트 대기)
- 2단계: 요일 머리·완료 표시 (자동 진행, 최종 테스트 대기)
- 3단계: 상세 팝업 틀·Notes·최대화 (자동 진행, 최종 테스트 대기)
- 4단계: 체크리스트 속성 줄·끌기 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 5단계: 목록 줄 휴지통 (목록 줄에 마우스를 올리면 휴지통, 팝업 삭제와 같은 확인 창을 거쳐 지움)
- 수정 계획: 근거 기록 L15, 커밋 접두어 "플랜 수정1"
- 관련 결정: D1–D33 모두 (적용이 "이후 전체"). 이 단계 핵심은 D12, D19, D20 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 팝업 삭제 문구는 지금 `TaskDetailModal.tsx`의 `deleteMessage(task)`(Notes와 체크리스트 N개 항목…)와 제목 `"제목" 태스크를 지울까요?`에 있다. step의 "체크리스트·메모" 문구 대신 이것을 함께 쓰도록 한 곳으로 옮긴다 (D26에 따라 "Notes").

## 확인할 문서 (경로는 docs/features/plan/ 기준, 파일 통째로 읽기)
- ai/plan/step-05.md
- ai/spec/req-task-list.md
- ai/logs/L21.md
- human/mockups/part-row-actions.html의 row-trash 구역, part-confirm.html의 confirm-task 구역 (CSS: parts.css·plan.css·common.css에서 클래스 검색)
