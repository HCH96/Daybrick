# 메인 페이지 수정2 5단계: 마무리

- 요구사항: 대상 R 전체 (R19, R33, R35, R42)
- 목업: `compare-home-cards.html` cmp-v1, `compare-home-colors.html` pal-a, `compare-home-timer.html` tm-running·tm-paused
- 경로 기준: [index.md](index.md) 맨 위

## 할 일
- 이번에 고친 CSS를 design-direction.md 규칙으로 다시 본다: 4배수 간격, 글자 크기 단계, 굵기 700 없음, theme.css 밖 색 없음(`--tc` 데이터 색 예외), `transition: all` 없음.
- 창 크기 세 가지(최대화, 1200×800, 960×640)에서 홈을 본다. 960 폭에서 다가오는 7일 칩 제목은 말줄임, 타이머 시계는 넘치지 않는다.
- 문서: `docs/features/main-page/ai/spec/files.md`에 `UpcomingGap` 추가.

## 확인할 결과
- `npm run build` 성공, `cargo check` 성공 (`src-tauri`).
- 세 창 크기에서 카드가 겹치거나 넘치지 않는다.
- 위 1~4단계 확인 결과를 한 번에 다시 본다.

## 이 단계에서 만들거나 고칠 파일
- 1~4단계에서 고친 CSS (고칠 곳이 있을 때만)
- `docs/features/main-page/ai/spec/files.md`
