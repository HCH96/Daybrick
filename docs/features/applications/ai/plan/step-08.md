# 지원 관리 계획 8단계: 달력

- 요구사항: R7–R11
- 목업: calendar.html
- 경로 기준: `apps/desktop/src/` (Rust는 `apps/desktop/src-tauri/`)
- 공통 규칙: [index.md](index.md)의 "0. 결정 사항"과 "작은 규칙"

## 할 일
달력: 월 이동, `제목 · 일정 종류`, 상태 색, 마감일 점선, 지난 일정 흐리게, +N개 더

## 확인할 결과
"달력"을 누르면 이번 달이 보이고 5~6단계에서 넣은 일정이 그 날짜에 표시. 지원 준비 카드 마감일은 점선·회색, 상태(대기·준비)는 안 보임. 일정을 누르면 그 카드 팝업이 열림. 종료 카드의 지난 일정도 남아 있음

## 이 단계에서 만들거나 고칠 파일

### 데이터와 계산 (`features/applications/`)
| 파일 | 내용 | 단계 |
|---|---|---|
| `calendarGrid.ts` | 월 달력 칸 계산 (작은 달력과 큰 달력이 같이 씀) | 5, 8 |

화면 컴포넌트: pages/applications/calendar/: CalendarView, CalendarDayCell, CalendarEventChip (각각 파일 + 필요하면 `.css`. 구조는 [structure.md](structure.md) "2. 컴포넌트 구조")
