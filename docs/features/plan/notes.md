# 플랜 (plan) 작업 노트
갱신: 2026-11-02

## 완료
- 1단계: 페이지·주 이동·저장소 (자동 진행, 최종 테스트 대기)
- 2단계: 카테고리 (자동 진행, 최종 테스트 대기)
- 3단계: 태스크 목록 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 4단계: 상세 팝업 기본 (update-task·delete-task, TaskDetailModal·PropRows·PeriodField, 메모, 삭제 확인, 줄 클릭 → 팝업)
- 관련 결정: D2, D10, D17, D19, 그 밖 이후 전체 D1, D3–D9, D11–D16, D18 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `TaskRow`는 `onOpen?: (id) => void`를 이미 받는다(주면 줄에 `plan-task--clickable`). 지금은 `list/GroupTasks.tsx`(열린 줄)와 `list/DoneFold.tsx`(완료 줄)가 `onOpen`을 넘기지 않으니, `PlanPage`의 `openTaskId` 설정 함수를 `TaskListPanel` → `CategoryGroup`·`UncategorizedGroup`(TaskListPanel.tsx 안) → `GroupTasks` → `TaskRow`·`DoneFold`로 내려 준다. 상태 표시는 `pages/plan/StatusDot.tsx`(`status`, `size`, `onCycle` 주면 버튼). 짧은 기간 글자는 `format.ts`의 `formatShortRange`. 상태 돌리기의 완료 시각 처리는 reducer의 `cycle-status`를 참고해 `update-task`도 같게 맞춘다. 미분류 점 색은 `#8a8a96`(QuickAdd의 `NONE_COLOR`, `plan-cat-dot`·`plan-cat-dot--ring` 클래스는 TaskList.css).

## 확인할 문서 (경로는 docs/features/plan/ 기준, 파일 통째로 읽기)
- ai/plan/step-04.md
- ai/spec/req-task-detail.md
- ai/spec/req-task-list.md의 R20 줄 (grep)
- ai/logs/L06.md
- human/mockups/popup.html의 popup-head·popup-props·popup-memo·popup-foot·popup-bare 구역, part-confirm.html의 confirm-task 구역 (CSS: popup.css·parts.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 "화면 (`pages/plan/`)" 표의 detail/ 줄 (새 파일 위치를 정할 때만)
