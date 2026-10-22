# 지원 관리 (applications) 진행 기록
- 담은 범위: L01~L09 (명세 ~ 4단계, 진행 중)
- 이전 파일: 없음 / 다음 파일: 없음
- 2026-10-22 명세서의 "진행 기록" 절에서 옮김 (본문은 그대로, 목차·제목만 새로 붙임)

## 기록 목차
| ID | 날짜 | 종류 | 요구사항 | 내용 |
|---|---|---|---|---|
| L01 | 2026-10-22 | 명세 | 전체 | 명세서 초안 승인 |
| L02 | 2026-10-22 | 목업 | 전체 | 목업 승인 (목업에서 정한 것, 추가 제안 4개) |
| L03 | 2026-10-22 | 계획 | 전체 | 구현 계획 승인 (10단계, 추천안 4개 채택) |
| L04 | 2026-10-22 | 구현 | R1–R2 | 1단계: 저장 기반 + 페이지 뼈대 (사용자 확인) |
| L05 | 2026-10-22 | 구현 | R3–R6 | 2단계: 갤러리 (사용자 확인) |
| L06 | 2026-10-22 | 구현 | R12–R16 | 3단계: 상세 팝업 틀 (사용자 확인) |
| L07 | 2026-10-22 | 구현 | R28–R33 | 4단계: 속성 (사용자 확인) |
| L08 | 2026-10-22 | 명세 | 전체 | 진행 기록 분리, 결정 사항 D1~D11 정리 |
| L09 | 2026-10-22 | 명세 | 전체 | 명세서 절 순서를 새 양식에 맞춤 |

## L01 · 2026-10-22 · 명세: 명세서 초안 승인
- 요구사항 정리와 질문 3차례 진행 후 명세서 초안 승인, 이 문서로 저장. 코드는 아직 작성하지 않음. 다음 단계는 목업 또는 구현 계획.

## L02 · 2026-10-22 · 목업: 목업 승인 (목업에서 정한 것, 추가 제안 4개)
- 목업 작성(docs/human/mockups/applications.html) 후 승인. 상태 색, 팝업 버튼 위치 등 목업에서 정하기로 한 항목과 추가 제안 4개를 "목업" 절에 기록. 다음 단계는 구현 계획.

## L03 · 2026-10-22 · 계획: 구현 계획 승인 (10단계, 추천안 4개 채택)
- 구현 계획 작성 후 승인(docs/ai/plans/applications-plan.md). 추천안 4개(저장 방식, 편집기, 기본 속성 종류 변경 금지, 홈 요약 줄)를 그대로 채택. 코드는 아직 작성하지 않음. 다음 단계는 1단계(저장 기반 + 페이지 뼈대) 구현.

## L04 · 2026-10-22 · 구현: 1단계: 저장 기반 + 페이지 뼈대 (사용자 확인)
- [구현 1단계] 저장 기반 + 페이지 뼈대 완료, 사용자 확인 대기.
  - Rust: `src-tauri/src/storage.rs`에 `load_applications`, `save_applications`(임시 파일에 쓴 뒤 바꿔치기). `lib.rs`의 `greet` 제거 후 두 명령 등록. 저장 위치 `%APPDATA%\com.daybrick.desktop\applications.json`.
  - 데이터: `features/applications/`에 `types.ts`, `statuses.ts`(상태 5·세부 단계 3·일정 종류 이름), `defaultProperties.ts`(기본 속성 10개, 고정 id·항목 색), `storage.ts`(버전 확인, 파일이 깨졌으면 저장을 막음), `reducer.ts`, `useAutoSave.ts`(0.5초 늦춰 저장), `store.tsx`(Provider), `schedule.ts`(진행 중 판별, 이번 주 일정 수).
  - 화면: `components/common/SegmentedControl`, `components/icons/ViewIcons.tsx`, `pages/applications/ApplicationsPage`·`ApplicationsHeader`. `app/pages.ts`에서 준비 중 화면을 교체, `App.tsx`를 `ApplicationsProvider`로 감쌈. 갤러리·달력 자리는 임시 안내 문구("지금 카드 N개").
  - 계획에 없던 작은 추가: ① 창을 닫을 때 기다리던 저장을 바로 쓰고 닫음(0.5초 안에 끄면 사라지는 문제 방지, 이를 위해 capabilities에 `core:window:allow-destroy` 추가) ② `theme.css`에 목업의 `--surface-2`·`--popup`·`--border-2`·`--faint` 추가 ③ `utils/date.ts`에 `toDateKey` 추가 ④ reducer와 자동 저장을 `store.tsx`에서 별도 파일로 분리.
  - 확인: `npm run build`, `cargo check` 통과. 브라우저 미리보기에서 머리줄 표시와 "+ 새 지원" 누를 때 개수 증가 확인.
  - 2026-10-22 사용자 확인 완료: 머리줄 표시, 카드 수 증가, 재시작 후 유지, `applications.json` 생성 모두 정상.

## L05 · 2026-10-22 · 구현: 2단계: 갤러리 (사용자 확인)
- [구현 2단계] 갤러리 완료, 사용자 확인 완료.
  - 로직: `schedule.ts`에 `GalleryTab`·`filterByTab`(R4), `sortByDeadline`(R5: 마감일 오름차순, 없으면 맨 뒤, 같으면 만든 순), `getNextItem`(오늘 포함 가장 가까운 전형 일정, 지원 준비 카드는 마감일과 비교해 더 가까운 쪽), `getLastEvent`(종료 카드용). 같은 날 일정은 시간 없는 것 먼저, 그다음 시간 순.
  - 새 파일 `features/applications/properties.ts`: `findPropertyByRole`, `getDateValue`, `getSelectedOption` (역할 속성을 지웠거나 항목이 지워졌으면 null).
  - `utils/date.ts`에 `parseDateKey`, `daysUntil` 추가.
  - 화면: `gallery/GalleryView`(탭 + "마감일 가까운 순" 표시 + 바둑판, 빈 탭 안내 문구), `gallery/ApplicationCard`, `gallery/PriorityBars`(기본 항목 `priority-0/1/2`에만 막대), `status/StatusBadge`(작은 배지, 세부 단계 표시), `schedule/NextEventLabel`(D-day, "예정된 일정 없음"). 아이콘 `components/icons/ApplicationIcons.tsx`(건물, 정렬).
  - 열 수: CSS container query로 본문 폭 860px 이하면 3열, 그 위는 4열 (사이드바 접기·펴기에도 맞춤).
  - 탭 상태는 `ApplicationsPage`가 들고 있어 달력을 다녀와도 유지. 달력은 임시 안내 문구만 남김.
  - 계획과 다른 점: ① 탭은 `SegmentedControl`에 `variant="tabs"`(밑줄 탭 + 개수)를 추가해 목업 모양을 맞춤 ② `StatusBadge`·`NextEventLabel`을 카드에 필요해서 앞당겨 만듦(5·6단계에서 큰 배지·팝업용으로 확장) ③ `properties.ts` 추가 ④ D-1·당일 빨간색을 지원 준비 마감일에도 적용.
  - 미룬 것: 종료 카드의 결과 칩(목업 "종료 카드")은 8색 팔레트(4단계)·결과 고르기(5단계) 때 붙인다. 새로 추가한 우선순위 항목의 칩 표시도 4단계.
  - 확인: `npm run build` 통과. 브라우저 미리보기에서 1024px 3열, 1440px 4열, 탭 전환·개수, 빈 탭 문구 확인. 마감일·우선순위·일정 표시는 값을 넣을 수 있는 4~6단계에서 확인.
  - 2026-10-22 사용자 확인 완료.

## L06 · 2026-10-22 · 구현: 3단계: 상세 팝업 틀 (사용자 확인)
- [구현 3단계] 상세 팝업 틀 완료, 사용자 확인 완료.
  - 공용 컴포넌트: `components/common/Modal`(기본: 사이드바·본문 전체를 어둡게 덮고 가운데 760x760 상자, 창이 작으면 줄어듦 / 최대화: 어두운 막 없이 본문 영역만 채움), `ConfirmDialog`(한 겹 더 어둡게, 처음 포커스는 "취소"), `useEscapeLayer`(창이 겹치면 맨 위 창만 Esc에 반응, 한글 조합 중 Esc는 무시), `useDialogFocus`(열 때 창 안으로 포커스, 닫을 때 원래 자리로).
  - 팝업 그리는 자리: `AppLayout`의 본문 영역(`app-layout__body`) 위에 겹침 층(`app-layout__overlay`)을 두고 `OverlayRootContext`(`components/layout/overlayRoot.ts`)로 넘김. Modal은 `createPortal`로 여기에 그린다. 제목 표시줄은 덮지 않아 창 이동·닫기·사이드바 버튼이 계속 동작. 사이드바 접힘 여부를 CSS 변수 `--overlay-main-left`(200px/0px)로 넘겨, 최대화 팝업이 사이드바를 남기거나 그 자리까지 채움(R13). 접기·펴기와 같은 0.15초 전환.
  - 상세 팝업: `pages/applications/detail/ApplicationDetailModal`(머리: 왼쪽 최대화/원래 크기로, 오른쪽 저장 표시 → 삭제 → 닫기), `TitleInput`(자동 높이 textarea, 줄바꿈 문자 제거, Enter로 편집 끝, 빈 제목이면 바로 포커스), `SaveStateLabel`("저장 중… / 저장됨 / 저장 실패", 아직 고친 것 없음도 "저장됨"). 아이콘 `components/icons/DialogIcons.tsx`.
  - 닫기: 바깥 클릭(누르고 뗀 곳이 모두 바깥일 때만, 최대화 중에는 바깥 없음)·Esc·✕. 삭제: 🗑 → 확인 → 카드 삭제 후 팝업 닫힘. 카드가 사라지면 팝업도 스스로 닫힘.
  - 데이터: `reducer.ts`에 `update-application`(부분 수정 `ApplicationPatch`, 고친 날 갱신)·`delete-application`, `store.tsx`에 `updateApplication`·`deleteApplication`.
  - 연결: `ApplicationCard`에 `onOpen`(클릭, Tab+Enter/Space로도 열림, 포커스 테두리), `GalleryView`가 전달, `ApplicationsPage`가 연 카드 id(`openId`)를 들고 팝업을 그림(8단계 달력도 같은 팝업 사용 예정).
  - 계획과 다른 점: ① 겹침 층을 `AppLayout`에 추가(최대화 시 사이드바 폭을 알아야 해서) ② `useEscapeLayer`·`useDialogFocus` 훅 분리 ③ 빈 제목 자동 포커스 ④ 팝업 안 속성·본문 자리는 임시 안내 문구("속성과 본문은 다음 단계에서 만들어요"), 상태 배지는 기존 작은 `StatusBadge`(큰 배지·고르기는 5단계).
  - 정해 둔 것: 최대화 여부는 팝업을 열 때마다 기본 크기로 시작. 새 카드를 만들 때 팝업을 자동으로 열지는 않음. 포커스 가두기(Tab이 뒤 화면으로 가는 것 막기)는 하지 않음.
  - 확인: `npm run build` 통과(Rust 변경 없음). 브라우저 미리보기에서 열기·제목 입력·카드 반영·저장됨·최대화(사이드바 펼침 200px부터 / 접힘 0부터)·원래 크기·Esc·바깥 클릭·삭제 확인(Esc는 확인 창만 닫음)·삭제 확인.
  - 실행 문제: 다른 대화가 켠 미리보기 Vite 서버가 1420 포트를 쥔 채 변경을 반영하지 못해 `tauri dev`가 실패하고 옛 화면이 보였음 → 그 서버를 종료해 해결(코드 문제 아님). `.claude/launch.json`에 1430 포트용 `desktop-web-alt` 미리보기 설정 추가.
  - 2026-10-22 사용자 확인 완료: 앱에서 팝업 정상 동작.

## L07 · 2026-10-22 · 구현: 4단계: 속성 (사용자 확인)
- [구현 4단계] 속성 완료, 사용자 확인 완료.
  - 데이터: `propertyTypes.ts`(종류 7개 이름, 8색 팔레트와 CSS 변수, 새 항목 색은 항목 수에 따라 팔레트를 차례로 돎, `canChangeType`=역할 없을 때만), `propertyOps.ts`(새 속성·항목 만들기, 종류 바꿀 때 값 옮기기: 선택↔다중 선택은 항목 유지(다중→단일은 첫 항목), 텍스트↔URL 유지, 숫자→텍스트 변환, 그 밖은 지움 / 항목 삭제 시 모든 카드 값에서 제거 / 사용 카드 수), `propertyReducer.ts`(add/rename/change-type/delete-property, add/update/delete-option. 역할 속성 종류 변경은 reducer에서도 막음, 종류를 바꿔도 항목 목록은 남겨 둠). `reducer.ts`에 `set-value`(값 하나만 바꿈, null이면 칸을 지움) 추가, 나머지 동작은 propertyReducer로 넘김. `store.tsx`에 `setValue`·`changeProperties`.
  - 색: `theme.css`에 `--red/--violet/--teal/--pink`(+ `-soft`) 추가.
  - 공용 컴포넌트: `Popover`(겹침 층에 그림, 버튼 아래/오른쪽, 자리가 모자라면 뒤집고 가장자리 안으로 맞춤, 스크롤·창 크기·내용 크기 변경 때 다시 배치), `useOutsideLayer`(바깥 누름 감시 스택: 안쪽 창을 누르면 바깥 창은 유지, 창을 연 버튼은 제외, 아무 창도 아닌 곳의 누름은 뒤로 전달하지 않아 상세 팝업이 같이 닫히지 않음. `ConfirmDialog`에 `data-keep-popovers`를 붙여 작은 창에서 연 확인 창이 유지됨), `MiniCalendar`(일요일 시작, 월 이동, 오늘·고른 날 표시, 점 찍을 날짜 `marked`는 6단계용), 아이콘 `CommonIcons.tsx`·`PropertyTypeIcons.tsx`.
  - 화면(`pages/applications/properties/`): `PropertyList`(+ 속성 추가), `PropertyRow`(이름 150px 누르면 메뉴, 종류가 바뀌면 편집기를 새로 그림), `PropertyValueEditor` + `editors/` 7종(Text: 자동 높이·줄바꿈 제거·Enter로 끝 / Number: 쓰는 동안 글자로 들고 벗어날 때 숫자로 저장, 쉼표 허용, 잘못되면 빨간 테두리 후 되돌림 / Select: 단일·다중 겸용 / Date: 작은 달력, 고르면 닫힘, "날짜 지우기" / Url: 밑줄 표시, https:// 자동 보충, opener로 브라우저 열기 / Checkbox: 끄면 null), `OptionPicker`(찾기·새로 만들기·새 항목 색 팔레트, ↑↓·Enter, 빈 칸 Backspace로 마지막 항목 빼기, 단일은 고르면 닫힘·다중은 열린 채), `OptionMenu`(··· : 이름·8색·삭제 확인, 쓰는 카드 수 안내), `ColorPalette`, `OptionChip`, `PropertyMenu`(이름·종류·삭제, 역할 속성은 종류 잠금 + 안내, 삭제 확인에 역할별로 사라지는 기능 안내), `PropertyTypeList`, `AddPropertyButton`(이름 비우면 종류 이름, Enter는 텍스트).
  - 연결: `ApplicationDetailModal`의 임시 문구를 속성 목록으로 교체, 본문 자리는 "본문은 다음 단계에서 만들어요"로 남김. 2단계에서 미룬 것 처리: 새 우선순위 항목은 `PriorityBars`에서 칩으로, 종료 카드는 상태 배지 옆에 결과 칩(`CardProperties.result`).
  - 정해 둔 것: 빈 이름으로 바꾸면 저장하지 않음(마지막 이름 유지). 종류 변경은 확인 창 없이 바로. 항목·속성 삭제는 항상 확인 창. 지운 역할 속성은 다시 만들 방법 없음(명세 R33 범위).
  - 계획과 다른 점: ① 달력 칸 계산을 `features/applications/calendarGrid.ts` 대신 `utils/calendarGrid.ts`에 둠(공용 MiniCalendar가 지원 관리 폴더에 기대지 않게, 8단계 큰 달력도 이것을 씀) ② 속성 로직을 `propertyReducer.ts`·`propertyOps.ts`·`propertyTypes.ts`로 분리 ③ 숫자는 쉼표를 빼고 저장·표시.
  - 고친 문제: Popover를 자리 재기 전 `visibility: hidden`으로 숨기면 입력 칸 autoFocus가 실패 → `opacity: 0`으로 변경. 개발 모드(StrictMode)에서 포커스 되돌리기가 먼저 실행돼 입력 칸 포커스를 빼앗음 → 창이 실제로 화면에서 사라진 뒤(microtask)에만 되돌림.
  - 확인: `npm run build` 통과(Rust 변경 없음). 브라우저 미리보기에서 항목 새로 만들기·색, 마감일 → 카드 "D-5 마감", 우선순위 높음 → 빨간 막대, 마감일 순 정렬, 다중 선택, 텍스트·숫자(잘못된 값 되돌림)·URL·체크박스, 속성 추가가 다른 카드에도 생김, 역할 속성 종류 잠금, 이름·종류 바꾸기, 속성·항목 삭제 확인, 바깥 클릭 시 작은 창만 닫힘·Esc는 맨 위 창만 닫힘 확인.
  - 2026-10-22 사용자 확인 완료.

## L08 · 2026-10-22 · 명세: 진행 기록 분리, 결정 사항 D1~D11 정리
- 요구사항: 전체
- 한 일: 명세서의 "진행 기록" 절을 이 파일(L01~L07)로 옮기고, 명세서에는 링크만 남겼다. 기록에만 있던 결정을 명세서 "결정 사항" D1~D11로 올렸다 (사용자 승인).
- 결정: D1~D11 추가
- 노트: "주의" 3줄과 "실행" 줄을 "관련 결정: D1, D2, D3, D4, D5, D6, D8, D9, D10, D11"로 대체. 세부 단계 창 위치 주의만 남김.
- 같이 바뀐 규칙: CLAUDE.md, /implement·/test·/plan·/spec·/mockup 명령 (진행 기록 파일, 기록 목차, 결정 올리기)
- 코드 변경: 없음

## L09 · 2026-10-22 · 명세: 명세서 절 순서를 새 양식에 맞춤
- 요구사항: 전체
- 한 일: /spec 명령의 새 명세서 양식에 맞춰 절 순서를 바꿨다 (사용자 요청). "목업"·"구현 계획" 절을 "나중에 고려할 것" 뒤로 옮기고, "테스트 문서" 절(아직 없음)을 추가했다. 제목을 "지원 관리 (applications)"로 맞추고, 화면 구성의 세 화면에 R 범위를 적었다.
- 요구사항(R1~R37)과 결정 사항(D1~D11) 내용·번호는 그대로다.
- 코드 변경: 없음
