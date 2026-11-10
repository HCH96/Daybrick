# 플랜 2단계: 카테고리

- 요구사항: R6–R10
- 목업: `part-list.html` list-menu·list-catform·list-reorder 구역, `part-confirm.html` confirm-cat 구역, `plan.html` plan-list의 묶음 머리 (CSS: parts.css·plan.css·common.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D5, D9, D10, D12, D15

## 할 일
- reducer·store: `add-category`, `update-category`(이름·색), `move-category`(from, to), `delete-category`(그 안의 태스크 `categoryId` → null, D5), `push-recent-color`(맨 앞에 넣고 중복 제거, 최대 8개).
- `color.ts`: `hexToHsv`, `hsvToHex`, `isHexColor`.
- `list/ColorPicker`: 큰 견본, 색 평면(채도·밝기), 색상 막대, 색 값 입력(잘못된 값이면 빨간 테두리, 적용 안 함), 최근 쓴 색. 평면·막대는 포인터 이벤트로 끈다.
- `list/CategoryForm`: `Popover` 안에 이름 + 색 선택기 + [만들기]/[저장]. 빈 이름이면 버튼을 막는다. 저장하면 그 색을 최근 쓴 색에 넣는다.
- `list/GroupHead`: 접기 화살표 자리, 색 점, 이름, 개수 자리(3단계에서 채움). `…`·`+`는 마우스를 올렸을 때만 (`+` 동작은 3단계).
- `list/CategoryMenu`: [이름·색 고치기] → CategoryForm, [삭제] → `ConfirmDialog`("'C++ 공부' 카테고리를 지울까요?", "태스크 N개는 미분류로 옮겨집니다", 빨간 삭제).
- `useReorder.ts`: 세로 목록 끌어 순서 바꾸기 훅 (4px 넘게 움직이면 시작, 놓일 자리 줄 표시, 놓으면 `onMove(from, to)`). 카테고리 머리를 끌어 순서를 바꾼다 (R8).
- 미분류 (R10): 맨 아래 고정, 테두리만 있는 점, `…` 없음, 끌 수 없음. 태스크가 없으면 숨김 (태스크 표시는 3단계라 이 단계에서는 항상 숨김).
- 목록 아래 `+ 카테고리 추가` (R7).

## 확인할 결과
- `npm run build` 성공.
- 카테고리를 만들고(색 평면·막대·색 값·최근 색 모두로 색 고르기), `…`로 이름·색을 고치고, 끌어서 순서를 바꾸고, 확인 창을 거쳐 지울 수 있다.
- 앱을 껐다 켜도 카테고리·순서·최근 쓴 색이 남아 있고, 앱 데이터 폴더에 `plan.json`이 생긴다.
- Node로 `hexToHsv`·`hsvToHex` 왕복: `#6C5CE7` → hsv → 같은 hex.

## 이 단계에서 만들거나 고칠 파일
- `apps/desktop/src/features/plan/reducer.ts`, `store.tsx`, 새 `color.ts`
- 새 `apps/desktop/src/pages/plan/useReorder.ts`
- 새 `pages/plan/list/CategoryGroup.tsx`, `GroupHead.tsx`, `CategoryMenu.tsx`, `CategoryForm.tsx`, `ColorPicker.tsx`·`ColorPicker.css`, `TaskList.css`
- `pages/plan/list/TaskListPanel.tsx`
