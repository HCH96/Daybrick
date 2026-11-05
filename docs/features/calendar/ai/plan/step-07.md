# 캘린더 7단계: 회고 패널

- 요구사항: R30, R42–R48
- 목업: `review.html` review-grid·review-panel·review-allday·review-timeline·review-done·review-add, `part-review-states.html` review-empty·review-adding (CSS: review.css 전체, calendar.css에서 고른 칸 클래스 검색)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D5

## 할 일
- `review.ts` (순수 함수):
  - 하루 종일 줄 (R44): 그날을 덮는 시간 없는 개인 일정(기간 포함)·시간 없는 지원 일정.
  - 타임라인 (R44–R45): 투데이 `daySlices(today, day, now)` 구간 + 시각 있는 개인·지원 일정을 시각순으로. 구간은 "09:10–10:40 + 태스크 제목 + 카테고리 색", 원래 시작이 전날이면 "11/2 23:20부터".
  - 완료 태스크 (R46): `completedAt`의 날짜가 그날인 태스크, 완료 시각 순.
- 열기 (R42, D5): 지난 칸 빈 곳을 누르면 `ReviewPanel`(오른쪽 380px). 달력은 좁아지고 고른 칸은 회색 테두리. 다른 지난 칸을 누르면 그 날짜로 바뀐다(R48). 패널이 열린 채 오늘·미래 칸을 누르면 패널은 두고 입력칸.
- 패널 (R43, R47): 머리 "11월 3일 (화)" + ✕ / 하루 종일 / 타임라인(기록 = 색 막대, 길이는 시간과 무관, 일정 = 빈 동그라미 + 칩) / "완료한 태스크" 목록(오른쪽 완료 시각) / [+ 개인 일정 추가]. 가운데만 스크롤. 합계·비율 없음. 기록·일정·완료가 모두 없으면 시계 아이콘 + "이날은 남은 기록이 없어요".
- 추가 (R30, R48): [+ 개인 일정 추가] → 입력 줄(제목, 없음/시각). Enter → 그날 하루짜리 일정.
- 닫기 (R48): ✕, Esc(`useEscapeLayer`, 팝업이 위에 있으면 팝업 먼저).
- 패널 안 칩을 누르면 4단계·5단계와 같은 동작. 패널이 열려 있으면 칩의 면접 외 종류 아이콘을 숨긴다.

## 확인할 결과
- `npm run build` 성공. Node로 `review.ts` 실행: 11/2 23:20–11/3 00:40 기록이 11/3에서 "00:00–00:40, 11/2 23:20부터"로 나오고, 14:00 면접이 09:10 기록과 15:00 기록 사이에 들어간다.
- 11/3 칸 클릭 → 패널이 열리고 달력이 좁아지며 11/3에 회색 테두리.
- 하루 종일 줄에 "예비군", 타임라인에 기록 막대와 일정, 완료한 태스크와 완료 시각. 통계 숫자는 없다.
- 기록이 없는 날은 빈 상태 문구.
- [+ 개인 일정 추가]로 "병원 10:00" 저장 → 타임라인과 달력 칸에 동시에 보인다.
- 11/1을 누르면 패널이 11/1로, ✕·Esc로 닫힌다.

## 이 단계에서 만들거나 고칠 파일
- 새 `features/calendar/review.ts`
- 새 `pages/calendar/review/ReviewPanel.tsx`, `ReviewTimeline.tsx`, `ReviewDoneList.tsx`, `ReviewAddRow.tsx`, `Review.css`
- `pages/calendar/CalendarPage.tsx`·`.css`, `grid/DayCell.tsx`, `chips/AppChip.tsx`
