# 투데이 8단계: 미완료 팝업

- 요구사항: R7, R34–R39
- 목업: `part-overdue.html` overdue-list·-row1·-row2·-picker 구역 (CSS: popup.css·common.css에서 클래스 검색)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D2

## 할 일
- 계산 (`overdue.ts`):
  - `listOverdue(tasks, today)`: 끝일 < 오늘, 완료 아님, 날짜 제한 없음 (R34). 많이 지난 순(끝일 오래된 순).
  - `bringToToday(task, today)`: 진행 중 → 끝일만 오늘. 시작 전 → 길이 그대로 시작일을 오늘로 (R36).
  - `postponeTo(task, day)`: 진행 중 → 끝일을 그날로. 시작 전 → 길이 그대로 그날부터 (R37).
  - `format.ts`의 `formatOverdueDays` → `N일 지남`.
- 팝업 (R35): `OverduePopup` — `Modal` 720px, 머리 "끝내지 못한 태스크" + 빨간 개수.
  - `OverdueRow`: 색 점·제목·`N일 지남`(빨강), 둘째 줄 카테고리·원래 기간·상태. 버튼 `오늘로 가져오기`·`다른 날로`·`완료`.
  - 버튼에 마우스를 올리면 오른쪽에 바뀔 기간 미리보기.
- 처리 (R36–R38): 가져오기·미루기는 `updateTask(id, { start, end })`, 완료는 `updateTask(id, { status: "done" })`(완료한 날은 플랜 reducer).
- 날짜 고르기 (R37): `PostponePicker` — 팝업 위에 뜨는 달력(월요일 시작, `MiniCalendar` 재사용·필요하면 옵션 추가), 오늘까지 흐리게(고를 수 없음), 고른 날부터 기간 길이만큼 칠함 + "이 날로 미루기".
- 목록 갱신 (R39): 처리한 줄은 빠지고 N이 줄어든다. 0이 되면 팝업을 닫고 `WeekProgress`의 버튼이 숨는다.
- `WeekProgress`의 `미완료 N` 버튼에 팝업 열기 연결.

## 확인할 결과
- `npm run build` 성공.
- 끝일이 지난 미완료 태스크를 만들어 두면 `미완료 N` → 팝업에 많이 지난 순으로 나온다.
- 원래 기간 10/28~10/30, 오늘 11/03 기준:

  | 상태 | 오늘로 가져오기 | 11/10으로 미루기 |
  |---|---|---|
  | 진행 중 | 10/28~11/03 | 10/28~11/10 |
  | 시작 전 | 11/03~11/05 | 11/10~11/12 |
- 버튼에 마우스를 올리면 위 기간이 미리 보이고, 처리한 뒤 플랜 달력도 같은 기간이다.
- `다른 날로` 달력에서 오늘까지는 고를 수 없다. 완료 처리하면 칸반·플랜에서 완료.
- 다 처리하면 팝업이 닫히고 버튼이 숨는다.
- Node로 `bringToToday`·`postponeTo` 위 표 네 칸 실행.

## 이 단계에서 만들거나 고칠 파일
- 새 `features/today/overdue.ts`, `format.ts`
- 새 `pages/today/overdue/OverduePopup.tsx`, `OverdueRow.tsx`, `PostponePicker.tsx`, `Overdue.css`
- `pages/today/WeekProgress.tsx`, `TodayPage.tsx`
- (필요하면) `components/common/MiniCalendar.tsx` 옵션 추가
