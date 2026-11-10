# 플랜 수정1 1단계: 페이지 머리·배치·창 크기

- 요구사항: R1, R4, R46 (영향: R2, R33)
- 목업: `plan.html` plan-head·plan-quick·plan-list 구역, `plan-narrow.html` 전체 (CSS: plan.css·common.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D6, D21·D23(L17에서 변경), D28, D29, D30

## 할 일
- `app/pageLabels.ts`: 사이드바 이름과 화면 제목 모두 `Plan` (R1).
- `utils/date.ts`: `isoWeekNumber(key)` (ISO 주, 월요일 시작, D29).
- `features/plan/format.ts`: `formatWeekTitle(weekStart)` → `{ title, week }`.
  - 한 달: `November 2026` / 두 달: `Oct – Nov 2026` / 해가 걸침: `Dec 2026 – Jan 2027`. 달 이름은 영어(한 달이면 전체 이름, 걸치면 세 글자).
  - `week`: `Week 45`. 기존 `formatWeekPeriod`는 쓰는 곳이 없어지면 지운다.
- `WeekNav`: 기간 글자(19px 굵게) + 회색 칩 → `‹ 이전 주` `이번 주` `다음 주 ›` → 세로 구분선 + `ScheduleSwitch`. 줄바꿈 없음(`white-space: nowrap`, 기간은 줄어들지 않음).
- `PlanPage`: 머리 왼쪽 제목, 오른쪽 `WeekNav`. `WeekCalendar` 안의 달력 위 줄은 없앤다(스위치 상태·동작은 그대로, R33).
- `PlanPage.css` 배치: `minmax(200px, 2fr) 5fr` (D30, R2·R46). 목록·달력 모두 `min-width: 0`.
- 좁은 창(960×640, R46): 빠른 입력 옆 카테고리 칩은 색 점만, 요일 머리 칸 여백 줄임, 지원 일정 알약은 시간부터 숨김. CSS로만.

## 확인할 결과
- `npm run build` 성공.
- 사이드바와 화면 제목이 `Plan`이다.
- 이번 주(11/2–11/8)에 제목 줄 오른쪽 `November 2026` + `Week 45`, 주 이동 3버튼, 구분선, `지원 일정` 스위치가 한 줄로 보인다. 스위치를 끄고 켜면 지원 일정이 사라졌다 나타나고, 다시 열어도 유지된다.
- 10/26 주는 `Oct – Nov 2026`, 12/28 주는 `Dec 2026 – Jan 2027` (L16 테스트 메모). `formatWeekTitle`·`isoWeekNumber`는 Node로 실행해 세 경우와 2026-01-01(Week 1), 2026-12-28(Week 53)을 확인한다.
- 1440 창에서 목록:달력 폭이 약 2:5, 창을 줄이면 두 영역이 함께 줄고 목록은 200px에서 멈춘다.
- 960×640에서 머리가 한 줄이고 기간 글자 모양·크기가 그대로이며 요일 칸이 넘치지 않는다 (L16 테스트 메모).

## 이 단계에서 고칠 파일
- `apps/desktop/src/app/pageLabels.ts`, `utils/date.ts`, `features/plan/format.ts`
- `pages/plan/PlanPage.tsx`·`PlanPage.css`, `WeekNav.tsx`
- `pages/plan/calendar/WeekCalendar.tsx`·`WeekCalendar.css`, `ScheduleSwitch.tsx`
- `pages/plan/list/QuickAdd.tsx`, `list/TaskList.css`
