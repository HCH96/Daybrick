# 플랜 수정1 4단계: 체크리스트 속성 줄·끌기

- 요구사항: R37, R38 (영향: R8)
- 목업: `popup.html` popup-props·popup-check 구역, `part-row-actions.html` row-move-check 구역 (CSS: popup.css·parts.css·common.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D12, D15, D20, D24(L17에서 변경)

## 할 일
- 체크리스트 속성 줄 (R37): `PropRows` 마지막 줄 "체크리스트". 없으면 `+ 체크리스트` 글자 버튼(`createChecklist`), 있으면 `1/3` + 80px 진행 막대(`checklistProgress`).
- 항목 목록 (R38): 속성 줄 아래, 값 칸(150px)에 맞춰 들여 씀. 체크·고치기·지우기는 그대로, 체크한 항목은 흐리게만. 맨 아래 "항목 추가", 오른쪽 "체크리스트 삭제"(`deleteChecklist`). 예전 `Checklist`의 머리 줄은 없앤다.
- `useReorder`에 `follow` 옵션: 끄는 동안 잡은 항목이 살짝 기울어 마우스를 따라오고(포인터 이동량을 `transform`으로), 원래 자리는 점선, 놓일 자리는 보라 선. 카테고리 순서 바꾸기(`TaskListPanel`)는 옵션 없이 불러 예전 모양을 유지한다(R8).

## 확인할 결과
- `npm run build` 성공.
- 체크리스트가 없는 태스크는 속성 줄에 `+ 체크리스트`만 있고, 누르면 빈 항목이 생기며 줄이 `0/1` + 진행 막대로 바뀐다. 체크하면 숫자·막대·목록 줄·달력 막대 진행도가 함께 바뀐다.
- 항목이 속성 값 칸과 같은 위치에서 시작한다. "항목 추가"는 맨 아래, "체크리스트 삭제"를 누르면 체크리스트가 통째로 사라진다.
- 항목을 끌면 잡은 항목이 기울어진 채 마우스를 따라오고, 원래 자리에 점선, 놓일 자리에 보라 선이 보인다. 놓으면 순서가 바뀌고 다시 열어도 유지된다.
- 카테고리 줄 순서 바꾸기는 예전과 똑같이 움직인다.

## 이 단계에서 고칠 파일
- `apps/desktop/src/pages/plan/detail/Checklist.tsx`, `ChecklistItemRow.tsx`, `Checklist.css`, `PropRows.tsx`, `TaskDetailModal.tsx`
- `pages/plan/useReorder.ts`
