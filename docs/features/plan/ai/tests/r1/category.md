# 카테고리 (req-category)

## A4 색 hex↔hsv 왕복과 색 값 칸
- 테스트 내용: `hexToHsv`↔`hsvToHex` 왕복, `#` 없는 값과 잘못된 값 처리
- 근거 요구사항: R7, L05
- 수행 방법:
  - Node 실행: features/plan/color.ts의 `hexToHsv`, `hsvToHex`, `normalizeHex`
  - 코드 읽기: pages/plan/list/ColorPicker.tsx 색 값 input의 onChange·onBlur
- 예상 결과: `#6C5CE7` → 같은 hex, `6c5ce7`도 받아들이고 잘못된 값이면 마지막 올바른 색 유지
- 실제 결과:
  - `#6C5CE7` 왕복 → `#6C5CE7`. 추가로 검은색·흰색·원색·`#8A8A96` 등 8색도 모두 그대로
  - `normalizeHex("6c5ce7")` → `#6C5CE7`, `"zz12"`·`"6c5ce"` → null
  - ColorPicker: 입력 글자는 그대로 두되 `normalizeHex`가 null이면 빨간 표시만 하고 `onChange`를 부르지 않음(색 유지). 칸을 벗어나면 글자를 마지막 올바른 색으로 되돌림
- 판정: 통과

## A9 카테고리 삭제와 미분류
- 테스트 내용: 카테고리를 지우면 그 태스크가 미분류로, 미분류는 고치기·지우기 불가, 태스크가 없으면 안 보임
- 근거 요구사항: R9, R10
- 수행 방법:
  - Node 실행: reducer `delete-category`, selectors `groupTasksByCategory`
  - 코드 읽기: list/GroupHead.tsx(`fixed`일 때 메뉴 버튼), list/TaskListPanel.tsx(미분류 GroupHead)
- 예상 결과: 태스크 카테고리 null, 미분류에 메뉴 없음
- 실제 결과:
  - 삭제 후 두 태스크 모두 `categoryId: null`, 묶음은 `none` 하나(태스크 2개). 접힘 목록에서도 그 id가 빠짐
  - 미분류 태스크가 없으면 묶음 목록에 `none`이 없음
  - 미분류 GroupHead는 `fixed`로 그려지고, `fixed`면 메뉴(⋯) 버튼을 그리지 않음
- 판정: 통과
