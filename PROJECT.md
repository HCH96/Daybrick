## Daybrick 소개
개인용 일정·지원·집중 관리 데스크톱 앱.
캘린더 계획, 일정 관리, 취업 지원 관리, 집중 타이머를 한곳에서 관리하고,
안드로이드 폰과 연동한 집중 모드와 공유용 웹페이지를 제공한다.

## 핵심 기능
1. 캘린더 계획: 날짜별로 할 일을 계획한다.
2. 일정 관리: 스케줄을 등록하고 관리한다.
3. 지원 관리: 취업 공고를 정리하고 지원 현황을 관리한다.
4. 집중 타이머: 공부 시작과 종료를 기록하고 집중 시간을 관리한다.

## 확장 기능
- 집중 모드: 타이머가 작동 중일 때 안드로이드 폰에서 유튜브 같은 지정 앱을 차단한다.
- 공유 웹: 면접관용 공개 페이지(공부 통계)와
  친구용 링크 공유 페이지(지원 현황 포함)를 나눠서 제공한다.

## 개발 순서
1. PC 앱 로컬 기능
2. Supabase 연동 (로그인, 데이터 동기화)
3. 공유 웹
4. 안드로이드 보조 앱과 집중 모드

## 기능별 상태
| 기능 | 상태 | 문서 |
|---|---|---|
| 메인 페이지 | 사용자 테스트 대기: 홈 다듬기 수정2 r2 AI 테스트 20개 통과 (L56), 체크리스트 28개 (r1 22개 다시 포함). 앱 틀·사이드바는 완료 (사이드바 메뉴 순서 변경 L46) | docs/features/main-page/index.md |
| 캘린더 계획 (플랜) | 수정 구현 완료 (테스트 대기) | docs/features/plan/index.md |
| 캘린더 (일정 관리, 스케줄러 대체) | 테스트 r1: AI 실패 1(A14 수정함), 사용자 테스트 대기 | docs/features/calendar/index.md |
| 지원 관리 | 수정1 완료 (테스트 r2 통과) | docs/features/applications/index.md |
| 서버 연결 | 완료 (AI·사용자 테스트 r1 통과, 일시정지 재개 U31만 미확인) (notifications·job-search의 선행) | docs/features/server-setup/index.md |
| 알림 | 완료 (r1 사용자 테스트 통과, 수정1은 AI 테스트 r2 통과·사용자 테스트 보류) (선행: server-setup, job-search의 선행) | docs/features/notifications/index.md |
| 구직 관리 | 수정 구현 완료 (테스트 대기) (수정2, 수정1 사용자 테스트 r2는 수정2 뒤 함께) (Gmail 상태 보기 보안 수정 L63, 서버 업데이트 필요) (선행: server-setup, notifications) | docs/features/job-search/index.md |
| 투데이 (집중 타이머 합침) | AI 테스트 통과, 사용자 테스트 대기 (r1) | docs/features/today/index.md |
| 프로젝트 | AI 테스트 통과 (A11 수정), 사용자 테스트 대기 (r1) | docs/features/projects/index.md |
| 데이터 동기화 | 테스트 중 (AI r1 통과, 사용자 테스트 대기) (선행: server-setup) | docs/features/data-sync/index.md |
| 백그라운드 실행 | AI 테스트 통과, 사용자 테스트 대기 (r1) | docs/features/background/index.md |
| 자동 업데이트 | 구현 중 (6/6단계 완료) (선행: notifications, background) | docs/features/auto-update/index.md |
| 집중 모드 | 시작 전 | - |
| 공유 웹 | 시작 전 | - |