# r1 개인 일정 (A3, A8)

## A3 개인 일정 저장소 — 통과
- 테스트 내용: calendar.json 모양, 항목 모양, addEvent·updateEvent 규칙, 투데이와 떨어져 있는지
- 근거: R21, R22, R25, R26, L04
- 수행 방법: `features/calendar/types.ts`·`storage.ts`·`reducer.ts`·`store.tsx` 전체 읽기. cal-test.ts로 `createEmptyCalendarData`·`reducer`·`normalizeTime` 실행. `features/today`·`pages/today`에서 `features/calendar|useCalendar` grep. `src-tauri/src/calendar.rs`·`lib.rs` 등록 grep
- 예상 결과: 모두 규칙대로
- 실제 결과:
  - 빈 데이터는 `{"version":1,"events":[]}`. 읽을 때 `events` 배열이 없거나 version이 1이 아니면 예외를 던진다
  - 항목 키는 id·title·start·end·time·createdAt·updatedAt뿐이고 타이머·완료 필드가 없다
  - addEvent(store.tsx 54행)는 `start <= end`가 아니면 둘을 바꿔 넣고, `normalizeTime`으로 기간 일정의 time을 버린다. 공백만 있는 제목이면 null을 돌려준다 (React 훅이라 직접 실행하지 않고 계산식만 따라 검사함)
  - update에 빈 제목을 주거나 start를 끝일 뒤로 주면 같은 state를 그대로 돌려준다(무시). 끝일을 늘려 기간 일정이 되면 time은 null
  - 투데이 쪽 코드에서 캘린더 저장소를 가져다 쓰는 곳은 0건
- 판정: 통과

## A8 personalForm — 통과
- 테스트 내용: 편집 팝오버 입력 검사 순수 함수
- 근거: R26, R30, D9
- 수행 방법: `features/calendar/personalForm.ts` 전체 읽기, cal-test.ts 실행
- 예상 결과: 시작 11/10·끝 11/8 → 끝 11/10, 끝을 11/9로 → 오류, 시각은 하루짜리에만
- 실제 결과: `setFormStart`로 시작을 11/10으로 하면 끝이 11/10으로 따라온다. 그 뒤 `setFormEnd(11/9)`이면 "끝일이 시작일보다 빨라요"가 나오고 `canSaveForm`이 false. 하루짜리는 시각 모드를 켤 수 있고(빈 시각이면 09:00), 패치에 time이 들어간다. 끝을 11/12로 늘리면 timeMode가 "none"이 되고 패치 time은 null. 기간 일정에서는 시각 모드를 켤 수 없다. 공백 제목도 저장이 막힌다
- 판정: 통과
