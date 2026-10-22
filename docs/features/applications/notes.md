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
- 8단계: 달력 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 9단계: 홈 연동 (홈 지원 현황 카드에 상태·세부 단계별 개수, 요약 줄에 "진행 중 N곳")
- 관련 결정: D2, D4, D5, D6, D8, D10, D11, D12, D13, D15, D16, D17, D18 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 진행 중 판정은 `features/applications/schedule.ts`의 `isActive`(종료 아님)를 그대로 쓴다. 지원 데이터는 `features/applications/store.tsx`의 `useApplications()`로 읽는다 (홈이 그 Provider 안에 있는지 먼저 grep으로 확인).

## 확인할 문서 (경로는 docs/features/applications/ 기준, 파일 통째로 읽기)
- ai/plan/step-09.md
- ai/spec/req-home.md
- ai/logs/L14.md
- ../main-page/human/mockups/home.html의 home-apps 구역 (CSS: 같은 폴더 home.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 `pages/home/` 줄 (새 파일 위치를 정할 때만)
