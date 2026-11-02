# 플랜 8단계: 체크리스트

- 요구사항: R37–R38 (영향: R14 목록 진행도, R24 막대 진행도)
- 목업: `popup.html` popup-check 구역, popup-bare 구역(`+ 체크리스트` 버튼), `plan.html` plan-list·plan-bars의 진행도 (CSS: popup.css·plan.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D15

## 할 일
- reducer·store: `create-checklist`(빈 목록), `delete-checklist`(null로), `add-check-item`, `update-check-item`(글자·체크), `delete-check-item`, `move-check-item`(from, to). 모두 `updatedAt` 갱신.
- `detail/Checklist`: 머리 "체크리스트 2/5" + 진행도 막대 + [체크리스트 삭제], 항목 목록, 아래 `+ 항목`. 체크리스트가 null이면 `+ 체크리스트` 버튼만 (R37).
- `detail/ChecklistItemRow`: 체크 상자, 글자(누르면 바로 고치기, Enter로 다음 새 항목, 빈 글자로 포커스 잃으면 지움), 마우스를 올리면 지우기·끌기 손잡이. 순서 바꾸기는 2단계 `useReorder` (R38).
- [체크리스트 삭제]는 항목이 있으면 `ConfirmDialog`로 묻는다 (항목 없으면 바로).
- 진행도 글자 `2/5`: `TaskRow` 아래 줄(R14), `TaskBar` 오른쪽 끝(목업). 항목이 0개면 보이지 않는다.

## 확인할 결과
- `npm run build` 성공.
- 새 태스크 팝업에는 `+ 체크리스트` 버튼만 있고, 누르면 빈 체크리스트가 생긴다.
- 항목 추가(Enter로 연속), 체크, 글자 고치기, 지우기, 끌어서 순서 바꾸기가 되고 다시 열어도 남아 있다.
- 체크할 때마다 머리 진행도와 목록 줄·막대의 `2/5`가 함께 바뀐다.
- [체크리스트 삭제]로 통째로 없어지면 다시 `+ 체크리스트` 버튼으로 돌아간다.

## 이 단계에서 만들거나 고칠 파일
- `apps/desktop/src/features/plan/reducer.ts`, `store.tsx`
- 새 `pages/plan/detail/Checklist.tsx`, `ChecklistItemRow.tsx`
- `pages/plan/detail/TaskDetailModal.tsx`·`TaskDetailModal.css`, `list/TaskRow.tsx`, `calendar/TaskBar.tsx`
