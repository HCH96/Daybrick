# 투데이 (today) 작업 노트
갱신: 2026-11-03

## 완료
- 1단계: 메뉴·저장소 틀 (자동 진행, 최종 테스트 대기)
- 2단계: 이번 주 진행 바·칸반 보기 (자동 진행, 최종 테스트 대기)
- 3단계: 타이머 동작·카드 글자 (자동 진행, 최종 테스트 대기)
- 4단계: 종료·강제 종료 복구, 태스크 감시 (자동 진행, 최종 테스트 대기)
- 5단계: 달리기 트랙·애니메이션 (자동 진행, 최종 테스트 대기)
- 6단계: 오늘 요약 (자동 진행, 최종 테스트 대기)
- 7단계: 칸반 끌기 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 8단계: 미완료 팝업 (끝일 지난 미완료 태스크 목록, 오늘로 가져오기·미루기)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D12, D13 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 미완료 팝업은 이번 주 진행 바(`pages/today/WeekProgress.tsx`)에서 연다. 태스크 날짜 바꾸기는 플랜 `usePlan()`의 `updateTask(id, patch)`

## 확인할 문서 (경로는 docs/features/today/ 기준, 파일 통째로 읽기)
- ai/plan/step-08.md
- ai/spec/req-overdue.md
- ai/spec/req-page.md (R7만 쓰면 됨)
- ai/logs/L11.md
- human/mockups/part-overdue.html의 overdue-list·overdue-row1·overdue-row2·overdue-picker 구역 (CSS: popup.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 overdue.ts·overdue/ 줄 (새 파일 위치를 정할 때만)
