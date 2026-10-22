# 지원 관리 (applications) AI 테스트 보고서 r1

- 날짜: 2026-10-23
- 환경: Windows 11 Pro, Node v24.20.0, Vite 8.3.5, Tauri 2 (`apps/desktop`)
- 방법: 빌드·`cargo check` 실행, 코드 읽기, 순수 함수 직접 실행(임시 스크립트 60개 검사, 저장소에는 넣지 않음). 앱·미리보기는 띄우지 않음
- 순수 함수 실행: Node의 타입 제거 실행 + 확장자 없는 import를 풀어 주는 임시 로더. 기준 날짜는 2026-10-23(금)으로 고정

## 결과 한눈에 보기
| ID | 항목 | 판정 | 파일 |
|---|---|---|---|
| A1 | `npm run build` (타입 검사 포함) | 통과 | [common.md](common.md) |
| A2 | `cargo check` | 통과 | [common.md](common.md) |
| A3 | 코드 규칙 (any·비밀값·위치·strict) | 통과 | [common.md](common.md) |
| A4 | 새 카드 기본값 | 통과 | [page-gallery.md](page-gallery.md) |
| A5 | 탭 필터·기본 탭·기본 보기 | 통과 | [page-gallery.md](page-gallery.md) |
| A6 | 마감일 순 정렬 | 통과 | [page-gallery.md](page-gallery.md) |
| A7 | 다음 일정 계산 (D12·D16, D-1 빨강 조건) | 통과 | [schedule.md](schedule.md) |
| A8 | 상태 전환 규칙 (R20–R22, D13) | 통과 | [status.md](status.md) |
| A9 | 고정 상태 목록·색 | 통과 | [status.md](status.md) |
| A10 | 역할 속성 삭제 시 자동 기능 건너뜀 | 통과 | [status.md](status.md) |
| A11 | 속성 종류·기본 속성·종류 변경 막기 | 통과 | [properties.md](properties.md) |
| A12 | 일정 저장 구조 (여러 개·고치기·지우기) | 통과 | [schedule.md](schedule.md) |
| A13 | 달력 일정 모으기 | 통과 | [calendar.md](calendar.md) |
| A14 | 홈 집계 | 통과 | [home.md](home.md) |
| A15 | 자동 저장·닫을 때 저장·깨진 파일 보호 | 통과 | [popup.md](popup.md) |
| A16 | 본문 이미지 저장 경로 | 통과 | [body.md](body.md) |

## 실패 항목
없음.

## 참고 사항
- 빌드 경고: JS 묶음 781kB로 500kB 경고가 있음 (L13 남은 문제와 같음, 동작에는 영향 없음).
- 이미지 저장 실패 시 화면 안내 없이 콘솔에만 오류가 남음 (L13 남은 문제, 요구사항 위반은 아님).
- 화면 표시·클릭 동작·창 크기·실제 파일 생성은 확인하지 않았음 → 사용자 테스트 [../../../human/tests/r1-user-test.md](../../../human/tests/r1-user-test.md)
