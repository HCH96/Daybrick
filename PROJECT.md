## Daybrick 소개
개인용 일정·지원·집중 관리 프로젝트. 세 앱으로 이뤄진다.
- **PC 앱**(중심): 플랜·캘린더·투데이(집중 타이머)·프로젝트로 할 일과 시간을 관리하고, 지원 관리·구직 관리로 취업 준비를 한곳에서 본다.
- **안드로이드 보조 앱**: PC에서 타이머가 도는 동안 폰의 지정 앱(유튜브 등)을 막는 집중 모드.
- **공유 웹**(읽기 전용): 면접관용 공개 페이지(공부 통계)와 친구용 링크 공유 페이지(지원 현황 포함).
서버는 사용자마다 자기 Supabase를 연결해 쓴다 (선택, 규칙은 supabase/CLAUDE.md).

## 개발 순서
1. PC 앱 로컬 기능 (완료)
2. 서버(Supabase) 연동: 로그인·알림·구직 관리·데이터 동기화 (완료)
3. 안드로이드 보조 앱과 집중 모드 (다음)
4. 공유 웹

## 기능별 상태
상태 값: 시작 전 · 명세 · 계획 · 구현 중 · 테스트 대기 · 완료 · 수정 중.
- 완료 = AI 테스트(코드·화면) 통과. 덧붙임은 "(출시 확인 N개)"와, 끝나지 않은 기능의 "(선행: 기능명)"만 쓴다.
- 회차·기록 번호·테스트 개수 같은 자세한 상태는 기능 허브(index.md)의 상태 줄에 둔다.

| 플랫폼 | 기능 | 상태 | 문서 |
|---|---|---|---|
| PC | 메인 페이지 (홈·사이드바) | 완료 | docs/desktop/features/main-page/index.md |
| PC | 플랜 (캘린더 계획) | 완료 | docs/desktop/features/plan/index.md |
| PC | 캘린더 (일정 관리) | 완료 | docs/desktop/features/calendar/index.md |
| PC | 투데이 (집중 타이머) | 완료 | docs/desktop/features/today/index.md |
| PC | 프로젝트 | 완료 | docs/desktop/features/projects/index.md |
| PC | 지원 관리 | 완료 | docs/desktop/features/applications/index.md |
| PC | 서버 연결 | 완료 | docs/desktop/features/server-setup/index.md |
| PC | 알림 | 완료 | docs/desktop/features/notifications/index.md |
| PC | 구직 관리 (공고 추천·Gmail) | 완료 | docs/desktop/features/job-search/index.md |
| PC | 데이터 동기화 | 완료 | docs/desktop/features/data-sync/index.md |
| PC | 백그라운드 실행 | 완료 | docs/desktop/features/background/index.md |
| PC | 자동 업데이트 | 완료 | docs/desktop/features/auto-update/index.md |
| 안드로이드·PC | 집중 모드 | 시작 전 | - |
| 웹 | 공유 웹 | 시작 전 | - |
