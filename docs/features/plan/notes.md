# 플랜 (plan) 작업 노트
갱신: 2026-11-02

## 완료
- 1단계: 페이지·주 이동·저장소 (자동 진행, 최종 테스트 대기)
- 2단계: 카테고리 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 3단계: 태스크 목록 (빠른 입력·묶음 안 바로 적기, 태스크 줄·상태 표시, 정렬, 완료 접힘, 접기, 미분류 보이기, 빈 목록)
- 관련 결정: D7, D13, D15, 그 밖 이후 전체 D1–D6, D8–D12, D18 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 묶음 머리는 `list/GroupHead.tsx`(접기 화살표·개수 자리 비어 있음, `+`는 disabled로 둠), 묶음은 `list/CategoryGroup.tsx`(머리만 그림, 태스크 줄은 여기 아래에 붙인다). 미분류 묶음은 `TaskListPanel.tsx`에서 `plan-group--none` + `GroupHead fixed`로 그린다. 카테고리 색은 묶음 요소의 `--cat` 변수. 목록 CSS는 `list/TaskList.css`, 버튼은 `plan-btn`·`plan-btn--ghost`·`plan-btn--primary`. 끌기 시작은 `useReorder`의 `startDrag`가 머리 onPointerDown에서 받고, 버튼·입력칸 위에서 누른 것은 무시한다.

## 확인할 문서 (경로는 docs/features/plan/ 기준, 파일 통째로 읽기)
- ai/plan/step-03.md
- ai/spec/req-task-list.md
- ai/spec/req-category.md의 R10 줄 (grep)
- ai/logs/L05.md
- human/mockups/plan.html의 plan-quick·plan-list 구역(태스크 줄·완료 줄), part-list.html의 list-rows·list-inline·list-quickcat 구역, plan-empty.html의 plan-empty-list 구역 (CSS: plan.css·parts.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 "화면 (`pages/plan/`)" 표 (새 파일 위치를 정할 때만)
