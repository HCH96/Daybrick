# 지원 관리 수정1 1단계: 저장 데이터 v2와 자동 옮기기

- 요구사항: R40, R21, R33, R8 (영향: R7, R28)
- 목업: part-schedule.html, calendar.html (calendar-grid)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙

## 할 일
- 데이터 모양을 v2로 바꾼다 ([structure.md](structure.md) "2. 데이터 모양"): 마감일·지원일 기본 속성과 역할, `applied` 일정 종류를 없애고 `application-due`(지원 마감)를 넣는다.
- `migrate.ts`에 `migrateV1ToV2`를 만들고, `storage.ts`가 v1을 읽으면 옮긴 뒤 바로 저장한다 (백업 없음).
- 지원 완료로 바꿀 때 일정·날짜를 만들지 않는다 (R21).
- 마감을 속성 대신 지원 마감 일정에서 읽도록 `schedule.ts`·`calendarEntries.ts`의 인자를 바꾸고 호출하는 곳을 고친다. 카드 표시 규칙 자체는 2단계에서 바꾼다(이 단계에서는 지금 동작 유지).
- 달력: 지원 마감 일정은 지원 준비 카드만, 흐린 점선 칸 (R8).
- 속성 삭제 확인 창의 마감일·지원일 안내 문구를 없앤다.

## 확인할 결과
- 옮기기 전 (v1 예시): `{version:1, properties:[…, {id:"deadline"}, {id:"applied-date"}, …], applications:[{status:"preparing", values:{deadline:"2026-10-28", "applied-date":"2026-10-20"}, events:[{kind:"applied", date:"2026-10-20"}, {kind:"interview", date:"2026-11-02"}]}]}`
- 옮긴 뒤 (v2): `{version:2, properties:[마감일·지원일 없음], applications:[{status:"preparing", values:{}, events:[{kind:"interview", date:"2026-11-02"}, {kind:"application-due", date:"2026-10-28"}]}]}`
- 앱을 열면 속성 목록에 마감일·지원일이 없고, 다시 켜도 그대로다. 📅 창 목록에 옮긴 "지원 마감" 일정이 보인다.
- 카드를 지원 완료로 바꿔도 📅 목록에 새 일정이 생기지 않는다 (r1 12번).
- 달력: 지원 준비 카드의 지원 마감만 점선·흐린 칸, 다른 상태 카드의 지원 마감은 안 보인다 (r1 26번 다시 확인).
- 우선순위·결과·회사 속성 삭제 확인 창은 예전 문구 그대로, 지원일 문구는 없다 (r1 22번은 R40으로 대상이 없어짐).
- `npm run build` 성공.

## 목업과 다른 점
- popup.html 속성 목록의 마감일·지원일 행이 없어진다.

## 이 단계에서 만들거나 고칠 파일
- `features/applications/`: `types.ts`, `defaultProperties.ts`, `migrate.ts`(새로), `storage.ts`, `statuses.ts`, `transitions.ts`, `calendarEntries.ts`, `schedule.ts`
- `pages/applications/`: `properties/PropertyMenu.tsx`, `calendar/CalendarView.tsx`, `gallery/GalleryView.tsx`, `gallery/ApplicationCard.tsx`, `schedule/ScheduleButton.tsx`(호출만)
