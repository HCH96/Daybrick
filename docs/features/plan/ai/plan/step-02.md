# 플랜 수정1 2단계: 요일 머리·완료 표시

- 요구사항: R21, R14 상태 표 (영향: R18, R24, R31)
- 목업: `plan.html` plan-week·plan-sched·plan-bars·plan-list 구역, `part-list.html` list-rows 구역, `part-calendar.html` cal-events 구역 (CSS: plan.css·common.css·parts.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D13, D19, D21, D23

## 할 일
- `calendar/DayHeader.tsx` (R21, B2): 영어 요일 `Mon`~`Sun` + 날짜 숫자 한 줄, 둘 다 13px 같은 굵기(숫자만 밝은 색). 오늘은 둘을 옅은 보라 알약으로 감싸고 칸 전체를 아주 옅은 보라로. 토요일 파랑, 일요일 빨강 글자.
- `StatusDot.tsx`·`.css` (R14, C1): 완료는 초록 채운 원(`#66CF95`) + 정가운데 체크(SVG 그림). 시작 전·진행 중은 그대로. 목록·막대·팝업이 같이 쓴다(D19).
- 취소선 빼기: `list/TaskList.css`(완료 줄), `calendar/WeekCalendar.css`(완료 막대, R24), `detail/Checklist.css`(체크 항목). 흐리게만 남긴다.
- `calendar/SchedTooltip.tsx` (R31): "누르면 지원관리 카드가 열려요" 줄을 지운다. 카드 제목·종류·시간은 그대로.

## 확인할 결과
- `npm run build` 성공.
- 요일 머리가 `Mon 2 … Sun 8` 한 줄이고 요일과 숫자 크기·굵기가 같다. 오늘 칸에 보라 알약, 토 파랑·일 빨강.
- 상태 표시를 눌러 완료로 바꾸면 초록 원 가운데에 체크가 치우치지 않게 보인다 (목록·막대·팝업 모두). 시작 전 → 진행 중 → 완료 → 시작 전 순서는 그대로(R18).
- 완료한 목록 줄·달력 막대·체크한 체크리스트 항목에 취소선이 없고 흐리게만 보인다.
- 지원 일정 알약에 마우스를 올린 풍선에 안내 문구가 없다.

## 이 단계에서 고칠 파일
- `apps/desktop/src/pages/plan/calendar/DayHeader.tsx`, `WeekCalendar.css`, `SchedTooltip.tsx`
- `pages/plan/StatusDot.tsx`·`StatusDot.css`
- `pages/plan/list/TaskList.css`, `pages/plan/detail/Checklist.css`
