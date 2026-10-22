# 메인 페이지 구현 계획

- 기능 명세서: [docs/ai/features/main-page.md](../features/main-page.md)
- 목업: [docs/human/mockups/main-page.html](../../human/mockups/main-page.html) (작성 당시 색 조합: 차콜 브릭. 2026-10-22 목업이 최종 디자인으로 다시 그려져 당시 모습과 다르다)
- 작성일: 2026-10-21
- 상태: 승인됨, 1~6단계 구현 완료 (2026-10-22). 계획에 없던 추가 사항은 진행 기록 참고 (docs/ai/logs/main-page-log.md, -log-2.md)
- 경로 기준: `apps/desktop/`

> **이후 변경 (2026-10-22)**: 이 계획은 첫 구현 기준이다. 이후 아래가 바뀌었고, 최신 요구사항은 기능 명세서를 따른다.
> - 색: 차콜 브릭 → 그라파이트 바이올렛
> - 사이드바 메뉴 이름: 영어 (화면 제목·카드 버튼은 한글 유지)
> - 이모지 사용 안 함 (선 아이콘으로 대체)
> - 홈 배치: 2열 → B안 (최대 너비 1280px + 요약 줄 + 벤토 그리드) → [main-page-layout-b-plan.md](main-page-layout-b-plan.md)
> - 제목 표시줄 직접 그리기, 사이드바 접기, 뒤로/앞으로 → [main-page-titlebar-plan.md](main-page-titlebar-plan.md)
> - 본문 스크롤 바 숨김

## 1. 만들거나 수정할 파일 목록

| 구분 | 파일 | 내용 | 단계 |
|---|---|---|---|
| 수정 | `src-tauri/tauri.conf.json` | 창 크기 1200x800, 최소 960x640, 화면 가운데에 띄우기 | 1 |
| 수정 | `index.html` | `lang="ko"`, 제목 "Daybrick" | 1 |
| 새로 | `src/styles/theme.css` | 차콜 브릭 색 변수 (`--bg`, `--accent` 등) | 2 |
| 새로 | `src/styles/base.css` | 기본 글꼴, 여백 초기화, body 배경 | 2 |
| 수정 | `src/main.tsx` | 공통 CSS(theme, base) 불러오기 | 2 |
| 교체 | `src/App.tsx` | greet 예제를 지우고 현재 페이지 상태 + Context Provider + 레이아웃으로 교체 | 2, 3 |
| 새로 | `src/components/layout/AppLayout.tsx` (+ `.css`) | 사이드바 + 본문 2단 배치 | 2 |
| 새로 | `src/app/types.ts` | `PageId` 타입 (파일끼리 서로 import가 꼬이지 않게 따로 둔다) | 3 |
| 새로 | `src/app/pages.ts` | `PageDef` 배열: 메뉴 이름, 아이콘, 화면 컴포넌트 | 3 |
| 새로 | `src/app/navigation.ts` | `NavigationContext`, `useNavigation()` | 3 |
| 새로 | `src/components/layout/Sidebar.tsx` (+ `.css`) | 로고, 메뉴 목록, 버전 표시 | 3 |
| 새로 | `src/components/layout/SidebarItem.tsx` | 메뉴 한 줄 (아이콘 + 이름 + 선택 강조) | 3 |
| 새로 | `src/components/icons/NavIcons.tsx` | 메뉴 아이콘 5개 (목업의 SVG) | 3 |
| 새로 | `src/pages/PlaceholderPage.tsx` (+ `.css`) | 기능 화면용 빈 페이지 (제목 + "준비 중") | 3 |
| 새로 | `src/utils/date.ts` | "2026년 10월 21일 (수)" 형식으로 바꾸는 함수 | 4 |
| 새로 | `src/pages/home/HomePage.tsx` (+ `.css`) | 홈 화면 전체 (상단 + 카드 그리드) | 4 |
| 새로 | `src/pages/home/HomeHeader.tsx` | 오늘 날짜 + 인사 문구 | 4 |
| 새로 | `src/components/common/EmptyState.tsx` (+ `.css`) | 아이콘 + 안내 문구 + 이동 버튼 | 5 |
| 새로 | `src/pages/home/DashboardCard.tsx` (+ `.css`) | 카드 공통 틀 (제목, 이동 링크, 본문) | 5 |
| 새로 | `src/pages/home/dashboardCards.tsx` | `DashboardCardDef` 배열 4개 (지금은 본문이 모두 빈 상태) | 5 |
| 삭제 | `src/App.css` | greet 예제 전용 스타일. `App.tsx` 교체 후 쓰이지 않는다 (사용자 승인) | 2 |
| 삭제 | `src/assets/react.svg` | greet 예제의 React 로고. `App.tsx` 교체 후 쓰이지 않는다 (사용자 승인) | 2 |

- 그대로 두는 것: `src-tauri/src/lib.rs`의 `greet` 명령. 화면에서는 안 쓰지만, 지우는 건 이번 범위가 아니라 남겨 둔다.

## 2. 컴포넌트 구조

```
App                         // 현재 페이지 id 상태, NavigationContext 제공
└─ AppLayout
   ├─ Sidebar
   │  └─ SidebarItem × 5    // pages.ts 배열로 그림
   └─ (본문) 현재 페이지 컴포넌트
      ├─ HomePage
      │  ├─ HomeHeader
      │  └─ DashboardCard × 4   // dashboardCards.tsx 배열로 그림
      │     └─ 카드 본문 (지금은 EmptyState)
      └─ PlaceholderPage    // 캘린더, 스케줄러, 지원 현황, 타이머
```

### 주요 타입
```ts
// app/types.ts
type PageId = "home" | "calendar" | "scheduler" | "applications" | "timer";

// app/pages.ts
interface PageDef {
  id: PageId;
  label: string;            // 사이드바에 보일 이름
  icon: ComponentType;      // 메뉴 아이콘
  component: ComponentType; // 이 메뉴를 눌렀을 때 보여줄 화면
}

// pages/home/dashboardCards.tsx
interface DashboardCardDef {
  id: string;
  title: string;
  linkTo: PageId;           // 카드에서 이동할 메뉴
  body: ComponentType;      // 지금은 빈 상태 컴포넌트
}
```

### 나중에 기능을 붙이는 방법
- `pages.ts`에서 해당 메뉴의 `PlaceholderPage`를 실제 화면 컴포넌트로 바꾼다.
- `dashboardCards.tsx`에서 해당 카드의 `EmptyState`를 실제 카드 본문 컴포넌트로 바꾼다.

### 명세에서 달라지는 점
- **화면 함수 타입:** 명세의 `() => JSX.Element` 대신 React의 `ComponentType`을 쓴다.
  React 19 타입 정의에서는 전역 `JSX` 이름이 빠져서 `JSX.Element`를 그대로 쓰면 타입 오류가 난다.
- **화면 이동 함수 전달:** 카드나 빈 상태 버튼이 다른 메뉴로 이동하려면 "화면 바꾸기" 함수가 필요하다.
  이 함수를 props로 넘기지 않고 React Context(`NavigationContext`)로 공유한다.
  - C++ 비유: 하위 객체들이 모두 참조할 수 있는 "공용 서비스 포인터"와 비슷하다.
  - 차이점: 전역 변수가 아니라 `Provider`로 감싼 컴포넌트 트리 안에서만 보인다. 값이 바뀌면 그 값을 쓰는 컴포넌트가 자동으로 다시 그려진다.
- **CSS 위치:** 공통 색과 기본 스타일만 `styles/`에 두고, 컴포넌트별 CSS는 그 컴포넌트 파일 옆에 둔다.
- **글꼴:** Pretendard는 설치되지 않은 PC도 있으므로 "맑은 고딕"을 기본으로 쓴다. 글꼴 파일을 앱에 넣는 것은 범위 밖이다.

## 3. 구현 순서 (단계별)

단계마다 `npm run build`로 타입 검사를 한 뒤 다음 단계로 넘어간다.

1. **창 설정과 기본 정리**: `tauri.conf.json`, `index.html`
2. **색과 레이아웃 뼈대**: `theme.css`, `base.css`, `main.tsx`, `App.tsx`, `AppLayout`, `App.css`·`react.svg` 삭제
3. **사이드바 메뉴와 화면 전환**: `types.ts`, `pages.ts`, `navigation.ts`, `Sidebar`, `SidebarItem`, `NavIcons`, `PlaceholderPage`
   (이 단계에서는 "홈"도 임시로 빈 페이지)
4. **홈 상단**: `date.ts`, `HomePage`, `HomeHeader`
5. **대시보드 카드**: `EmptyState`, `DashboardCard`, `dashboardCards.tsx`
6. **마무리 확인과 기록**: 최종 `npm run build`, 목업과 화면 비교, 최소 창 크기 확인,
   기능 명세서 진행 기록 · PROJECT.md 상태 · DOCS_INDEX 갱신

## 4. 단계마다 확인할 수 있는 결과

실행 방법: `apps/desktop`에서 `npm run tauri dev`

| 단계 | 확인할 결과 |
|---|---|
| 1 | 창이 이전(800x600)보다 크게 1200x800으로 화면 가운데에 뜨고, 창 제목이 "Daybrick"이다. 창을 줄여 보면 960x640보다 작아지지 않는다. (내용은 아직 greet 예제) |
| 2 | greet 예제가 사라지고 창 전체가 어두운 숯색이 된다. 왼쪽에 약 200px의 조금 더 밝은 사이드바 영역이 있다. |
| 3 | 사이드바 맨 위에 Daybrick 로고, 그 아래 메뉴 5개(홈, 캘린더, 스케줄러, 지원 현황, 타이머)가 아이콘과 함께 보인다. 메뉴를 누르면 본문 제목이 그 메뉴 이름으로 바뀌고 "준비 중인 화면이에요"가 보이며, 누른 메뉴가 벽돌색으로 강조된다. |
| 4 | "홈"을 누르면 맨 위에 오늘 날짜와 요일(예: 2026년 10월 21일 (수))과 인사 문구가 보인다. 날짜가 PC의 오늘 날짜와 같다. |
| 5 | 홈에 카드 4개(오늘 할 일, 오늘 일정, 지원 현황, 오늘 집중 시간)가 2열로 보이고, 각 카드에 "아직 연결되지 않았어요"와 이동 버튼이 있다. 카드 오른쪽 위 "○○로 가기 →"나 가운데 버튼을 누르면 해당 메뉴로 이동하고 사이드바 강조도 같이 바뀐다. |
| 6 | 화면이 목업(main-page.html 아래쪽 빈 상태)과 같은 배치·색이다. CLAUDE.md 테스트 안내 형식의 "AI가 확인한 것 / 사용자가 확인할 것" 목록을 받는다. |

## 구현 전에 확인할 것
- [x] `App.css`, `assets/react.svg` 삭제: 허용 (2026-10-21 사용자 결정). 2단계에서 `App.tsx`를 교체할 때 함께 삭제한다.
- [x] 창 높이: 800으로 확정 (2026-10-21 사용자 결정). 기본 크기 1200x800, 최소 960x640.
