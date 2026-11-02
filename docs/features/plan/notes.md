# 플랜 (plan) 작업 노트
갱신: 2026-11-02

## 완료
- 1단계: 페이지·주 이동·저장소 (자동 진행, 최종 테스트 대기)
- 2단계: 카테고리 (자동 진행, 최종 테스트 대기)
- 3단계: 태스크 목록 (자동 진행, 최종 테스트 대기)
- 4단계: 상세 팝업 기본 (자동 진행, 최종 테스트 대기)
- 5단계: 주간 달력 표시 (자동 진행, 최종 테스트 대기)
- 6단계: 끌어 놓기 (자동 진행, 최종 테스트 대기)
- 7단계: 지원 일정 표시 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 8단계: 체크리스트 (상세 팝업 `detail/Checklist`·`ChecklistItemRow`, reducer 체크리스트 동작, 목록 줄·막대 진행도 `2/5`)
- 관련 결정: D12, D15, D19, D20, D21, D22, 그 밖 이후 전체 D1–D11, D13–D14, D16–D18, D23 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 항목 순서 바꾸기는 2단계 `pages/plan/useReorder.ts`를 그대로 쓴다(export만 grep). 막대 진행도는 `calendar/TaskBar.tsx` 오른쪽 끝, 잘린 쪽 `plan-tbar__cut--r`(margin-left:auto)과 겹치지 않게 순서를 맞춘다. 팝업 체크리스트 자리는 `detail/TaskDetailModal.tsx`에서 메모 위다(목업 popup-check 순서 확인).

## 확인할 문서 (경로는 docs/features/plan/ 기준, 파일 통째로 읽기)
- ai/plan/step-08.md
- ai/spec/req-task-detail.md
- ai/logs/L10.md
- human/mockups/popup.html의 popup-check·popup-bare 구역, plan.html의 plan-list·plan-bars 구역에서 진행도 부분만 (CSS: popup.css·plan.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 `detail/Checklist.tsx` 줄과 `ChecklistItem` 데이터 모양 줄 (새 파일 위치를 정할 때만)
