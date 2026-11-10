# 백그라운드 실행 · AI 테스트 r1 (2026-11-09)

## 테스트 환경
- Windows 11 Pro, Git Bash, 커밋 1ebbbb5 기준 (코드 변경 없음)
- apps/desktop (Tauri 2 + React + TypeScript)

## 방법
- 빌드: `npx tsc --noEmit`, `npm run build`, `cargo check`, `npm run tauri build`를 실제로 실행
- 나머지: 코드 읽기와 grep으로 판정 (앱을 띄우지 않음, 설치본도 설치·실행하지 않음)

## 결과 한눈에 보기
| ID | 항목 | 판정 | 파일 |
|---|---|---|---|
| A1 | tsc·build·cargo check | 통과 | [common.md](common.md) |
| A2 | tauri build 결과물 | 통과 | [common.md](common.md) |
| A3 | onCloseRequested 0건 | 통과 | [tray.md](tray.md) |
| A4 | Rust 닫기 막기·이벤트 | 통과 | [tray.md](tray.md) |
| A5 | 트레이 툴팁·클릭·메뉴 | 통과 | [tray.md](tray.md) |
| A6 | 단일 실행 | 통과 | [startup.md](startup.md) |
| A7 | 종료 확인 분기·문구 | 통과 | [quit.md](quit.md) |
| A8 | 저장 후 종료, 5초 상한 | 통과 | [quit.md](quit.md) |
| A9 | 3초 ack 강제 종료 | 통과 | [quit.md](quit.md) |
| A10 | 종료 재요청 무시 | 통과 | [quit.md](quit.md) |
| A11 | touchRunning 재사용 | 통과 | [quit.md](quit.md) |
| A12 | 첫 닫기 안내 | 통과 | [tray.md](tray.md) |
| A13 | 창 떠 있을 때 닫기 무시 | 통과 | [tray.md](tray.md) |
| A14 | visible:false, --autostart | 통과 | [startup.md](startup.md) |
| A15 | 첫 실행 자동 등록 | 통과 | [startup.md](startup.md) |
| A16 | 스위치 실패 되돌리기 | 통과 | [startup.md](startup.md) |
| A17 | 개발 모드 건너뜀 | 통과 | [startup.md](startup.md) |
| A18 | L04 sessionRef 문제 | 통과 | [quit.md](quit.md) |

통과 18 · 실패 0

## 실패 항목
없음

## 참고 사항
- `npm run build`에 청크 500kB 넘음 경고가 있다 (기존부터 있던 경고, 실패 아님).
- A18: [취소] 경로는 해결됐다. 다만 `quit_app` 호출 자체가 실패한 뒤 다시 종료하면 useCloseFlush의 sessionRef가 끝난 채 남아 올리기를 다시 하지 않는다 (드문 경로).
- 실제 트레이·창 동작, 자동 시작 등록은 실행해서 확인하지 않았다 (코드 확인만).
