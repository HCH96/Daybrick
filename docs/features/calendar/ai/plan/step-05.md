# 캘린더 5단계: 개인 일정 입력·편집

- 요구사항: R23–R29
- 목업: `part-personal.html` personal-quick·personal-range·personal-edit·personal-delete (CSS: parts.css에서 입력칸·범위·팝오버·확인 줄 클래스 검색)
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D5, D9, D10

## 할 일
- 빠른 입력 (R23, D5): 오늘·미래 칸의 빈 곳(칩이 아닌 곳)을 누르면 그 칸 다음 빈 줄에 칩 모양 `QuickInput`. Enter → `addEvent(제목, 날짜, 날짜)`, Esc·빈 제목·바깥 누르기 → 취소. 지난 칸 누르기는 7단계(회고)에서 연결.
- 기간 입력 (R24, D10): `useRangeSelect` — 빈 곳에서 누른 채 다른 칸으로 4px 넘게 움직이면 범위 모드. 지나간 칸들을 보라 테두리로 묶고, 놓으면 범위 첫 주 줄에 범위 너비 `RangeInput`. Enter → 기간 일정. 지난 날짜가 들어가도 된다. 한 칸 안에서만 움직였으면 누르기로 친다.
- 편집 (R28): 개인 칩을 누르면 `PersonalEditPopover`(공용 `Popover`) — 제목, 시작일·끝일(공용 `MiniCalendar` 팝업), 시간(없음/시각 + `input type="time"`), [삭제]·[취소]·[저장]. [저장]을 눌러야 반영. 기간 일정이면 시간이 "없음"으로 고정(R26).
- 입력 검사 (D9): `personalForm.ts` — 시작일을 끝일 뒤로 바꾸면 끝일 = 시작일, 끝일을 시작일 앞으로 고르면 오류 문구 "끝일이 시작일보다 빨라요"와 [저장] 막음. 제목이 비어도 [저장] 막음. 기간으로 바뀌면 time = null.
- 삭제 (R29): [삭제] → 팝오버 아래 빨간 확인 줄 "이 일정을 지울까요? [지우기]" → `deleteEvent`.
- 팝오버는 7단계 회고 패널·8단계 플랜에서도 쓰므로 저장소만 보고 동작하게 만든다(props: eventId, anchor, onClose).

## 확인할 결과
- `npm run build` 성공. Node로 `personalForm` 실행: 시작 11/10·끝 11/8 입력 → 끝 11/10, 끝을 11/9로 → 오류.
- 11/6 빈 곳 클릭 → 입력칸, "치과" Enter → 점선 칩. Esc나 빈 제목은 아무것도 남기지 않는다.
- 11/10→11/12 드래그 → 세 칸이 보라로 묶이고 너비 입력 막대, "예비군" → 기간 막대. 11/3→11/6처럼 지난 날이 들어간 범위도 저장된다.
- "치과" 편집에서 시각 14:00 저장 → 칩 "14:00 치과", 그날 시간 있는 칩 중 시간순 자리로 옮겨진다. 끝일을 11/7로 바꾸면 시간이 "없음"으로 고정.
- [취소]를 누르면 고친 내용이 반영되지 않는다. 삭제는 확인 줄에서 한 번 더 눌러야 지워지고, 다시 켜도 지운 일정이 없다.
- 오늘 칸은 입력, 지난 칸은 (이 단계에서는) 아무 일도 일어나지 않는다.

## 이 단계에서 만들거나 고칠 파일
- 새 `features/calendar/personalForm.ts`
- 새 `pages/calendar/personal/QuickInput.tsx`, `RangeInput.tsx`, `PersonalEditPopover.tsx`, `DeleteConfirmRow.tsx`, `Personal.css`
- 새 `pages/calendar/grid/useRangeSelect.ts`
- `pages/calendar/CalendarPage.tsx`, `grid/WeekRow.tsx`, `grid/DayCell.tsx`, `chips/PersonalChip.tsx`
