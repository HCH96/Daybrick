# r2 · 전형 일정·상태 (A6, A8, A12, A13)

공통 수행 방법: `reducer.ts`의 `reducer`를 `{kind:"ready"}` 상태로 시험 파일에서 실행(`npx rolldown` → `node`). 상태 묶음(R21) 항목이 하나뿐이라 이 파일에 합쳤다.

## A6 상태를 지원 완료로 바꾸기
- 테스트 내용: 지원 준비 카드를 지원 완료로 바꿀 때 날짜·일정이 생기는지
- 근거 요구사항: R21
- 수행 방법: `reducer`의 `change-status`(→ `transitions.ts`의 `changeStatus`) 실행
- 예상 결과: 날짜·일정이 생기지 않음
- 실제 결과: `status: "applied"`, values `{}`, events `[]`. `changeStatus`는 상태·세부 단계만 바꾼다.
- 판정: **통과**

## A8 📅 옆 표시
- 테스트 내용: 📅 옆 표시가 카드와 같은 규칙인지
- 근거 요구사항: R24
- 수행 방법: `ScheduleButton.tsx`, `NextEventLabel.tsx` 읽음
- 예상 결과: 같은 계산, 날짜 없으면 표시 없음
- 실제 결과: `ScheduleButton`도 `getNextItem`을 쓰고 `NextEventLabel`에 `emptyText`를 넘기지 않는다. `NextEventLabel`은 `emptyText`가 없으면 `null`·`applied`일 때 아무것도 그리지 않는다. 날짜가 있으면 카드와 같은 "D-n …" 문구. 종료 카드는 `getNextItem`이 지난 일정을 빼므로 남은 일정이 없으면 표시 없음.
- 판정: **통과**
- 참고: `ScheduleButton`은 `new Date()`, 카드는 갤러리의 `today`를 쓴다. 자정을 넘길 때만 잠깐 다를 수 있다(규칙 차이는 아님).

## A12 📅 창 버튼 순서, 지원 마감 두 번 고르기
- 테스트 내용: 종류 버튼 순서, 지원 마감을 두 번 고를 때
- 근거 요구사항: R25, R39
- 수행 방법: `SchedulePopover.tsx`의 `KINDS`, `statuses.ts`의 `EVENT_KIND_LABELS` 읽음. `add-event`로 지원 마감 10-28 → 10-30 두 번 실행
- 예상 결과: 지원 마감→과제 마감→코딩테스트→면접, 두 번 골라도 하나이고 날짜만 바뀜
- 실제 결과: `KINDS = [application-due, assignment-due, coding-test, interview]` = 지원 마감, 과제 마감, 코딩테스트, 면접. 두 번 추가 뒤 일정 1개 `{id: due1, application-due, 2026-10-30}` — 첫 일정 id 그대로 날짜만 바뀜. 같은 날짜를 다시 고르면 카드를 그대로 돌려줌(코드 확인).
- 판정: **통과**

## A13 일정 고치기, 같은 종류 여러 개
- 테스트 내용: 일정을 고치면 수가 그대로인지, 면접 두 개가 따로 저장되는지
- 근거 요구사항: R26, R27
- 수행 방법: 위 카드에 면접 11-02(iv1)·11-09(iv2) 추가 후 `update-event`로 iv1을 11-03 15:00, 메모 "2차"로 고침
- 예상 결과: 고치면 일정 수 그대로, 면접 두 개 따로 저장
- 실제 결과: 고치기 전 3개 → 고친 뒤 3개. `iv1 interview 2026-11-03 15:00 "2차"`, `iv2 interview 2026-11-09`가 따로 있음
- 판정: **통과**
