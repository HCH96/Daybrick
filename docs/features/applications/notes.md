# 지원 관리 (applications) 작업 노트
갱신: 2026-10-22

## 완료
- 1단계: 저장 기반 + 페이지 뼈대 (사용자 확인 완료)
- 2단계: 갤러리 (사용자 확인 완료)
- 3단계: 상세 팝업 틀 (사용자 확인 완료)
- 4단계: 속성 (사용자 확인 완료)
- 5단계: 상태 (사용자 확인 완료)

## 다음 진행
- 6단계: 전형 일정 창 (📅 버튼 + 다음 일정 표시, 종류 버튼 + 작은 달력으로 일정 추가, 저장된 일정 고치기·지우기)
- 관련 결정: D1, D2, D4, D5, D6, D8, D10, D11, D12, D13, D14 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 📅 버튼은 `detail/StatusRow`의 상태 배지 옆에 붙인다. 다음 일정 글자는 `getNextItem`(schedule.ts)과 `NextEventLabel`을 그대로 쓴다.

## 확인할 문서 (경로는 docs/features/applications/ 기준, 파일 통째로 읽기)
- ai/plan/step-06.md
- ai/spec/req-schedule.md
- ai/logs/L11.md
- human/mockups/part-schedule.html, popup.html의 popup-status 구역 (CSS는 popup.css·parts.css·common.css에서 쓰는 클래스만 검색)
