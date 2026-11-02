# 플랜 AI 테스트 r1

## 테스트 환경
- 날짜: 2026-11-02, Windows 11, Node v24.20.0, Vite 8.3.5, rolldown 1.2.14
- 대상: 커밋 e1e35ea (플랜 1–9단계 구현 완료)

## 방법
- 빌드: apps/desktop `npm run build`, src-tauri `cargo check`
- 순수 함수: 임시 폴더에 TS 테스트 파일을 쓰고 프로젝트의 rolldown으로 묶어 `node`로 실행 (35개 검사, 모두 OK). 임시 파일은 저장소에 넣지 않음
- 화면 동작: 해당 컴포넌트·훅의 코드를 읽어 확인 (앱은 띄우지 않음)

## 결과 한눈에 보기
| ID | 항목 | 판정 | 파일 |
|---|---|---|---|
| A1 | npm run build | 통과 | common.md |
| A2 | cargo check, load_plan/save_plan | 통과 | common.md |
| A3 | startOfWeek·formatWeekPeriod | 통과 | page.md |
| A4 | 색 hex↔hsv, 색 값 칸 | 통과 | category.md |
| A5 | sortGroupTasks | 통과 | task-list.md |
| A6 | layoutWeekBars | 통과 | calendar.md |
| A7 | dragMath | 통과 | calendar.md |
| A8 | 상태 순환·완료일·기본 상태 | 통과 | task-list.md |
| A9 | 카테고리 삭제·미분류 | 통과 | category.md |
| A10 | 기간 보정 | 통과 | task-detail.md |
| A11 | 지원 일정 생성 | 통과 | applications.md |
| A12 | 연결 정리 조건 | 통과 | applications.md |
| A13 | 저장 구조·자동 저장 | 통과 | common.md |
| A14 | 체크리스트 진행도·Enter·삭제 | 통과 | task-detail.md |
| A15 | 카드 고르기 정렬·찾기 | 통과 | applications.md |
| A16 | 메뉴 id·홈 카드·CalendarIcon | 통과 | page.md |
| A17 | 한글 조합 중 Enter | 통과 | task-list.md |
| A18 | 더블클릭 제외 대상 | 통과 | calendar.md |

통과 18 · 실패 0

## 실패 항목
없음

## 참고 사항
- 빌드 경고: JS 묶음이 500kB를 넘는다는 Vite 경고(1,355kB). 오류 아님, 기존부터 있던 경고로 보임.
- A13의 "팝업을 열기만 하면 저장 중 안 뜸", A17·A18 등은 코드 읽기로 판정했다. 실제 화면 동작은 사용자 테스트에서 확인 필요.
