# PC 앱 문서 목록
PC 앱(Tauri 2 + React + TS, apps/desktop)의 색인. 기능 문서는 각 기능 허브(index.md)가 관리하므로 여기에는 허브와 PC 앱 공용 문서만 둔다.
읽는 순서: 이 목록 → 기능 허브 → 하위 색인(spec·plan·logs·mockups) → 필요한 파일. 이어서 작업할 때는 기능의 notes.md부터.
기능 허브나 PC 앱 공용 문서를 새로 만들거나 없앨 때만 이 목록을 고친다.

## 기능 허브 (docs/desktop/features/<기능명>/index.md)
- [메인 페이지](features/main-page/index.md): 사이드바 레이아웃 + 홈 대시보드(앞으로 일주일·앱 전체 요약), 제목 표시줄·사이드바 접기·뒤로/앞으로 (홈 개편 명세 완료)
- [지원 관리](features/applications/index.md): 갤러리·달력, 상태 5단계와 세부 단계, 전형 일정, 속성, 마크다운 상세 팝업 (구현 중)
- [서버 연결](features/server-setup/index.md): 자기 Supabase·Anthropic 키 연결, 첫 실행 가이드, 자동 세팅·서버 구조 갱신, 로그인, 일시정지 안내, Settings 화면 (완료)
- [알림](features/notifications/index.md): 앱 공용 알림 센터, 제목 표시줄 종 아이콘·빨간 숫자 배지, 펼침 목록·체크 확인, 서버 알림 받기 (목업 승인)
- [구직 관리](features/job-search/index.md): 공고 자동 수집·AI 채점 추천, 지원 관리 연결, Gmail 상태 제안, AI 사용액·한도 (계획 승인)
- [플랜](features/plan/index.md): 카테고리별 태스크, 주간 달력에 끌어 놓아 배치·여러 날 막대, 지원 일정 표시, 메모·체크리스트·지원 카드 연결 (계획 승인)
- [투데이](features/today/index.md): 오늘 태스크 칸반, 태스크 타이머(집중 타이머 합침)·시간 기록, 오늘 요약, 미완료 태스크 처리 (계획 승인)
- [프로젝트](features/projects/index.md): 주차형·단계형 프로젝트, 깃발 트랙·모닥불·누적 시간, 주간 투입 버블 그래프, 플랜 트리·투데이 연동 (계획 승인)
- [캘린더](features/calendar/index.md): 스케줄러 대체, 태스크·지원 일정·주차 깃발·개인 일정을 모아 보는 월 달력, 칩 드래그, 지난 날 회고 패널 (계획 승인)
- [데이터 동기화](features/data-sync/index.md): 플랜·캘린더·지원 관리·투데이 로컬 JSON을 본인 Supabase에 기능별 한 행으로 올리기, 첫 연결·재설치 복구, 로그인 풀림 안전 규칙 (계획 승인)
- [백그라운드 실행](features/background/index.md): 닫기 시 트레이로 숨기기·트레이 메뉴(열기/종료), 윈도우 로그인 자동 시작, 중복 실행 방지 (AI 테스트 통과, 사용자 테스트 대기)
- [자동 업데이트](features/auto-update/index.md): GitHub Releases로 새 버전 확인·알림, 설정에서 설치·재시작, 서명 키·버전·데이터 호환 규칙 (명세 완료)

## PC 앱 공용 문서 (docs/desktop/common)
- [common/ai/setup/desktop-setup.md](common/ai/setup/desktop-setup.md): PC 앱(Tauri 2 + React + TS) 개발 환경 설치와 프로젝트 생성 기록
- [common/ai/setup/desktop-release.md](common/ai/setup/desktop-release.md): PC 앱 설치파일 빌드·설치·버전 올려 업데이트하는 절차, 설치·데이터 위치, 주의점
- [common/ai/design/design-direction.md](common/ai/design/design-direction.md): PC 앱 모든 페이지 디자인 기준 (공통 규칙 + 페이지 유형별 표현). 폴리싱 전에 읽고, 정해지지 않은 건 사용자에게 물은 뒤 이 문서에 먼저 적는다
- [common/ai/design/polish-targets.md](common/ai/design/polish-targets.md): `/polish` 대상 페이지 목록, 페이지별 코드 범위·기록 위치·진행 상태
- [common/ai/design/logs/index.md](common/ai/design/logs/index.md): 공통 기반(common) 폴리싱 진행 기록 목차
