# 문서 목록
전체 색인. 문서는 플랫폼(앱)별로 나뉘고, 각 플랫폼 색인이 그 앱의 기능 허브와 공용 문서를 관리한다. 여기에는 플랫폼 색인과 모든 앱이 같이 쓰는 문서만 둔다.
읽는 순서: 이 목록 → 플랫폼 색인 → 기능 허브 → 하위 색인(spec·plan·logs·mockups) → 필요한 파일. 이어서 작업할 때는 기능의 notes.md부터.
플랫폼 색인이나 공용 문서를 새로 만들거나 없앨 때만 이 목록을 고친다.

## 최상위
- [CLAUDE.md](CLAUDE.md): AI 작업 규칙, 문서 구조, 기술 스택, 명령어
- [PROJECT.md](PROJECT.md): 프로젝트 개요, 기능 목록, 개발 순서, 기능별 상태

## 플랫폼 색인 (docs/<플랫폼>/index.md)
- [PC 앱](docs/desktop/index.md): Tauri 2 + React + TS. 기능 허브 12개, 개발 환경·릴리즈·디자인 기준
- [안드로이드 앱](docs/android/index.md): Kotlin 보조 앱, 집중 모드 앱 차단 (시작 전)
- 공유 웹: 시작할 때 docs/web/index.md를 같은 모양으로 만든다

## 모든 앱 공용 문서 (docs/common)
- [docs/common/ai/formats/record-format.md](docs/common/ai/formats/record-format.md): 진행 기록(logs)·결정(decisions.md) 양식, 모든 명령이 공용
- [docs/common/ai/logs/index.md](docs/common/ai/logs/index.md): 특정 기능에 속하지 않는 공용 작업(문서 구조 정리 등) 진행 기록 목차
- [docs/common/ai/token-reports/index.md](docs/common/ai/token-reports/index.md): 요청할 때 만드는 세션별 토큰 사용량·컨텍스트 증가 원인 보고서 목차 (지난 보고서 안의 경로는 당시 기준)
- 앱 사이 약속(docs/common/ai/contracts/): 여러 앱이 주고받는 Supabase 테이블·실시간 메시지·상태 값. 집중 모드 명세를 쓸 때 만든다
