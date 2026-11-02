# 플랜 수정1 3단계: 상세 팝업 틀·Notes·최대화

- 요구사항: R36, R42, R43 (영향: R35, R39, R41)
- 목업: `popup.html` popup-head·popup-props·popup-notes·popup-bare 구역, `popup-max.html` 전체 (CSS: popup.css·common.css)
- 참고 코드: `pages/applications/detail/ApplicationDetailModal.tsx`의 머리·최대화 부분만 (grep `maximized`)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D16, D17, D20(L17에서 변경), D25, D26, D32

## 할 일
- `detail/TaskDetailModal` (R42): 760×760. 머리 왼쪽 최대화 버튼 + 세로 구분선 + `Task`, 오른쪽 `SaveStateLabel`("자동 저장됨", R41) → 삭제 → 닫기. 아래쪽 저장 표시(`task-detail__foot`)는 없앤다. 순서: 제목(26px) → 속성 줄 → (체크리스트 자리, 4단계) → 구분선 → Notes.
- 최대화 (R43): `useState` `maximized` → `Modal maximized`. 사이드바 오른쪽 본문을 꽉 채우고 어두운 막 없음, 내용 폭 820px까지 가운데. 버튼은 `RestoreIcon` + "원래 크기로". 지원관리 R13과 같은 동작(최대화 중엔 바깥 클릭으로 닫히지 않음은 `Modal`이 처리).
- Notes (R36): 구분선 왼쪽 `Notes` 글자, 아래 `MarkdownBody`(14.5px). 빈 칸 안내 "공부하거나 작업한 내용을 정리해 보세요. 마크다운을 쓸 수 있어요." 저장 칸은 `memo` 그대로(D32).
- `PropRows` (R35): 속성 이름 칸 150px, 마우스를 올린 줄만 옅게. 카테고리는 카테고리 색 옅은 둥근 사각 칩, 상태는 표시 + 글자.
- `PeriodField`: `11월 2일 (월) → 11월 4일 (수)` + 회색 일수. "날짜 없음으로"는 기간 줄에 마우스를 올렸을 때만.
- `LinkedCardRow` (R39): 같은 줄 모양, "연결 끊기"는 마우스를 올렸을 때만.

## 확인할 결과
- `npm run build` 성공.
- 팝업 머리가 `[⤢] | Task ……… 자동 저장됨 🗑 ✕` 순서이고 아래쪽 저장 표시가 없다. 고치면 머리 표시가 "저장 중" → "자동 저장됨".
- 속성 이름 칸이 같은 폭으로 줄 맞춤되고, 카테고리 칩·상태·기간(일수 포함)이 목업처럼 보인다. 기간 줄·지원 카드 줄에 마우스를 올려야 "날짜 없음으로"·"연결 끊기"가 보인다.
- 아래 `Notes`에 마크다운을 쓰면 서식이 바뀌고, 닫았다 다시 열어도 남아 있다. 기존에 쓴 메모도 그대로 보인다.
- 최대화를 누르면 사이드바 오른쪽을 꽉 채우고, "원래 크기로"로 760×760으로 돌아온다.
- 지원 카드 이름을 누르면 지원관리 상세 팝업이 열린다 (D16, 그대로).

## 이 단계에서 고칠 파일
- `apps/desktop/src/pages/plan/detail/TaskDetailModal.tsx`·`TaskDetailModal.css`
- `pages/plan/detail/PropRows.tsx`, `PeriodField.tsx`, `LinkedCardRow.tsx`, `CardPickDialog.css`
- `features/plan/format.ts` (팝업 기간 글자가 필요할 때)
