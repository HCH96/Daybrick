# 알림 2단계: 종 아이콘·배지

- 요구사항: R1–R5
- 목업: bell.html (bell-states)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙

## 할 일
- `components/icons/TitleBarIcons.tsx`에 `BellIcon`을 추가한다 (목업 icons.js의 종 모양, `LineIcon` 틀 사용).
- `components/notifications/NotificationBell.tsx`(+css)를 만든다.
  - 30px 칸, 16px 회색 선 아이콘 (`.titlebar__button`과 같은 hover·focus).
  - 배지: 안 읽은 알림 수, 높이 16px 알약 모양, `#F0524F` 바탕에 흰 글자 10px 굵게, 제목 표시줄 색 테두리 2px. 0개면 숨기고 100개 이상이면 `99+` (R2–R4).
  - 이번 단계에서 누르는 동작은 없다 (3단계에서 패널을 연결).
- `TitleBar.tsx`의 `WindowControls` 바로 왼쪽에 넣고 오른쪽 여백을 4px 둔다. 단순 버전(마법사·업데이트 화면) 제목 표시줄에도 넣는다 (R1).
- `styles/theme.css`에 배지 색 토큰(예: `--badge`)을 추가한다.
- 서버 연결과 상관없이 로컬 알림만으로 동작해야 한다 (R5).

## 확인할 결과
- 콘솔로 알림을 0개, 3개, 120개 만들면 배지가 각각 없음, `3`, `99+`로 보인다.
- 서버 연결 정보가 없어도 종과 배지가 보인다.
- 종 왼쪽 빈 곳을 끌면 창이 움직이고, 종을 눌러 끌면 창이 움직이지 않는다 (결과는 진행 기록에 적는다).
- 마법사·첫 실행 화면에서도 종이 보인다.
- `npm run build`가 성공한다.

## 이 단계에서 만들거나 고칠 파일
- `components/icons/TitleBarIcons.tsx`
- `components/notifications/NotificationBell.tsx`, `NotificationBell.css`
- `components/layout/TitleBar.tsx`, `TitleBar.css`
- `styles/theme.css`
