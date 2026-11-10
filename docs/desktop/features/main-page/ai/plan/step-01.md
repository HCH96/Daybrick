# 메인 페이지 수정2 1단계: 색 A안·지원 현황 칸

- 요구사항: R19, R42 (영향: R13, R23 요약 줄 바탕)
- 목업: `compare-home-colors.html` pal-a 구역 (CSS: compare.css에서 `.pal-a`, `.tile` 검색)
- 경로 기준: [index.md](index.md) 맨 위

## 할 일
- `styles/theme.css` 값만 바꾼다: `--bg` #131316, `--surface` #1f1f24, `--surface-2` #29292f, `--border` #2e2e35, `--border-2` #3c3c45, `--track` #34343c. 주석은 그대로, 나머지 토큰은 그대로.
- `ApplicationsSummaryCard.tsx`: 칸 style을 `{ "--tc": item.color }`로 바꾼다 (`softColor` 바탕을 쓰지 않는다).
- `ApplicationsSummaryCard.css`: 칸 바탕 `--surface-2`, 글자 `--muted`, `box-shadow: inset 3px 0 0 var(--tc)`, 숫자만 `color: var(--tc)`. 세부 단계 줄은 `--muted`.

## 확인할 결과
- `npm run build` 성공.
- 홈에서 카드가 바탕보다 또렷이 떠 보인다 (목업 8-1과 같은 대비).
- 지원 현황 4칸: 회색 칸 + 왼쪽 색 띠(회색·파랑·주황·초록) + 같은 색 숫자. 개수·세부 단계는 바뀌기 전과 같다.
- 투데이·캘린더·플랜·프로젝트·지원 관리·구직 관리·설정을 한 번씩 열어 글자가 안 보이거나 테두리가 사라진 곳이 없다.
- 이전 사용자 테스트 r1 14번(지원 현황)의 내용이 그대로 맞는다.

## 이 단계에서 만들거나 고칠 파일
- `styles/theme.css`
- `pages/home/ApplicationsSummaryCard.tsx`, `ApplicationsSummaryCard.css`
