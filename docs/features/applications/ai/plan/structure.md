# 지원 관리 수정 계획: 파일 목록과 데이터 모양
전체 구조가 필요할 때만 읽는다. 처음 계획의 전체 구조는 [../../archive/plan-initial/structure.md](../../archive/plan-initial/structure.md).

## 1. 고칠 파일 (경로 기준 `apps/desktop/src/`)
새 파일은 `migrate.ts` 하나. Rust 쪽은 바꾸지 않는다 (백업 없음).

| 파일 | 변경 | 단계 |
|---|---|---|
| `features/applications/types.ts` | `EventKind`의 `applied` → `application-due`, `PropertyRole`에서 `deadline`·`appliedDate` 제거, `version: 2` | 1 |
| `features/applications/defaultProperties.ts` | 마감일·지원일 기본 속성 제거 | 1 |
| `features/applications/migrate.ts` (새로) | `migrateV1ToV2(raw)`: v1 객체 → v2 객체 (순수 함수) | 1 |
| `features/applications/storage.ts` | 읽은 파일이 v1이면 옮기고 바로 저장, v2가 아니면 지금처럼 오류 | 1 |
| `features/applications/statuses.ts` | `EVENT_KIND_LABELS`: "지원 완료" 대신 "지원 마감" | 1 |
| `features/applications/transitions.ts` | 지원 완료로 바꿀 때 일정 만들기·지원일 채우기 삭제 (R21) | 1 |
| `features/applications/calendarEntries.ts` | `groupEntriesByDate(applications)`: 지원 마감 일정은 지원 준비 카드만, 흐린 칸 (R8) | 1 |
| `features/applications/schedule.ts` | 1단계: 마감을 속성 대신 `application-due` 일정에서 읽음 / 2단계: `getNextItem(app, today)` R38 규칙, `sortByNextDate`, `getLastEvent`·`countEventsThisWeek` 기준 | 1, 2 |
| `pages/applications/properties/PropertyMenu.tsx` | `ROLE_DELETE_NOTE`에서 두 역할 문구 제거 | 1 |
| `pages/applications/calendar/CalendarView.tsx` | 새 `groupEntriesByDate` 호출 | 1 |
| `pages/applications/gallery/GalleryView.tsx` | `sortByNextDate`, 글자 "일정 가까운 순" | 1, 2 |
| `pages/applications/gallery/ApplicationCard.tsx` | 새 `getNextItem` 호출 | 1, 2 |
| `pages/applications/schedule/NextEventLabel.tsx` (+css) | "D-5 지원 마감" 회색, "지원 완료" 파랑 | 2 |
| `pages/applications/schedule/ScheduleButton.tsx` | 카드와 같은 규칙, 날짜 없으면 숨김 (D16 대체) | 2 |
| `pages/applications/schedule/SchedulePopover.tsx` (+css) | 종류 버튼 `KINDS` 순서, 지원 마감 색 | 3 |
| `pages/applications/schedule/ScheduleItemRow.tsx` | `sched-kind--application-due` 색 | 3 |
| `features/applications/reducer.ts` | `add-event`: 지원 마감이 이미 있으면 그 일정의 날짜만 바꿈 (R39) | 3 |
| `components/common/Modal.tsx` / `Modal.css` | 최대화로 바뀌는 순간에는 `left` 전환을 끄고, 최대화 상태에서 사이드바가 움직일 때만 켬 (R13) | 4 |

## 2. 데이터 모양
```ts
type EventKind = "application-due" | "assignment-due" | "coding-test" | "interview";
type PropertyRole = "priority" | "result" | "company";
// 파일: { version: 2, properties: PropertyDef[], applications: Application[] }

type NextItem =
  | { kind: "event"; event: ScheduleEvent; days: number }   // 전형 일정 (보라)
  | { kind: "deadline"; date: string; days: number }         // 지원 마감 (회색)
  | { kind: "applied" };                                     // "지원 완료" (파랑, 📅 옆에는 숨김)
```
옮기기 (v1 → v2): 마감일 값 → `{kind:"application-due", date}` 일정 추가, 지원일 값 삭제, `applied` 일정 삭제, 두 속성 정의 삭제.

## 3. 컴포넌트 구조
바뀌는 곳만 (나머지는 처음 계획 그대로):
```
ApplicationCard ─ NextEventLabel(getNextItem)      R38
ScheduleButton  ─ NextEventLabel(getNextItem, applied면 숨김)  R24
SchedulePopover ─ 종류 버튼 4개(지원 마감 먼저) → reducer add-event  R25·R39
Modal           ─ 최대화 전환 애니메이션 정리      R13
```

## C++ 비유
- `migrateV1ToV2`는 파일 형식 버전이 바뀔 때 쓰는 변환 함수(예: 직렬화 버전 번호를 보고 옛 구조체를 새 구조체로 채우는 코드)와 같다. 읽을 때 한 번 변환하고 새 버전으로 다시 쓴다.
- `NextItem`의 세 가지 모양은 `std::variant<Event, Deadline, Applied>`와 같고, `kind`가 어느 것인지 알려 주는 태그다.
