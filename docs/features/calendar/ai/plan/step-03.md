# 캘린더 3단계: 칩 4종과 칸 배치

- 요구사항: R8–R18, R20
- 목업: `part-chips.html` chips-board·chips-app-kinds·chips-badges, `calendar.html` cal-grid (CSS: calendar.css에서 `.ch`, `.ch.t/.a/.f/.p`, `.ini`, `.h1`–`.h7`, `.cl/.cr`, `.dn`, `.ok` 검색. 아이콘: icons.js의 k-*, f-todo, f-ok)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D2, D3, D4, D8

## 할 일
- `items.ts`: 보이는 기간(그리드 첫날~끝날)의 `CalItem` 목록.
  - 태스크 (R9–R10): start·end가 있는 것. 색은 `taskGroupInfo`(프로젝트 태스크는 프로젝트 색), 완료면 `done`.
  - 지원 일정 (R11–R12): `groupEntriesByDate` + `companyName` (지원 마감은 "지원 준비" 카드만). 글자는 회사 → 카드 제목 → "제목 없음".
  - 깃발: `checkpoints.ts` 결과. 개인 일정: 저장소 그대로.
- `checkpoints.ts` (R15–R16, D4): 주차형만, 주차 i의 일요일 = `weekRange(project, i).end`, 글자 "프로젝트명 · 주차 이름"(`stageLabel`), 끝남 = `isStageDone`.
- `badge.ts` (R13, D3): 첫 글자(공백 제외), 색 번호 = 이름 문자 코드 해시 % 7 + 1.
- `monthLayout.ts` (R18, D8): 한 주(월요일) + 항목 → `WeekLayout`.
  - 여러 날(start≠end) 태스크·개인 일정은 `layoutWeekBars`와 같은 규칙(시작 칸 → 긴 것 → 만든 순)으로 줄.
  - 하루짜리는 그날 가장 아래 막대 줄 다음부터: 시간 있는 것 시간순 → 시간 없는 것 태스크 → 지원 → 깃발 → 개인.
  - 그날 항목이 5개 이상이면 1–3줄만, 4번째 줄은 +N(N = 전체 − 3). 4번째 줄 막대는 넘친 날에서 끊어 조각으로(끊긴 쪽은 잘림 표시). 5번째 줄 이하는 숨김.
- 칩 (R10, R12, R14, R17, R20, mockup.md): 높이 21px, 모서리 5px, 한 줄 말줄임.
  - 태스크 = 색 바탕 + 왼쪽 3px 띠(왼쪽이 잘리면 띠 없음), 완료 42%.
  - 지원 = 회색 바탕 + 배지 → 회사 → 시각 → 오른쪽 종류 아이콘(면접 보라, 나머지 흐린 회색).
  - 깃발 = 바탕 없이 프로젝트 색 깃발(끝남 = 채운 깃발 + 체크, 앞으로 = 테두리만).
  - 개인 = 점선 테두리 + 회색 글자, 시각 → 제목.
  - 잘린 막대는 잘린 쪽 모서리를 펴고 끝 18px에서 옅어짐. 마우스 올림 밝기 +22%·1px 위·그림자 120ms, 깃발은 회색 바탕만.
- R8: 플랜·지원·투데이 저장소를 읽기만 하므로 바꾸면 바로 다시 그려진다.

## 확인할 결과
- `npm run build` 성공.
- Node로 `monthLayout`을 돌린 결과: (a) 3일 막대 + 시간 있는 지원 + 시간 없는 태스크가 있는 날의 줄 순서가 막대 → 지원 → 태스크, (b) 6개인 날은 3개 + "+3", (c) 4번째 줄 막대가 넘친 날에서 두 조각으로 나뉜다.
- 화면: 화~다음 주 화 태스크가 일요일 칸 끝에서 잘려 옅어지고, 다음 줄은 띠 없이 시작한다. 완료 태스크는 흐리다.
- 지원 칩은 배지·회사·시각·아이콘. "지원 준비" 카드의 지원 마감만 보이고, 상태를 "지원 완료"로 바꾸면 사라진다. 같은 회사 카드 둘은 같은 배지 색, 회사가 없는 카드는 카드 제목 첫 글자.
- 11/2 시작 4주 주차형 프로젝트는 11/8·15·22·29에 깃발, 1주차 태스크를 모두 완료하면 11/8 깃발이 체크 모양. 단계형 프로젝트는 나오지 않는다.
- 플랜에서 태스크 날짜를 바꾸고 돌아오면 캘린더에 바로 반영.

## 이 단계에서 만들거나 고칠 파일
- 새 `features/calendar/items.ts`, `checkpoints.ts`, `badge.ts`, `monthLayout.ts`
- 새 `pages/calendar/chips/CalChip.tsx`, `TaskChip.tsx`, `AppChip.tsx`, `FlagChip.tsx`, `PersonalChip.tsx`, `Chips.css`
- 새 `components/icons/CalendarIcons.tsx`
- `pages/calendar/grid/MonthGrid.tsx`, `WeekRow.tsx`, `Grid.css`
