# 플랜 수정1 5단계: 목록 줄 휴지통

- 요구사항: R44 (영향: R40)
- 목업: `part-row-actions.html` row-trash 구역, `part-confirm.html` confirm-task 구역 (CSS: parts.css·plan.css·common.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D12, D19

## 할 일
- `list/TaskRow`: 마우스를 올리면 줄 오른쪽에 휴지통 버튼(`TrashIcon`), 그 위에서는 빨갛게. 누르면 `ConfirmDialog`(R40과 같은 문구 "'제목' 태스크를 지울까요?", "체크리스트·메모도 함께 지워집니다"), 확인하면 `deleteTask`.
- 휴지통 누름은 줄 클릭(팝업 열기, R20)과 끌기 시작(D12)으로 번지지 않게 막는다 (`stopPropagation`, `pointerdown`도).
- 문구는 팝업 삭제와 한 곳에서 만든다 (같은 함수 또는 상수).

## 확인할 결과
- `npm run build` 성공.
- 목록 줄에 마우스를 올리면 휴지통이 보이고, 휴지통 위에서 빨개진다. 마우스를 떼면 사라진다.
- 휴지통을 누르면 팝업 삭제와 같은 확인 창이 뜨고, 취소하면 그대로, 삭제하면 줄과 달력 막대가 함께 사라진다.
- 휴지통을 눌러도 상세 팝업이 열리지 않고, 줄을 끌어 달력에 놓기는 그대로 된다.

## 이 단계에서 고칠 파일
- `apps/desktop/src/pages/plan/list/TaskRow.tsx`, `list/TaskList.css`
- `pages/plan/detail/TaskDetailModal.tsx` (삭제 문구를 함께 쓸 때)
