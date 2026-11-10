# 메인 페이지 수정1 1단계: 카드 틀 6개·세 상태

- 요구사항: R14–R17 (영향: R4, R16)
- 목업: `dash.html` 전체 배치(dash-upcoming·dash-now·dash-week·dash-projects·dash-apps·dash-jobs의 카드 틀만), `part-empty.html` empty-loading·empty-error·empty-upcoming 구역 (CSS: dash.css·common.css에서 `.card`, `.s7x2`, `.s5`, `.s4`, `.empty`, `.loading`, `.error` 검색)
- 경로 기준: [index.md](index.md) 맨 위

## 할 일
- `dashboardCards.tsx`: 카드를 6개로 바꾼다 (R15 표 순서: 다가오는 7일 → 지금 하는 것 → 이번 주 집중 → 프로젝트 진행 → 지원 현황 → 새 추천 공고). 링크 메뉴는 표대로.
  - 이번 단계의 body: 지원 현황은 지금 `ApplicationsSummaryCard` 그대로, 나머지 5개는 `CardState`의 빈 상태(문구는 R34·R37·R41·R46 기준 임시)로 둔다.
- `CardSize`를 `"large" | "narrow" | "quarter"`로 바꾼다. `DashboardCard.css`: large = 7칸×2줄, narrow = 5칸, quarter = 4칸, 1280px 미만이면 모두 6칸. 줄 최소 200px, 창 높이에 맞춰 늘리지 않는다 (R14).
- 카드 틀(R16): 제목 + 오른쪽 위 링크 "캘린더 ›"(메뉴 이름 + ›). 제목·링크를 누르면 이동.
- 새 `CardState`(R17): `kind: "loading" | "error" | "empty"`.
  - loading: 회색 줄 3개 + "불러오는 중…"
  - error: 빨간 아이콘 + "○○을 불러오지 못했어요" (이동 버튼 없음)
  - empty: 이동할 메뉴 아이콘 + 안내 두 줄 + 이동 버튼
- 옛 카드 정리 (D2·D4): 오늘 할 일·오늘 일정·오늘 집중 시간을 빼고 `WeeklyFocusEmpty.tsx/.css`를 지운다. 이 파일을 쓰는 곳이 `dashboardCards.tsx`뿐인지 grep으로 먼저 확인한다.
- 다가오는 7일 카드 안 스크롤(2단계)과 본문 스크롤(R4)이 겹치지 않도록, large 카드 본문은 `overflow: auto` + `min-height: 0` 자리를 이번에 만들어 둔다.

## 확인할 결과
- `npm run build` 성공.
- 1920×1080 최대화: 위 두 줄 = 다가오는 7일(왼쪽 7칸, 두 줄 높이) + 오른쪽 지금 하는 것·이번 주 집중(5칸씩 위아래). 셋째 줄 = 프로젝트·지원·추천 공고 4칸씩. 본문 폭 1280px 가운데.
- 1200×800: 모두 6칸(한 줄에 2개), 본문 세로 스크롤, 가로 넘침 없음, 스크롤 바 숨김 유지 (R4).
- 옛 카드 3개가 보이지 않는다. 지원 현황은 지금 내용이 그대로 보인다.
- 카드 제목·링크를 누르면 표의 메뉴로 이동하고, 뒤로 가기로 홈에 돌아온다.
- CardState 세 종류를 임시로 바꿔 끼워 목업 empty-loading·empty-error와 모양이 같은지 본다.

## 이 단계에서 만들거나 고칠 파일
- `pages/home/dashboardCards.tsx`, `HomePage.tsx`·`.css`, `DashboardCard.tsx`·`.css`
- 새 `pages/home/CardState.tsx`·`.css`
- 지움 `pages/home/WeeklyFocusEmpty.tsx`·`.css`
