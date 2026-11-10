# 자동 업데이트 AI 테스트 r1

## 테스트 환경
- 날짜: 2026-11-10, Windows 11 Pro, Node v24.20.0, 커밋 917fed4 (작업 트리 깨끗함)
- 앱·미리보기는 띄우지 않음. 목업은 보지 않음

## 방법
- 빌드·타입 검사·`cargo check` 실행 (A1)
- 설정 파일·버전은 node로 JSON을 읽어 비교 (A2, A3), git·gh 명령으로 저장소·릴리즈 확인 (A4, A16)
- 순수 함수는 `node --experimental-strip-types`로 logic.ts를 직접 불러 실행 (A6, 스크립트는 임시 폴더)
- 나머지는 코드 읽기로 판정 (A5, A7–A15)

## 결과 한눈에 보기
| ID | 항목 | 판정 | 파일 |
|---|---|---|---|
| A1 | 빌드·타입 검사·cargo check | 통과 | common.md |
| A2 | tauri.conf 업데이트 설정 | 통과 | release.md |
| A3 | 버전 다섯 곳 0.2.1 | 통과 | release.md |
| A4 | 키 파일 미추적·.gitignore | 통과 | release.md |
| A16 | v0.2.1 릴리즈·latest.json | 통과 | release.md |
| A5 | 개발 모드 막기 | 통과 | check.md |
| A6 | 순수 함수 실행 | 통과 | check.md |
| A7 | 자동 확인 타이밍·실패 처리 | 통과 | check.md |
| A8 | 알림 모양 | 통과 | check.md |
| A9 | 수동·자동 확인의 알림 차이 | 통과 | check.md |
| A10 | mark_update_notified 안전 쓰기 | 통과 | check.md |
| A11 | Rust 오류 종류·바이트 버리기 | 통과 | install.md |
| A12 | 설치 순서·[나중에 설치] | 통과 | install.md |
| A15 | daybrickUpdater 개발 모드 한정 | 통과 | install.md |
| A13 | 화면 문구 | 통과 | settings.md |
| A14 | 설정 칸 스크롤 | 통과 | settings.md |

통과 16 · 실패 0

## 실패 항목
없음

## 참고 사항
- `npm run build`에 청크 500 kB 초과 경고가 나옴 (기존 경고, 빌드는 성공)
- 실패 알림 내용은 "설정에서 다시 설치할 수 있어요"로, A8 표의 내용 문구("설정에서 설치할 수 있어요")는 새 버전 알림에만 해당해서 그것으로 판정함
- `gh release view`에는 isLatest 칸이 없어 `gh api .../releases/latest`의 태그로 Latest 여부를 확인함
- A10의 파일이 깨졌을 때 동작은 코드만 읽고 판정함 (실제로 깨진 파일로 실행하지는 않음)
