# 투데이 AI 테스트 r1

## 테스트 환경
- 날짜: 2026-11-03, Windows 11, Node v24.20.0, rolldown 1.2.14 (apps/desktop node_modules)
- 커밋: 3bd4728 (투데이: 구현 완료)
- 순수 함수 실행 시 `TZ=Asia/Seoul`

## 방법
- 빌드·타입 검사·cargo check 실행 (A1)
- 순수 함수: 임시 폴더에 TS 스크립트를 쓰고 rolldown으로 묶어 node로 실행 (43개 확인, 모두 통과). 스크립트는 저장소에 넣지 않음
- 화면 동작(끌기·감시·복구 흐름·CSS)은 코드 읽기로 판정. 앱·미리보기는 띄우지 않음

## 결과 한눈에 보기
| ID | 판정 | 파일 |
|---|---|---|
| A1 | 통과 | common.md |
| A2 | 통과 | page.md |
| A3 | 통과 | page.md |
| A4 | 통과 | page.md |
| A5 | 통과 | page.md |
| A6 | 통과 | kanban.md |
| A7 | 통과 | kanban.md |
| A8 | 통과 | kanban.md |
| A9 | 통과 | kanban.md |
| A10 | 통과 | timer.md |
| A11 | 통과 | timer.md |
| A12 | 통과 | timer.md |
| A13 | 통과 | timer.md |
| A14 | 통과 | timer.md |
| A15 | 통과 | timer.md |
| A16 | 통과 | timer.md |
| A17 | 통과 | timer.md |
| A18 | 통과 | [summary.md](summary.md) |
| A19 | 통과 | [summary.md](summary.md) |
| A20 | 통과 | [summary.md](summary.md) |
| A21 | 통과 | overdue.md |
| A22 | 통과 | common.md |

## 실패 항목
없음

## 참고 사항
- `npm run build`에 청크 크기(500kB 초과) 경고가 있음. 빌드는 성공 (이번 기능과 무관한 기존 경고).
- A9·A14의 훅(useTimerGuard·useAutoSave·useHeartbeat) 흐름과 A16 화면 위치, A17 CSS는 실행하지 않고 코드로만 확인했다. 실제 화면 확인은 사용자 테스트 몫.
- 오늘 요약 묶음(A18–A20) 보고서 summary.md는 하위 에이전트의 쓰기가 막혀, 메인 세션이 에이전트의 초안을 내용 그대로 옮겼다 (사용자 요청, 2026-11-03).
