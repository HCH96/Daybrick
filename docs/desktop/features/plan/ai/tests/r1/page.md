# 페이지 (req-page)

## A3 주 시작일과 기간 글자
- 테스트 내용: `startOfWeek`, `formatWeekPeriod` 실행
- 근거 요구사항: R3, R4
- 수행 방법: 임시 테스트 파일을 rolldown으로 묶어 `node` 실행 (utils/date.ts `startOfWeek`, features/plan/format.ts `formatWeekPeriod`)
- 예상 결과: 2026-11-02(월)·11-08(일) → 11-02, 기간 글자 세 가지 모양
- 실제 결과:
  - `startOfWeek("2026-11-02")`, `startOfWeek("2026-11-08")` 모두 `2026-11-02`
  - 같은 달 `2026년 11월 2일 – 8일`, 달 넘김 `2026년 11월 30일 – 12월 6일`, 해 넘김 `2026년 12월 28일 – 2027년 1월 3일`
- 판정: 통과

## A16 메뉴 id, 홈 카드, CalendarIcon
- 테스트 내용: 메뉴 id가 `plan`, 홈 "오늘 할 일" 카드가 plan으로 이동, `CalendarIcon`이 남아 있음
- 근거 요구사항: R1, D11, L04
- 수행 방법: grep으로 app/pages.ts, app/types.ts, pages/home/dashboardCards.tsx, components/icons/NavIcons.tsx 확인
- 예상 결과: 셋 다 코드에서 확인
- 실제 결과:
  - pages.ts에 `id: "plan"`(아이콘 `PlanIcon`, `PlanPage`), `PageId`에 `"plan"`이 있고 `"calendar"`는 없음
  - dashboardCards.tsx "오늘 할 일" 카드 `linkTo: "plan"`, 빈 상태도 `linkTo="plan"`
  - NavIcons.tsx에 `CalendarIcon`이 남아 있고 job-search ScheduleSuggestDialog가 사용 중
- 판정: 통과
