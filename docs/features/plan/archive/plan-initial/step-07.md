# 플랜 7단계: 지원 일정 표시

- 요구사항: R31–R34
- 목업: `plan.html` plan-sched·plan-calbar 구역, `part-calendar.html` cal-events 구역, `plan-empty.html` plan-empty-cal(스위치 꺼짐) (CSS: plan.css·parts.css·common.css)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D8, D10, D16
- 일정 규칙: 지원 관리 명세서 req-schedule.md (R23–R27, R39)

## 할 일
- `features/applications/calendarEntries.ts`: `CalendarEntry`에 `kind: EventKind`를 더한다 (넣기만, 지원관리 달력은 그대로).
- `features/plan/applicationEvents.ts`: `groupEntriesByDate`를 그대로 써서(지원 마감은 "지원 준비" 카드만, R31) 이번 주 7일 알약 목록을 만든다. 글자는 회사 속성(`role: "company"`, 고른 항목 이름)이 있으면 회사, 없으면 카드 제목, 둘 다 없으면 "제목 없음".
- `calendar/SchedLayer`·`SchedPill`: 날짜 칸 위쪽 알약(아이콘 + 글자 + 시간). 지원 마감 빨강 깃발, 과제 주황 문서, 코딩테스트 보라 코드, 면접 청록 사람. 막대 영역과 점선으로 구분. 끌 수 없음 (R32).
- `calendar/SchedTooltip`: 마우스를 올리면 카드 제목·종류·시간 풍선 (목업 제안).
- `calendar/ScheduleSwitch` (R33): `WeekNav` 오른쪽 `지원 일정` 스위치 → `set-show-application-events` (저장됨). 꺼지면 일정 층 전체를 숨긴다.
- 알약 클릭 → `PlanPage`의 `openApplicationId` → `ApplicationDetailModal` (D16).
- 지원 데이터는 `useApplications()`를 읽기만 하므로 지원관리에서 바꾸면 바로 반영된다 (R34). 지원 데이터가 아직 읽는 중·실패면 일정 층만 비운다.
- `PlanIcons.tsx`: 깃발·문서·코드·사람 아이콘.

## 확인할 결과
- `npm run build` 성공.
- 지원관리에서 이번 주에 일정 4종을 만들면 플랜 달력 위쪽에 종류별 아이콘·색 알약으로 보이고, 시간이 있으면 시간도 보인다.
- 지원 마감은 "지원 준비" 카드일 때만 보이고, 지원 완료로 바꾸면 사라진다.
- 알약에 마우스를 올리면 풍선, 누르면 지원관리 상세 팝업이 플랜 화면 위에 뜨고 닫으면 플랜에 그대로 있다. 알약은 끌어지지 않는다.
- 팝업에서 일정 날짜를 바꾸면 달력 알약이 바로 옮겨진다.
- 스위치를 끄면 알약이 모두 숨고, 앱을 다시 켜도 꺼져 있다.
- 지원관리 달력 보기가 예전과 똑같이 보인다.

## 이 단계에서 만들거나 고칠 파일
- `apps/desktop/src/features/applications/calendarEntries.ts`
- 새 `features/plan/applicationEvents.ts`, `features/plan/reducer.ts`·`store.tsx`(스위치)
- `components/icons/PlanIcons.tsx`
- 새 `pages/plan/calendar/SchedLayer.tsx`, `SchedPill.tsx`, `SchedTooltip.tsx`, `ScheduleSwitch.tsx`
- `pages/plan/calendar/WeekCalendar.tsx`·`WeekCalendar.css`, `WeekNav.tsx`, `PlanPage.tsx`
