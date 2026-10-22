# 문서 목록
전체 색인. 기능 문서는 각 기능 허브(index.md)가 관리하므로 여기에는 허브와 공용 문서만 둔다.
읽는 순서: 이 목록 → 기능 허브 → 하위 색인(spec·plan·logs·mockups) → 필요한 파일. 이어서 작업할 때는 기능의 notes.md부터.
기능 허브나 공용 문서를 새로 만들거나 없앨 때만 이 목록을 고친다.

## 최상위
- [CLAUDE.md](CLAUDE.md): AI 작업 규칙, 문서 구조, 기술 스택, 명령어
- [PROJECT.md](PROJECT.md): 프로젝트 개요, 기능 목록, 개발 순서, 기능별 상태

## 기능 허브 (docs/features/<기능명>/index.md)
- [메인 페이지](docs/features/main-page/index.md): 사이드바 레이아웃 + 홈 대시보드, 제목 표시줄·사이드바 접기·뒤로/앞으로 (완료)
- [지원 관리](docs/features/applications/index.md): 갤러리·달력, 상태 5단계와 세부 단계, 전형 일정, 속성, 마크다운 상세 팝업 (구현 중)

## 공용 문서 (docs/common)
- [docs/common/ai/setup/desktop-setup.md](docs/common/ai/setup/desktop-setup.md): PC 앱(Tauri 2 + React + TS) 개발 환경 설치와 프로젝트 생성 기록
- [docs/common/ai/token-reports/index.md](docs/common/ai/token-reports/index.md): `/implement` 실행별 토큰 사용량·컨텍스트 증가 원인 보고서 목차
