# r1 페이지·월 달력 (A2, A4, A5, A11, A13)

## A2 메뉴 교체 — 통과
- 테스트 내용: `scheduler` 남은 곳, 사이드바 순서, 홈 카드 이동 대상
- 근거: R1, R7, L01·L03
- 수행 방법: `grep -rni scheduler apps/desktop/src` 및 apps·supabase 아래 ts/tsx/rs/css/json. `app/pages.ts` id 순서, `app/pageLabels.ts`, `pages/home/dashboardCards.tsx` 40–50줄
- 예상 결과: scheduler 0건, Projects 다음 calendar, 홈 링크 calendar
- 실제 결과: 소스(src)에서 0건. 나온 것은 `package-lock.json`의 npm 패키지 `scheduler`(React가 쓰는 의존성)뿐이라 기능과 상관없다. 메뉴 순서는 home → plan → projects → calendar → applications → …이고, 사이드바 이름 `Calendar`, 화면 제목 "캘린더". "오늘 일정" 카드의 `linkTo`(44줄)와 `EmptyState linkTo`(47줄) 둘 다 `"calendar"`
- 판정: 통과
- 참고: 47줄 빈 상태 문구와 `SummaryStrip.tsx` 19줄에 한글 "스케줄러"가 남아 있다. R7은 카드 내용을 바꾸지 말라고 하므로 이번 판정에는 넣지 않았다.

## A4 월 그리드 함수 — 통과
- 테스트 내용: `utils/calendarGrid.ts` `getMonthGrid(year, month, 1)`(월요일 시작, MonthGrid.tsx 156줄과 같은 인자)
- 근거: R2
- 수행 방법: cal-test.ts 실행
- 예상 결과: 2026년 11월 6줄(첫 칸 10/26, 끝 칸 12/6), 2026년 2월 5줄, 2027년 2월은 줄 수 보고
- 실제 결과: 2026-11 6줄, 2026-10-26 ~ 2026-12-06. 2026-02 5줄(2026-01-26 ~ 2026-03-01). 2027-02는 4줄, 2027-02-01 ~ 2027-02-28이고 모든 칸이 그달 날짜
- 판정: 통과

## A5 monthLayout — 통과
- 테스트 내용: `layoutWeek` 줄 순서, 넘침, +N, 4번째 줄 막대 끊김, 주 경계 잘림
- 근거: R5, R9, R18, R27, D8, L06
- 수행 방법: `buildCalItems` → `layoutWeek` 실행 (주 시작 2026-11-09)
- 예상 결과: 막대 → 시간 있는 것(시간순) → 시간 없는 것(태스크→지원→깃발→개인), 6개인 날 3개+"+3"
- 실제 결과:
  - 11/11에 막대 태스크 1 + 개인 09:00 + 면접 14:00 + 태스크 + 코테(시간 없음) + 개인(시간 없음) = 6개 → 보이는 칩 3개(막대, 개인 09:00, 면접 14:00), "+3". +N 목록 순서도 규칙과 같음. 깃발은 그 주 일요일 칸에 따로
  - 하루짜리 4개 → 넘침 아님, 4개 다 보임. 5개 → 3개 + "+2" (필요 줄 수 4 초과일 때만 넘침)
  - 월–금 막대 4개 + 수요일 하루짜리 1개 → 4번째 줄 막대가 월–화(오른쪽 잘림), 목–금(왼쪽 잘림)으로 끊기고, 수요일 "+2"
  - 11/6–11/10은 왼쪽만 잘림(2칸), 11/14–11/18은 오른쪽만 잘림(토요일부터), 11/1–11/30은 양쪽 잘림(7칸)
- 판정: 통과

## A11 통계 없음·빈 상태 문구 — 통과
- 테스트 내용: 캘린더 화면에 합계·비율·D-day가 없는지, 회고 빈 상태 문구
- 근거: R6, R47
- 수행 방법: `pages/calendar/**`에서 `useToday|collectSlices|ratio|비율|합계|D-` grep. `review.ts` 반환 모양, `ReviewPanel.tsx` 28–70줄
- 예상 결과: 합계·비율·D-day 없음, 빈 상태 문구 있음
- 실제 결과: `useToday`는 ReviewPanel에서 기록 구간을 그리는 데에만 쓴다. 합계·비율 계산이나 D-day 표시 코드는 없고, D-day는 MonthHeader 주석에 "넣지 않는다"로만 나온다. `buildReview`는 allDay·timeline·done만 돌려준다. 세 목록이 다 비면 "이날은 남은 기록이 없어요"를 보여준다
- 판정: 통과

## A13 바로 반영 — 통과
- 테스트 내용: 캘린더가 저장소 상태를 구독하는지
- 근거: R8
- 수행 방법: `pages/calendar/grid/MonthGrid.tsx` 155–170줄, `ReviewPanel.tsx` 30–50줄, `checkpoints.ts` 읽기
- 예상 결과: 플랜·지원·프로젝트 저장소를 구독(복사본 아님)
- 실제 결과: MonthGrid와 ReviewPanel이 `usePlan().state`·`useApplications().state`·`useCalendar().state`를 렌더할 때마다 읽고, `useMemo` 의존값에 넣어 바뀌면 다시 계산한다. 프로젝트(주차·깃발)는 PlanData의 `projects`에서 `buildCheckpoints`로 만든다. 따로 state에 복사해 두는 코드는 없다
- 판정: 통과
