# r2 다가오는 7일 (R29–R34, R13)

공통 수행 방법: `npx rolldown src/features/home/upcoming.ts --format esm --file <임시>/upcoming.mjs`로 묶고, 임시 스크립트 `t.mjs`에서 하루 칸 7개(dateKey, isToday, rows 개수만 다르게)를 만들어 `groupUpcoming`·`gapLabel`·`dayParts`를 실행했다. 오늘 = 2026-11-09(월).

## A5. groupUpcoming 예시 1
- 근거 요구사항: R33, D19
- 테스트 내용: 하루별 개수 [2, 1, 0, 0, 0, 1, 1]
- 예상 결과: day(9), day(10), gap(11/11–11/13), day(14), day(15)
- 실제 결과: `day(09,2) day(10,1) gap(11-11~11-13) day(14,1) day(15,1)`
- 판정: 통과

## A6. groupUpcoming 예시 2
- 근거 요구사항: R33, D19
- 테스트 내용: [0, 0, 0, 1, 0, 0, 0]
- 예상 결과: day(9, 빈 오늘), gap(11/10–11/11), day(12), gap(11/13–11/15)
- 실제 결과: `day(09,0) gap(11-10~11-11) day(12,1) gap(11-13~11-15)`
- 판정: 통과

## A7. 빈 날 줄 문구
- 근거 요구사항: R33
- 수행 방법: `gapLabel("2026-11-12","2026-11-12")`, `gapLabel("2026-11-11","2026-11-13")`, `UpcomingGap.tsx` 읽기
- 예상 결과: "11/12", "11/11 – 11/13", 화면에 "· 일정 없음"
- 실제 결과: `11/12`, `11/11 – 11/13`. UpcomingGap이 `{gapLabel} · 일정 없음`으로 그림
- 판정: 통과

## A8. dayParts
- 근거 요구사항: R29, R33, L53
- 예상 결과: 11/9→9·오늘, 11/10→10·내일, 11/14→14·토·sat, 11/15→15·일·sun
- 실제 결과: 네 경우 모두 예상대로. 내일이 토(오늘 11/13)면 `{14, "내일", sat}`, 내일이 일(오늘 11/14)이면 `{15, "내일", sun}`, 오늘이 일이면 `{15, "오늘", sun}`. `UpcomingDay.tsx`는 오늘이 아닐 때만 토·일 class를 붙이고, CSS에서 오늘 보라가 먼저 → 내일 토·일은 파랑·빨강 "내일"(L53 메모와 같음)
- 판정: 통과

## A9. 7일 모두 빈 상태
- 근거 요구사항: R34
- 수행 방법: [0×7] 실행, `UpcomingCard.tsx` 읽기
- 예상 결과: 빈 상태 조건 유지, 오류 없음
- 실제 결과: `day(09,0) gap(11-10~11-15)`, 오류 없음. 카드는 groupUpcoming 전에 `days.every(rows.length === 0)`이면 "앞으로 7일 동안 일정이 없어요" 빈 상태를 보임
- 판정: 통과

## A10. buildUpcoming·UpcomingDay 모양 유지
- 근거 요구사항: R13, R29, D19
- 수행 방법: `git diff 23da8fd~1 HEAD -- features/home/upcoming.ts`, `SummaryStrip.tsx`·`features/home/summary.ts` grep
- 예상 결과: 바뀌지 않음
- 실제 결과: diff는 import에 `diffDays` 추가와 파일 끝 `dayParts`·`groupUpcoming`·`gapLabel` 추가뿐. `UpcomingRow`·`UpcomingDay`·`buildUpcoming`은 그대로. 요약 줄은 `buildUpcoming` 결과를 `nextEvent(upcoming, now)`에 넘김
- 판정: 통과

## A11. 칩 종류 표시
- 근거 요구사항: R33
- 수행 방법: `UpcomingRow.tsx`, `Upcoming.css` 읽기
- 예상 결과: 네 종류 맞게 나뉨
- 실제 결과: 태스크·깃발은 `upcoming-row--band`(왼쪽 3px `--c` 색 띠), 깃발은 프로젝트 색 FlagIcon 추가. 지원은 이니셜 배지(`--initial-1~7`) + `AppKindIcon`(면접만 밝게). 개인은 `--muted` 점. 시각은 `time &&`일 때만 그림
- 판정: 통과

## A20. 칩 → 캘린더, 스크롤·흐림
- 근거 요구사항: R34
- 수행 방법: `UpcomingRow.tsx`, `UpcomingCard.tsx`, `DashboardCard.tsx`, `dashboardCards.tsx`, CSS 읽기
- 예상 결과: 유지됨
- 실제 결과: 칩 클릭 `navigate("calendar")`. 카드 size "large" → `dashboard-card__scroll`(overflow auto) 안에 본문. 목록 끝 `upcoming__fade`(sticky bottom, surface로 흐림)
- 판정: 통과
