# r1 칩 (A6, A7)

## A6 지원 일정 고르기·배지 — 통과
- 테스트 내용: 지원 일정 칩 고르기, 이름, 이니셜 배지
- 근거: R11–R14
- 수행 방법: `features/calendar/items.ts`, `badge.ts`, `applications/calendarEntries.ts` `groupEntriesByDate`, `plan/applicationEvents.ts` `companyName` 읽기. cal-test.ts로 `buildCalItems`·`badgeColor`·`badgeInitial` 실행. `Chips.css`의 `cal-ini--N` grep
- 예상 결과: 지원 마감은 "지원 준비" 카드일 때만, 회사 없으면 카드 제목 첫 글자, 같은 회사 같은 색(7색)
- 실제 결과:
  - 지원 준비(a1)·지원 완료(a2) 카드 둘 다 지원 마감이 있을 때 지원 준비 카드 것만 나온다. 과제·코테·면접은 상태와 상관없이 나온다
  - 회사가 없는 카드는 text가 앞뒤 공백을 뺀 카드 제목 "회사없음카드", 배지 글자 "회"
  - "네이버" 일정 4개 모두 배지 6번. 이름 12개를 넣었을 때 색 번호는 모두 1~7. 빈 이름은 "?", 영문은 대문자
  - `Chips.css`에 `cal-ini--1` ~ `--7` 7개가 있다
- 판정: 통과

## A7 깃발 만들기 — 통과
- 테스트 내용: `buildCheckpoints` 실행
- 근거: R15, R16
- 수행 방법: cal-test.ts 실행 (주차형 3주차 프로젝트 + 단계형 프로젝트). `projects/weeks.ts` `weekRange`·`stageLabel`, `progress.ts` `isStageDone` 읽기
- 예상 결과: 주차형만, 각 주차 일요일, 끝난 주차는 isStageDone으로 완료 모양
- 실제 결과: 깃발 3개 모두 주차형 프로젝트 것이고 단계형은 없다. 날짜는 2026-11-08·11-15·11-22로 모두 일요일. 완료는 [true, false, false](1주차는 태스크 전부 완료, 2주차는 일부만 완료, 3주차는 태스크 없음). 이름표는 "포트폴리오 · 1주차 · 기획", "포트폴리오 · 2주차"
- 판정: 통과
