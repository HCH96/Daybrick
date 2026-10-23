# 지원 관리 AI 테스트 r2 (수정1)

- 날짜: 2026-10-23 · 대상: 계획 "지원 관리 수정1" (커밋 d751cdd 기준)
- 환경: Windows 11, Node v24.20.0, rolldown 1.2.14(apps/desktop 의존성), cargo
- 방법: 빌드 실행, 순수 함수(migrate·schedule·calendarEntries·reducer·defaultProperties)를 임시 폴더의 시험 파일로 묶어 `node`로 실행(오늘 = 2026-10-23 고정), 화면 코드는 읽기만 함. 앱·미리보기는 띄우지 않음.

## 결과 한눈에 보기
| ID | 항목 | 판정 | 파일 |
|---|---|---|---|
| A1 | `npm run build` | 통과 | common.md |
| A2 | `cargo check` | 통과 | common.md |
| A3 | 옮기기 — step-01 예시 | 통과 | properties.md |
| A4 | 옮기기 경계 | 통과 | properties.md |
| A5 | 기본 속성·삭제 가능 여부 | 통과 | properties.md |
| A6 | 지원 완료로 바꾸기 | 통과 | schedule.md |
| A7 | 카드 아래쪽 줄 (상태별) | 통과 | page-gallery.md |
| A8 | 📅 옆 표시 | 통과 | schedule.md |
| A9 | 정렬 계산 | 통과 | page-gallery.md |
| A10 | 달력 일정 목록 | 통과 | calendar.md |
| A11 | 이번 주 일정 수 | 통과 | calendar.md |
| A12 | 📅 버튼 순서·지원 마감 두 번 | 통과 | schedule.md |
| A13 | 일정 고치기·같은 종류 여러 개 | 통과 | schedule.md |
| A14 | 옛 이름 검색 | 통과 | common.md |
| A15 | 최대화 움직임 | 통과 | common.md |
| A16 | 사용자 테스트용 v1 예시 파일 | 통과 | properties.md |

통과 16 · 실패 0

## 실패 항목
없음

## 참고 사항
- A16 파일: `docs/features/applications/human/tests/r2-data/applications.json` (v1, 카드 3장). 앱 데이터 폴더의 applications.json 자리에 넣고 앱을 열면 v2로 옮겨진 뒤 바로 덮어써진다(백업 없음). 옮긴 결과는 properties.md A16.
- A1 빌드 경고: JS 덩어리 782 kB(500 kB 초과), 예전부터 있던 경고.
- A14: `NextItem.kind "deadline"`·홈 요약 칸 id `"deadline"`은 옛 데이터 이름이 아니라 남겨 둠(이름이 헷갈릴 수 있음).
- A15는 코드로만 확인. 실제 움직임은 사용자 테스트에서 확인 필요.
