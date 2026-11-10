# 메인 페이지: 확장 구조 (나중에 기능 붙이는 방법)

### 1. 페이지 목록을 한곳에서 관리
메뉴와 화면을 배열 하나로 정의한다. 기능을 만들 때는 이 배열에서 빈 페이지 컴포넌트를
실제 컴포넌트로 바꾸기만 하면 된다.

```ts
type PageId = "home" | "calendar" | "scheduler" | "applications" | "timer";

interface PageDef {
  id: PageId;
  label: string;            // 화면 제목 등에 쓰는 한글 이름
  navLabel: string;         // 사이드바에 보일 영어 이름
  icon: ComponentType;      // 메뉴 아이콘
  component: ComponentType; // 이 메뉴를 눌렀을 때 보여줄 화면
}
```
- 구현하면서 `() => JSX.Element` 대신 React의 `ComponentType`을 쓰기로 했다 (React 19 타입에서 전역 `JSX` 이름이 빠짐).
- 메뉴 이름은 `app/pageLabels.ts`(`PAGE_LABELS` 한글, `NAV_LABELS` 영어)에 따로 둔다. 카드가 `pages.ts`를 import하면 순환이 생기기 때문이다.

(C++ 비유: 함수 포인터 테이블과 비슷하다. 메뉴 id로 표를 찾아서 해당 화면 함수를 부른다.
차이점은 TypeScript의 `PageId`는 컴파일 때만 검사되는 문자열 타입이라 런타임에는 그냥 문자열이라는 것.)

### 2. 대시보드 카드도 목록으로 관리
홈 카드도 배열로 정의한다. 기능을 만들 때 해당 카드의 본문 컴포넌트만 바꾼다.

```ts
type CardSize = "large" | "narrow" | "quarter"; // 벤토 그리드 크기 (7칸×2줄 / 5칸 / 4칸), 1280px 미만이면 모두 6칸

interface DashboardCardDef {
  id: string;
  title: string;
  linkTo: PageId;        // 카드에서 이동할 메뉴
  linkLabel: string;     // 오른쪽 위 링크 글자 ("지원 관리 ›")
  size: CardSize;
  body: ComponentType;   // 카드 본문
}
```
- 2026-11-07 홈 개편(수정1): 카드는 6개다. 다가오는 7일(large) · 지금 하는 것, 이번 주 집중(narrow) · 프로젝트 진행, 지원 현황, 새 추천 공고(quarter). 옛 `wide` 크기와 옛 카드 3개는 없앴다.
- large 카드는 본문을 카드 안에서 스크롤해 카드 높이를 키우지 않는다. 본문은 데이터 상태에 따라 `CardState`(불러오는 중·못 읽음·비었음)를 먼저 고른다.
- 카드 본문의 계산은 `features/home/`의 순수 함수에 두고, 본문 컴포넌트는 그 결과만 그린다. 새 카드를 붙일 때도 같은 방식으로 한다.
- 요약 줄 4칸도 `SummaryStrip.tsx` 안에서 칸마다 정의하고, 누르면 `useOpenTarget`으로 해당 메뉴로 이동한다.

### 3. 화면 전환 방식
- 라우터 라이브러리(react-router)를 쓰지 않고, `App`이 "현재 페이지 id"를 상태로 들고
  사이드바/카드에서 바꾸는 방식으로 한다.
- 이유: 화면이 5개뿐이고 주소창이 없는 데스크톱 앱이라 라우터가 아직 필요 없다.
  나중에 화면이 많아지거나 화면 안에 하위 경로가 필요해지면 그때 라우터로 바꾼다.
- 2026-10-22: "현재 페이지 id" 대신 방문 기록(`app/useHistory.ts`)을 들고, 뒤로·앞으로를 지원한다.
  같은 화면은 쌓지 않고, 뒤로 간 뒤 새로 이동하면 앞쪽 기록을 지운다(최대 50개). 앱을 다시 켜면 기록은 비고 홈부터 시작한다.
  화면 이동 함수와 뒤로·앞으로는 `NavigationContext`로 공유한다.
