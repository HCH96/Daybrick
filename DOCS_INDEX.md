# 문서 목록

문서를 새로 만들거나 수정하면 이 목록에 경로와 한 줄 설명을 갱신한다.

## 최상위
- [CLAUDE.md](CLAUDE.md): AI 작업 규칙, 기술 스택, 명령어
- [PROJECT.md](PROJECT.md): 프로젝트 개요, 기능 목록, 개발 순서, 기능별 상태

## docs/human (사용자가 읽을 문서)
- [docs/human/mockups/main-page.html](docs/human/mockups/main-page.html): 메인 페이지 정적 목업 3화면(앱 틀, 기능 연결 후 홈, 지금의 빈 상태 홈). 승인된 최종 디자인(B안·그라파이트 바이올렛·제목 표시줄) 기준, 구역은 파일 맨 앞 목차 참고
- [docs/human/mockups/main-page-palettes.html](docs/human/mockups/main-page-palettes.html): 메인 페이지 어두운 색 조합 후보 5개 비교, 보관용 (후보 1 차콜 브릭 → 2026-10-22 후보 4 그라파이트 바이올렛으로 변경)
- [docs/human/mockups/main-page-layouts.html](docs/human/mockups/main-page-layouts.html): 홈 배치 대안 A·B·C 비교 목업, 보관용, 최대화 1920x1080 기준 (B안 승인: 최대 너비 1280px + 요약 줄 + 벤토 그리드)
- [docs/human/mockups/applications.html](docs/human/mockups/applications.html): 지원 관리 정적 목업 5화면(갤러리, 달력, 상세 팝업, 팝업 최대화, 작은 창 모음) (승인됨. 상태 색·팝업 버튼 위치 결정 포함, 구역은 파일 맨 앞 목차 참고)
- [docs/human/tests/main-page-user-test.md](docs/human/tests/main-page-user-test.md): 메인 페이지 사용자 테스트 체크리스트 2차 12개 (B안·제목 표시줄 기준, 11 통과·1 해당 없음)
- [docs/human/tests/main-page-user-test-v1.md](docs/human/tests/main-page-user-test-v1.md): 메인 페이지 사용자 테스트 1차 (B안 이전 기준, 9 통과·1 해당 없음, 보관용)

## docs/ai (AI 작업 기록, 계획, 메모)
- [docs/ai/setup/desktop-setup.md](docs/ai/setup/desktop-setup.md): PC 앱(Tauri 2 + React + TS) 개발 환경 설치와 프로젝트 생성 기록

## docs/ai/features (기능별 명세와 결정 사항)
- [docs/ai/features/main-page.md](docs/ai/features/main-page.md): 메인 페이지(사이드바 레이아웃 + 홈 대시보드) 명세 (B안 배치·제목 표시줄·사이드바 접기·뒤로/앞으로 반영, 2차 AI·사용자 테스트 통과, 완료)
- [docs/ai/features/applications.md](docs/ai/features/applications.md): 지원 관리(갤러리·달력, 상태 5단계와 세부 단계, 전형 일정, 속성 편집, 마크다운 상세 팝업) 명세 (구현 중, 4단계 완료)

## docs/ai/logs (기능별 진행 기록, 맨 앞 기록 목차부터 읽기)
- [docs/ai/logs/applications-log.md](docs/ai/logs/applications-log.md): 지원 관리 진행 기록 L01~L09 (명세 ~ 4단계, 기록 분리, 명세서 양식 정리)
- [docs/ai/logs/main-page-log-2.md](docs/ai/logs/main-page-log-2.md): 메인 페이지 진행 기록 L14~L32, 최신 (B안·제목 표시줄 ~ 2차 테스트, 목업 정리)
- [docs/ai/logs/main-page-log.md](docs/ai/logs/main-page-log.md): 메인 페이지 진행 기록 L01~L13 (처음 구현 ~ 1차 테스트, 사용자 요청 수정)

## docs/ai/notes (기능별 작업 노트, 세션 이어받기용)
- [docs/ai/notes/applications-notes.md](docs/ai/notes/applications-notes.md): 지원 관리 작업 노트 (완료·다음 진행·확인할 문서)

## docs/ai/plans (기능별 구현 계획)
- [docs/ai/plans/main-page-plan.md](docs/ai/plans/main-page-plan.md): 메인 페이지 첫 구현 계획 (6단계, 구현 완료. 이후 변경 사항 안내 포함)
- [docs/ai/plans/main-page-layout-b-plan.md](docs/ai/plans/main-page-layout-b-plan.md): 메인 페이지 홈 B안 배치(최대 너비 + 요약 줄 + 벤토 그리드) 구현 계획과 빈 상태 결정 (구현 완료)
- [docs/ai/plans/main-page-titlebar-plan.md](docs/ai/plans/main-page-titlebar-plan.md): 메인 페이지 직접 그린 제목 표시줄, 사이드바 접기, 뒤로/앞으로·단축키 구현 계획 (구현 완료)
- [docs/ai/plans/applications-plan.md](docs/ai/plans/applications-plan.md): 지원 관리 구현 계획 (10단계, JSON 저장·Tiptap 편집기 결정 포함, 승인됨·구현 중)

## docs/ai/tests (AI 테스트 보고서)
- [docs/ai/tests/main-page-ai-test.md](docs/ai/tests/main-page-ai-test.md): 메인 페이지 AI 테스트 보고서 2차 (25개 항목 모두 통과, 참고 3건)
- [docs/ai/tests/main-page-ai-test-v1.md](docs/ai/tests/main-page-ai-test-v1.md): 메인 페이지 AI 테스트 보고서 1차 (B안 이전 기준, 23개 통과, 보관용)
