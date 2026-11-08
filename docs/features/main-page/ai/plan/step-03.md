# 메인 페이지 수정2 3단계: 다가오는 7일 화면 (날짜 열 + 칩)

- 요구사항: R29–R34
- 목업: `compare-home-cards.html` cmp-v1-upcoming 구역 (CSS: compare.css에서 `.u1-`, `.chip` 검색)
- 경로 기준: [index.md](index.md) 맨 위

## 할 일
- `UpcomingCard.tsx`: `groupUpcoming(days)` 결과를 day면 `UpcomingDay`, gap이면 `UpcomingGap`으로 그린다. 로딩·오류·7일 모두 빔은 그대로.
- `UpcomingDay.tsx`: 왼쪽 48px 날짜 열(숫자 20/600 + 아래 12px 라벨, 토 `--blue`·일 `--red`) + 오른쪽 칩 목록(사이 4). 오늘 묶음은 `--accent-wash` 바탕, 숫자·라벨 `--accent`. 오늘이 비면 칩 자리에 `--faint` "일정 없음".
- `UpcomingRow.tsx`: 높이 36 칩, 바탕 `--surface-2`, 모서리 8, 안쪽 0 12.
  - 태스크·깃발: 왼쪽 3px 색 띠(깃발은 깃발 아이콘도). 지원: 이니셜 배지 + "회사 · 종류"(종류는 `--muted`) + 오른쪽 종류 아이콘(면접만 `--text`). 개인 일정: 기본 색 점 + 끝날("~11/12").
  - 시각은 칩 오른쪽 12px `--muted` tabular. 누르면 캘린더로 (그대로). 마우스를 올리면 `--hover` 겹침.
- 새 `UpcomingGap.tsx`: 양쪽 점선(`--border`) 사이에 "11/11 – 11/13 · 일정 없음" 12px `--faint`.
- `Upcoming.css`를 위 모양으로 다시 쓴다. 카드 안 스크롤·아래 흐림(R34)은 그대로 둔다.

## 확인할 결과
- `npm run build` 성공.
- 홈 다가오는 7일이 목업 1안처럼 보인다: 큰 날짜 열, 칩, 빈 날 합친 줄, 오늘 연한 보라.
- 플랜 태스크·지원 전형·프로젝트 깃발·개인 일정(여러 날 포함)이 각자 표시로 나온다. 같은 날 순서는 바뀌기 전과 같다 (R32).
- 칩을 누르면 캘린더로 간다. 일정이 많으면 카드 안에서만 스크롤되고 아래가 흐려진다.
- 이전 사용자 테스트 r1 8번(표시)·9번(스크롤·누르기)의 내용이 새 모양에서도 맞는다.

## 목업과 다른 점
- 목업의 태스크 칩 오른쪽 "Daybrick"·"미분류" 글자는 넣지 않는다 (R33에 없는 정보, 색 띠로 충분).

## 이 단계에서 만들거나 고칠 파일
- `pages/home/upcoming/UpcomingCard.tsx`, `UpcomingDay.tsx`, `UpcomingRow.tsx`, `Upcoming.css`
- 새 `pages/home/upcoming/UpcomingGap.tsx`
