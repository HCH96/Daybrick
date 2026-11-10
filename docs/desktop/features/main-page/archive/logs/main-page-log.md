# 메인 페이지 (main-page) 진행 기록
- 담은 범위: L01~L13 (명세 ~ 1차 테스트, 사용자 요청 수정)
- 이전 파일: 없음 / 다음 파일: main-page-log-2.md
- 2026-10-22 명세서의 "진행 기록" 절에서 옮김 (본문은 그대로, 목차·제목만 새로 붙임)

## 기록 목차
| ID | 날짜 | 종류 | 요구사항 | 내용 |
|---|---|---|---|---|
| L01 | 2026-10-21 | 명세 | 전체 | 명세서 초안 작성 |
| L02 | 2026-10-21 | 목업 | 전체 | 목업 작성·승인 |
| L03 | 2026-10-21 | 목업 | R19 | 색 후보 5개 비교, 차콜 브릭 선택 |
| L04 | 2026-10-21 | 계획 | 전체 | 구현 계획 승인 (6단계) |
| L05 | 2026-10-22 | 구현 | R2 | 1단계: 창 설정과 기본 정리 (사용자 확인) |
| L06 | 2026-10-22 | 구현 | R1, R19 | 2단계: 색과 레이아웃 뼈대 (사용자 확인) |
| L07 | 2026-10-22 | 구현 | R5–R7 | 3단계: 사이드바 메뉴와 화면 전환 (사용자 확인) |
| L08 | 2026-10-22 | 구현 | R10–R11 | 4단계: 홈 상단 (사용자 확인) |
| L09 | 2026-10-22 | 구현 | R15–R17, R21 | 5단계: 대시보드 카드 (사용자 확인) |
| L10 | 2026-10-22 | 구현 | 전체 | 6단계: 마무리 확인과 기록 |
| L11 | 2026-10-22 | 테스트 | 전체 | 1차 AI 테스트(23개 통과) + 사용자 체크리스트 작성 |
| L12 | 2026-10-22 | 테스트 | 전체 | 1차 사용자 테스트 완료 |
| L13 | 2026-10-22 | 수정 | R6, R19–R20 | 사용자 요청 3가지: 색 변경, 영어 메뉴, 이모지 제거 |

## L01 · 2026-10-21 · 명세: 명세서 초안 작성
- 명세서 초안 작성.

## L02 · 2026-10-21 · 목업: 목업 작성·승인
- 목업 작성 및 승인 (docs/human/mockups/main-page.html). 구현은 아직 시작 전.

## L03 · 2026-10-21 · 목업: 색 후보 5개 비교, 차콜 브릭 선택
- 어두운 색 조합 후보 5개 비교 후 "차콜 브릭" 선택, main-page.html 목업에 적용.

## L04 · 2026-10-21 · 계획: 구현 계획 승인 (6단계)
- 구현 계획 작성 후 승인, docs/ai/plans/main-page-plan.md로 저장. 코드는 아직 작성하지 않음.

## L05 · 2026-10-22 · 구현: 1단계: 창 설정과 기본 정리 (사용자 확인)
- 1단계(창 설정과 기본 정리) 완료. `tauri.conf.json` 창 크기 1200x800, 최소 960x640, `center: true`.
  `index.html` `lang="ko"`, 제목 "Daybrick". `npm run build`, `cargo check` 통과. 사용자 화면 확인 완료.

## L06 · 2026-10-22 · 구현: 2단계: 색과 레이아웃 뼈대 (사용자 확인)
- 2단계(색과 레이아웃 뼈대) 완료. `styles/theme.css`(차콜 브릭 색 변수), `styles/base.css`(맑은 고딕, 여백 초기화, 배경),
  `components/layout/AppLayout.tsx`(+ `.css`, 사이드바 200px + 본문), `main.tsx`에서 공통 CSS 불러오기, `App.tsx`를 AppLayout만 그리도록 교체.
  `App.css`, `assets/react.svg` 삭제(승인됨), 비게 된 `assets/` 폴더도 제거. `npm run build` 통과. 사용자 화면 확인 완료.

## L07 · 2026-10-22 · 구현: 3단계: 사이드바 메뉴와 화면 전환 (사용자 확인)
- 3단계(사이드바 메뉴와 화면 전환) 완료. `app/types.ts`(PageId), `app/navigation.ts`(NavigationContext, useNavigation),
  `app/pages.ts`(PageDef 배열 5개 + findPage), `components/icons/NavIcons.tsx`(목업 SVG 5개),
  `components/layout/Sidebar.tsx`(+ `.css`, 로고·메뉴·버전), `SidebarItem.tsx`(button, 선택 시 강조 + `aria-current`),
  `pages/PlaceholderPage.tsx`(+ `.css`). `App.tsx`가 현재 페이지 상태를 들고 Provider로 감싼다. "홈"도 임시로 빈 페이지.
  - 구현 세부: `pages.ts`는 .ts 파일이라 JSX를 쓸 수 없어서, 제목이 정해진 빈 페이지 컴포넌트를 만드는
    `makePlaceholderPage(title, featureName)` 함수를 `PlaceholderPage.tsx`에 두었다.
  - 버전 표시는 `package.json`의 version을 읽어 "v0.1.0"으로 보여준다.
  - `npm run build` 통과. 브라우저(vite preview, 1200x800)에서 메뉴 클릭 시 제목·강조가 바뀌는 것 확인. 사용자 화면 확인 완료.

## L08 · 2026-10-22 · 구현: 4단계: 홈 상단 (사용자 확인)
- 4단계(홈 상단) 완료. `utils/date.ts`(formatKoreanDate: "2026년 10월 22일 (목)" 형식, PC 현지 시간 기준),
  `pages/home/HomeHeader.tsx`(날짜 + "좋은 하루예요 👋"), `pages/home/HomePage.tsx`(+ `.css`). `pages.ts`의 홈 항목을 HomePage로 교체.
  - 날짜는 화면을 그릴 때 계산한다. 앱을 켜 둔 채 자정을 넘기면 다른 화면에 갔다 오기 전까지 이전 날짜가 보인다. (자동 갱신은 범위 밖)
  - `npm run build` 통과. 브라우저(vite preview)에서 오늘 날짜·요일과 인사 문구 표시 확인. 사용자 화면 확인 완료.

## L09 · 2026-10-22 · 구현: 5단계: 대시보드 카드 (사용자 확인)
- 5단계(대시보드 카드) 완료. `components/common/EmptyState.tsx`(+ `.css`, 🧱 + "아직 연결되지 않았어요" + 안내 + 이동 버튼),
  `pages/home/DashboardCard.tsx`(+ `.css`, 제목·오른쪽 위 링크·본문), `pages/home/dashboardCards.tsx`(DashboardCardDef 4개, 본문은 모두 EmptyState),
  `HomePage`에 2열 그리드 추가(행 높이 최소 240px, 창이 작으면 본문 스크롤).
  - 계획에 없던 작은 파일 2개 추가:
    - `app/pageLabels.ts`: 메뉴 이름 표. EmptyState/DashboardCard가 메뉴 이름을 얻으려고 `pages.ts`를 import하면
      `pages.ts → HomePage → dashboardCards → EmptyState → pages.ts`로 import가 순환한다. 이름만 따로 빼서 순환을 막았다. `pages.ts`도 이 표를 쓴다.
    - `utils/korean.ts`: `withRo()`, 받침에 따라 "로/으로"를 붙인다 (캘린더로, 지원 현황으로).
  - 명세대로 카드 제목도 버튼으로 만들어, 제목·오른쪽 위 링크·가운데 버튼 모두 해당 메뉴로 이동한다.
  - `npm run build` 통과. 브라우저(vite preview)에서 1200x800·960x640 배치, 카드 버튼/제목 클릭 시 화면·사이드바 강조 이동 확인. 사용자 화면 확인 완료.

## L10 · 2026-10-22 · 구현: 6단계: 마무리 확인과 기록
- 6단계(마무리 확인과 기록) 완료. 구현 단계 모두 끝남.
  - `npm run build`, `cargo check` 통과. 콘솔 오류 없음.
  - 목업(main-page.html 아래쪽 빈 상태)과 비교: 카드 틀·빈 상태·색·사이드바가 같다.
    빈 기능 화면은 목업처럼 카드 안이 아니라 본문 전체를 쓰고, 목업의 설명용 부제("빈 기능 화면 예시")는 넣지 않았다.
  - 최소 창 크기 960x640에서 홈 본문이 스크롤 없이 들어맞고 가로 넘침 없음.
  - 남은 것: `/test 메인페이지`로 AI 테스트 보고서와 사용자 테스트 체크리스트 작성.

## L11 · 2026-10-22 · 테스트: 1차 AI 테스트(23개 통과) + 사용자 체크리스트 작성
- 테스트 계획 승인 후 AI 테스트 수행(23개 모두 통과, 참고 2건), 사용자 테스트 체크리스트(10개) 초안 작성. 사용자 테스트 대기.

## L12 · 2026-10-22 · 테스트: 1차 사용자 테스트 완료
- 사용자 테스트 완료 (1~9 통과, 10 해당 없음).

## L13 · 2026-10-22 · 수정: 사용자 요청 3가지: 색 변경, 영어 메뉴, 이모지 제거
- 사용자 요청으로 3가지 수정.
  1. 색: `styles/theme.css`를 후보 4 "그라파이트 바이올렛"으로 교체 (위 색 목록 갱신).
  2. 사이드바 메뉴 이름 영어: `app/pageLabels.ts`에 `NAV_LABELS` 추가, `PageDef`에 `navLabel` 필드 추가, `Sidebar`가 `navLabel`을 쓴다.
     화면 제목과 "○○로 가기" 버튼은 한글 `label` 그대로.
  3. 이모지 제거: 인사 문구의 👋 삭제, 카드 빈 상태 🧱 → 벽돌 선 아이콘(`BricksIcon`), 준비 중 화면 🚧 → 렌치 선 아이콘(`WrenchIcon`).
     공통 아이콘 틀 `components/icons/LineIcon.tsx`를 새로 만들고, `NavIcons.tsx`도 이 틀을 쓰도록 바꿨다. 새 아이콘은 `components/icons/StatusIcons.tsx`.
  - `npm run build` 통과, `src`에 이모지 0개 확인, 브라우저(vite preview)에서 색·영어 메뉴·아이콘·화면 이동 확인, 콘솔 오류 없음.
