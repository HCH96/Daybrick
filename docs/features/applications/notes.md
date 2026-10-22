# 지원 관리 (applications) 작업 노트
갱신: 2026-10-23

## 완료
- 1단계: 저장 기반 + 페이지 뼈대 (사용자 확인 완료)
- 2단계: 갤러리 (사용자 확인 완료)
- 3단계: 상세 팝업 틀 (사용자 확인 완료)
- 4단계: 속성 (사용자 확인 완료)
- 5단계: 상태 (사용자 확인 완료)
- 6단계: 전형 일정 창 (사용자 확인 완료)
- 7단계: 본문 편집기 (사용자 확인 완료)

## 다음 진행
- 8단계: 달력 (월 이동, `제목 · 일정 종류`, 상태 색, 마감일 점선, 지난 일정 흐리게, +N개 더, 일정 누르면 카드 팝업)
- 관련 결정: D1, D2, D4, D5, D6, D7, D8, D10, D11, D12, D13, D15, D16, D17 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 달력 칸 계산은 step-08에 적힌 `features/applications/calendarGrid.ts`가 아니라 이미 있는 `utils/calendarGrid.ts`를 쓴다 (D7). 달력 화면 전환 버튼(갤러리/달력)은 이미 페이지 머리에 있다.

## 확인할 문서 (경로는 docs/features/applications/ 기준, 파일 통째로 읽기)
- ai/plan/step-08.md
- ai/spec/req-calendar.md
- ai/logs/L13.md
- human/mockups/calendar.html (CSS: calendar.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 `pages/applications/calendar/` 줄 (새 파일 위치를 정할 때만)
