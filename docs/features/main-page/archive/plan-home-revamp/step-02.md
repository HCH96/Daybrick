# 메인 페이지 수정1 2단계: 다가오는 7일

- 요구사항: R29–R34
- 목업: `dash.html` dash-upcoming 구역, `part-empty.html` empty-upcoming 구역 (CSS: dash.css·common.css에서 `.up-`, `.day-head`, 이니셜 배지 `.badge`, 깃발 `.flag`, 카테고리 점 검색)
- 경로 기준: [index.md](index.md) 맨 위

## 할 일
- 새 `features/home/upcoming.ts`: `buildUpcoming(src: CalSources, todayKey): UpcomingDay[]`.
  - `buildCalItems(src, today, today+6)`(캘린더)로 모은 뒤 홈 규칙을 더한다 (R30–R31, D6):
    - 태스크는 끝나는 날에만 한 번, 완료 태스크는 뺀다.
    - 여러 날 개인 일정은 7일 안의 첫날에 한 번 넣고 `endLabel = "~11/12"`를 붙인다.
    - 지원·깃발은 그날에 한 번.
  - 날짜 안 순서 (R32): 시각 있는 것(시각순) → 시각 없는 것(지원 → 깃발 → 개인 → 태스크).
  - 날짜 머리 (R29): "오늘", "내일", 그 뒤 "11/10 (화)". 오늘 머리 옆에 "11/7 (토)"를 작게 쓰는 것은 화면에서 한다.
- `upcoming/UpcomingCard.tsx`: usePlan·useApplications·useCalendar로 `CalSources`를 만든다. 어느 하나라도 불러오는 중이면 loading, 모두 실패면 error, 7일 모두 비면 CardState empty("앞으로 7일 동안 일정이 없어요" + [캘린더로 가기]) (R34).
- `UpcomingDay`: 날짜 머리. 항목 없는 날은 머리만 흐리게 (R33).
- `UpcomingRow` (R33): 종류 표시(태스크 = 카테고리·프로젝트 색 점, 지원 = 회사 이니셜 배지 `badgeInitial`·`badgeColor`, 깃발 = 프로젝트 색 깃발, 개인 = 기본 색 점) + 시각 + 제목. 지원 줄 오른쪽 끝에 전형 종류 아이콘(면접만 강조색). 줄 높이 32px, 마우스를 올리면 배경이 밝아짐. 누르면 `navigate("calendar")` (R34).
- 넘치면 카드 안에서 스크롤, 아래 흐림 처리 + 얇은 스크롤 막대 (R34).

## 확인할 결과
- `npm run build` 성공.
- Node로 `buildUpcoming` 실행 (오늘 = 2026-11-07):
  - 11/5~11/9 태스크 → 11/9에만 한 번 / 완료 태스크 → 없음
  - 11/9~11/12 개인 일정 → 11/9에 "~11/12" / 11/3~11/8 개인 일정 → 11/7(오늘)에 "~11/8"
  - 같은 날 14:00 면접, 10:00 개인, 시각 없는 서류 마감·깃발·태스크 → 10:00 개인, 14:00 면접, 서류 마감, 깃발, 태스크 순서
  - 11/14 항목 → 빠짐 (7일 밖)
- 화면: 실제 데이터로 날짜 머리 7개, 빈 날은 흐림, 넘치면 카드 안 스크롤(본문은 따로 스크롤), 줄을 누르면 캘린더.
- 데이터를 모두 비우면 빈 상태 문구와 [캘린더로 가기]가 보인다.

## 이 단계에서 만들거나 고칠 파일
- 새 `features/home/upcoming.ts`
- 새 `pages/home/upcoming/UpcomingCard.tsx`, `UpcomingDay.tsx`, `UpcomingRow.tsx`, `Upcoming.css`
- `pages/home/dashboardCards.tsx` (다가오는 7일 body)
