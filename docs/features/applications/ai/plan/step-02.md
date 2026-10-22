# 지원 관리 수정1 2단계: 카드·📅 옆 표시 규칙과 정렬

- 요구사항: R38, R24, R5 (영향: R6)
- 목업: gallery.html (gallery-toolbar, gallery-cards), popup.html (popup-status)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙

## 할 일
- `getNextItem(application, today)`를 상태별 규칙(R38)으로 바꾼다.
  - 지원 준비: 지원 마감과 다음 전형 일정 중 더 가까운 것 (지원 마감은 `deadline` 모양).
  - 지원 완료: 지원 마감은 보지 않는다. 남은 전형 일정, 없으면 `{kind:"applied"}`.
  - 전형 준비·결과 대기: 다음 전형 일정, 없으면 null ("예정된 일정 없음").
  - 종료: 지금처럼 카드에서 "마지막 일정"(`getLastEvent`, 지원 마감 제외).
- `NextEventLabel`: 회색 "D-5 지원 마감", 파랑 "지원 완료".
- `ScheduleButton`: 같은 함수를 쓰고, null·`applied`면 아무것도 보이지 않는다 (R24, D16 대체).
- `sortByDeadline` → `sortByNextDate(applications, today)`: 카드에 보이는 날짜 순, 날짜 없는 카드는 맨 뒤 만든 순 (R5). 탭 줄 글자 "일정 가까운 순".
- `countEventsThisWeek`: 지원 마감은 지원 준비 카드만 센다.

## 확인할 결과
- 지원 준비 카드 A(지원 마감 +5): 회색 "D-5 지원 마감". 코딩테스트 +3을 넣으면 "D-3 코딩테스트".
- A를 지원 완료로 바꾸는 즉시 마감과 상관없이 파랑 "지원 완료". 면접 +7을 넣으면 "D-7 면접" (r1 3·12번).
- 전형 준비 카드에 남은 일정이 없으면 "예정된 일정 없음". 팝업 📅 옆은 카드와 같고, "지원 완료"·"예정된 일정 없음"일 때는 비어 있다.
- 진행 중 탭: 보이는 날짜 가까운 순, 날짜 없는 카드(지원 완료·예정된 일정 없음)는 맨 뒤 만든 순. 탭 줄 오른쪽 "일정 가까운 순" (r1 4번).
- `npm run build` 성공.

## 목업과 다른 점
- gallery.html: 카드의 "D-5 마감" → "D-5 지원 마감", 정렬 글자 "마감일 가까운 순" → "일정 가까운 순", 지원 완료 카드에 파랑 "지원 완료".
- popup.html: 지원 준비 카드면 📅 옆에도 지원 마감이 보인다.

## 이 단계에서 만들거나 고칠 파일
- `features/applications/schedule.ts`
- `pages/applications/gallery/GalleryView.tsx`, `gallery/ApplicationCard.tsx`
- `pages/applications/schedule/NextEventLabel.tsx` (+css), `schedule/ScheduleButton.tsx`
