---
description: 기능 없이 디자인만 보여주는 정적 HTML 목업을 만든다
argument-hint: <화면 또는 기능명>
---

"$ARGUMENTS"의 목업을 만들어줘.
관련 명세서가 있으면 docs/features/<기능명>/ai/spec/index.md를 먼저 보고, 목업에 필요한 req 파일과 data.md만 읽어줘.

- 디자인 확인용이니까 기능이나 동작은 구현하지 말고, 화면 배치와 스타일만 보여주는 정적 화면으로 만들어줘.
- 데이터는 실제처럼 보이는 예시 값으로 채워줘.
- 브라우저에서 바로 열 수 있게 docs/features/<기능명>/human/mockups/에 저장하고, index.html 경로를 알려줘.
- 다른 기능의 목업 색·틀을 이어 써야 하면, 그 기능 목업의 common.css만 읽고 필요한 값을 가져온다.

## 파일 나누기
AI가 구현할 때 필요한 화면만 읽을 수 있게 화면마다 파일을 나눈다.

```
human/mockups/
  index.html        목업 목차 (맨 앞 주석) + 사람이 보는 화면 목록 링크
  common.css        색 토큰, 문서 부분, 앱 창 틀, 여러 화면이 같이 쓰는 부품
  <영역>.css        특정 화면(들)만 쓰는 스타일 (예: gallery.css, popup.css, parts.css)
  icons.js          SVG 아이콘 심볼 묶음 (document.write로 페이지에 넣음)
  <화면>.html       화면 하나 (예: gallery.html, popup.html)
  part-<부품>.html  따로 구현되는 작은 창·부품 하나 (예: part-status.html)
```

- 화면 하나(앱 창 한 장면)마다 HTML 파일 하나를 만든다. 팝업 안의 작은 창처럼 따로 구현되는 부품은 `part-<이름>.html`로 나눈다.
- 같은 기능에 화면을 추가할 때는 새 화면 파일을 만들고 index.html 목차와 링크에 추가한다.
- 색·배치 후보를 비교하는 목업은 `compare-<주제>.html` 한 파일로 만들 수 있다. 결정이 끝나면 docs/features/<기능명>/archive/mockups/로 옮긴다.
- 화면 파일 하나는 15KB 안팎을 넘기지 않는다. 넘을 것 같으면 부분을 part 파일로 나눈다.
- 스타일은 화면 파일 안에 넣지 않고 CSS 파일에 둔다. 화면 파일은 `common.css`와 필요한 `<영역>.css`만 link한다.

## 화면 파일 머리
`<!doctype html>` 바로 다음 줄에 주석을 둔다:

```html
<!-- 목업: <기능 이름> / 3. 상세 팝업
  목차와 다른 화면: index.html
  CSS: common.css, popup.css (필요한 클래스만 검색해서 읽기)
  ID                  화면                         요구사항
  popup               3. 상세 팝업                  R12–R17
    popup-head          3-1. 팝업 머리              R13, R15–R16
    popup-notes         3-5. 설명 메모              -
-->
```

## 구역 ID 규칙
- 화면 하나를 `<section class="screen" id="화면ID">`로 감싼다.
- 한 화면 안에 따로 구현될 수 있는 부분(카드 등)이 여럿이면 각각 `id="화면ID-부분ID"`를 붙인다.
- ID는 영어 소문자·숫자·하이픈만 쓰고, 기능의 목업 전체에서 겹치지 않게 한다.
- 화면 제목 옆과 머리 주석에 관련 요구사항 번호(R)를 적는다.
- 한 번 정한 ID·파일 이름은 되도록 바꾸지 않는다. 바꾸거나 지우면 docs/ 아래에서 그것을 참조하는 곳(노트, 계획 step 파일, mockup.md)을 찾아 함께 고친다.

## 목업 목차 (index.html)
`<!doctype html>` 바로 다음 줄에 목차 주석을 둔다:

```html
<!-- 목업 목차: <기능 이름>
  읽는 법: 이 목차에서 필요한 화면 파일만 골라 읽는다. CSS는 그 화면 파일 머리에 적힌 파일에서 필요한 클래스만 검색한다.
  파일                  화면                         요구사항
  gallery.html          1. 갤러리                     R1–R6     부분 ID: gallery-head, -cards
  part-status.html      5-1. 상태 선택                R18–R19
  CSS: common.css(색 토큰·앱 틀), gallery.css, parts.css
-->
```

- 화면 파일·부분 ID를 추가·삭제·변경하면 목차도 같은 작업에서 고친다.
- index.html 본문에는 사람이 볼 제목·설명과 화면 파일 링크 목록을 둔다.

내가 목업을 승인하면 다음을 해줘.
- 명세서 ai/spec/mockup.md에 목업 경로(승인 날짜)와 "목업에서 정한 것"을 기록하고, ai/spec/index.md 표에 올리기
- 기능 허브(index.md)의 목업 칸에 human/mockups/index.html 링크 추가 (화면별 설명은 목업 목차에만 둔다)
- 진행 기록에 "목업" 항목을 남기기 (docs/common/ai/formats/record-format.md의 "진행 기록 쓰는 법". 기록이 아직 없으면 만든다)
