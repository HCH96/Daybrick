# 지원 관리 계획 6단계: 전형 일정 창

- 요구사항: R23–R27
- 목업: popup.html (popup-status), part-schedule.html
- 경로 기준: `apps/desktop/src/` (Rust는 `apps/desktop/src-tauri/`)
- 공통 규칙: [index.md](index.md)의 "0. 결정 사항"과 "작은 규칙"

## 할 일
전형 일정 창: 종류 버튼 + 날짜, 목록에서 날짜·시간·메모 고치기·지우기

## 확인할 결과
📅에서 면접 2개(메모 "1차", "2차") 저장. 📅 옆과 카드에 가장 가까운 일정 하나만 보임. 지난 일정만 남으면 📅 옆은 비고 카드에는 "예정된 일정 없음". D-1·당일은 빨간색

## 이 단계에서 만들거나 고칠 파일

### 데이터와 계산 (`features/applications/`)
| 파일 | 내용 | 단계 |
|---|---|---|
| `schedule.ts` | 다음 일정, D-day, 정렬, 탭 거르기 | 2, 6 |

화면 컴포넌트: pages/applications/schedule/: ScheduleButton, NextEventLabel, SchedulePopover, ScheduleItemRow (각각 파일 + 필요하면 `.css`. 구조는 [structure.md](structure.md) "2. 컴포넌트 구조")
