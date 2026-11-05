# r1 상호작용·플랜 연동 (A9, A12)

## A9 드래그 옮기기 계산·규칙 — 통과
- 테스트 내용: 칩 드래그로 옮길 때의 날짜 계산과 막는 규칙
- 근거: R35, R36, R38–R40
- 수행 방법: `pages/calendar/drag/useCalendarDrag.ts` 전체, `grid/useRangeSelect.ts` `dayAt`, `chips/CalChip.tsx` 30–70줄, `plan/dragMath.ts` `moveBy` 읽기. 훅 안의 계산식(`dropAt`: 잡은 날→놓은 날 차이만큼 시작·끝을 옮김, `up`: 시작일 차이만큼 이동)을 cal-test.ts에서 같은 식으로 실행하고, `moveBy`와 reducer `move`는 직접 실행
- 예상 결과: 11/10–12 가운데 잡고 11/18에 놓으면 11/17–19, 완료 태스크 가능, 다른 달 칸 가능, 지원·깃발 불가, 길이 유지
- 실제 결과:
  - 잡은 날 11/11 → 놓은 날 11/18이면 놓일 기간 11/17–11/19. 태스크는 `moveBy`, 개인 일정은 reducer `move`로 둘 다 11/17–11/19가 되어 길이가 그대로다
  - `onChipDown`·`CalChip`에 완료 여부를 보는 조건이 없어 완료 태스크도 끌 수 있다
  - `dayAt`은 `.cal-week[data-week]` 주 줄에서 칸을 고르며 그달 날짜인지 따지지 않는다. 12/3 칸에 놓는 계산도 12/2–12/4로 맞다
  - `item.kind`가 app·flag이면 `locked`가 되어 흔들기만 하고 옮기지 않는다
  - 캘린더 쪽 코드에는 길이(시작·끝 하나만)를 바꾸는 드래그가 없다
- 판정: 통과

## A12 플랜 연동 — 통과
- 테스트 내용: 플랜 주간 달력의 개인 일정 표시
- 근거: R31–R34
- 수행 방법: `pages/plan/calendar/WeekCalendar.tsx` 30–130줄, `PersonalLayer.tsx` 전체 읽기
- 예상 결과: 개인 일정은 지원 일정 스위치와 상관없이 보임, 하루 종일 일정 있는 날만 칸 어두움, 플랜에서 끌 수 없음
- 실제 결과:
  - 개인 일정(`personal`)은 `calEvents`·`weekStart`만으로 만든다. `PersonalLayer`는 조건 없이 그리고, `showApplicationEvents`는 `SchedLayer`에만 쓰인다
  - `busyDays`는 time이 null인 개인 일정(기간 일정 포함)이 덮는 그 주 안의 날만 모아 `plan-cols__busy`를 붙인다. 시각 있는 일정은 빠진다
  - `PersonalLayer`의 버튼에는 `onClick`(캘린더 `PersonalEditPopover` 열기)만 있고 mousedown·드래그 연결이 없다
- 판정: 통과
