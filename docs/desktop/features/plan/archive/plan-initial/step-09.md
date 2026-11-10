# 플랜 9단계: 지원 카드 연결

- 요구사항: R39 (영향: R14 목록 줄의 연결 회사)
- 목업: `part-card-pick.html`, `popup.html` popup-props 구역(지원 카드 줄)·popup-bare 구역(연결 없음) (CSS: parts.css·popup.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D14, D16

## 할 일
- reducer·store: `link-application`(id 또는 null), `clear-missing-links`(남아 있는 카드 id 목록을 받아, 거기 없는 연결을 null로).
- `features/plan/useLinkCleanup.ts` (D14): `PlanProvider` 안에서 지원 상태와 플랜 상태가 둘 다 ready일 때만, 연결된 카드가 없으면 `clear-missing-links`. 읽는 중·실패면 아무것도 안 한다.
- `detail/LinkedCardRow`: 속성 줄 "지원 카드". 연결이 없으면 `지원 카드 연결` 버튼, 있으면 카드 이름(회사·제목) + [연결 끊기]. 카드 이름을 누르면 `ApplicationDetailModal` (D16, 7단계와 같은 `openApplicationId`).
- `detail/CardPickDialog`: 찾기칸(제목·회사 글자 포함), 진행 중 카드 먼저(`isActive`, `sortByNextDate` 가까운 일정 순), 종료 카드는 아래에 흐리게. 상태 배지는 지원관리 `StatusBadge` 재사용. 누르면 연결하고 닫는다. 카드가 없으면 안내 한 줄.
- `TaskRow` 아래 줄에 연결 회사(목업 "태스크 줄").

## 확인할 결과
- `npm run build` 성공.
- 팝업에서 `지원 카드 연결` → 고르기 창에 진행 중 카드가 가까운 일정 순으로, 종료 카드는 아래에 흐리게 보이고, 찾기칸으로 걸러진다.
- 고르면 속성 줄에 카드 이름, 목록 줄에 회사가 보인다. 이름을 누르면 지원 상세 팝업, [연결 끊기]로 끊긴다.
- 지원관리에서 그 카드를 지우고 플랜으로 오면 연결이 사라져 있다 (`plan.json`의 `applicationId`도 null).
- 지원 데이터 파일을 읽지 못한 상태에서는 연결이 지워지지 않는다 (코드로 확인).

## 이 단계에서 만들거나 고칠 파일
- `apps/desktop/src/features/plan/reducer.ts`, `store.tsx`, 새 `useLinkCleanup.ts`
- 새 `pages/plan/detail/LinkedCardRow.tsx`, `CardPickDialog.tsx`·`CardPickDialog.css`
- `pages/plan/detail/PropRows.tsx`, `TaskDetailModal.tsx`, `list/TaskRow.tsx`, `PlanPage.tsx`
