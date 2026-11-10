# r1 공통: 빌드·CSS (A1, A14)

## A1 빌드·타입 검사·cargo check — 통과
- 테스트 내용: 프론트엔드 빌드, 타입 검사, Rust 컴파일 확인
- 근거: 전체, step-09
- 수행 방법: apps/desktop에서 `npm run build`, `npx tsc --noEmit`, apps/desktop/src-tauri에서 `cargo check` (출력 끝부분과 종료 코드 확인)
- 예상 결과: 셋 다 성공
- 실제 결과: 세 명령 모두 종료 코드 0. `npm run build`는 "built in 367ms"이고 청크 500kB 넘음 경고만 있음. `cargo check` "Finished `dev` profile". `calendar.rs`의 `load_calendar`·`save_calendar`가 lib.rs에 등록된 것도 확인
- 판정: 통과

## A14 지원관리 달력 CSS 섞임 — 실패
- 테스트 내용: 지원관리 `pages/applications/calendar/CalendarView.css`의 선택자가 모두 `.cal-view` 안에 있는지
- 근거: L07 남은 문제, L12, D19
- 수행 방법: CalendarView.css(252줄)의 선택자 줄을 grep으로 뽑아 `.cal-view`로 시작하지 않는 것 확인. 새 캘린더 `pages/calendar/**`에서 같은 클래스 이름을 쓰는지 grep. `pages/calendar/grid/Grid.css` 45–95줄과 CalendarView.css 95–128줄 비교
- 예상 결과: CalendarView.css 선택자가 모두 `.cal-view` 안
- 실제 결과:
  - L12·D19에서 말한 `.cal-week`·`.cal-day`·`.cal-day__num`·`.cal-day--*`는 `.cal-view` 안으로 묶여 있다.
  - 그 밖의 전역 선택자가 남아 있다: `.cal-bar`·`.cal-bar__*`(9–55줄), `.cal-legend`·`.cal-legend__*`(60–86줄), `.cal`(90줄), `.cal-ev`·`.cal-ev--*`·`.cal-ev__*`(158–217줄), `.cal-more`(223줄), `.cal-more-pop`·`__date`(240–247줄). 지금은 새 캘린더가 이 이름들을 쓰지 않아 grep에서 겹침이 나오지 않았다.
  - 반대 방향도 섞인다(코드만 읽고 추정, 화면은 보지 않음): 캘린더 `Grid.css`의 전역 `.cal-week`(grid-template-rows `28px repeat(4, 21px)`, row-gap, border-top, overflow hidden)와 `.cal-day`(border-left), `.cal-day--past`·`.cal-day--today`(배경, box-shadow)가 지원관리의 `.cal-view .cal-week`·`.cal-day`에도 걸린다. 지원관리 쪽은 이 속성들 대부분을 따로 정하지 않아 덮어쓰지 못한다.
- 판정: 실패 (예상 결과 "모두 .cal-view 안"과 다름)
- 원인 추정: L12 수정이 그때 실제로 부딪힌 `.cal-week`·`.cal-day` 계열만 묶었다. 캘린더 쪽 Grid.css 규칙도 전역이라 반대로 새어 든다.
- 수정 방향: CalendarView.css의 남은 `.cal*` 규칙도 `.cal-view` 안으로 묶는다. Grid.css의 `.cal-week`·`.cal-day*` 규칙은 캘린더 페이지 뿌리 클래스(예: `.cal-pages`) 안으로 묶거나 이름을 따로 붙인다. 고친 뒤 지원관리 달력 모양을 사용자가 눈으로 확인한다.
