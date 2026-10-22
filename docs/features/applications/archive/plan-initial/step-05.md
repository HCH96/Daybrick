# 지원 관리 계획 5단계: 상태

- 요구사항: R17–R22
- 목업: popup.html (popup-status), part-status.html, part-result.html
- 경로 기준: `apps/desktop/src/` (Rust는 `apps/desktop/src-tauri/`)
- 공통 규칙: [index.md](index.md)의 "0. 결정 사항"과 "작은 규칙"

## 할 일
상태: 큰 배지, 상태 → 세부 단계 고르기, 종료·결과, 지원 완료·전형 준비 규칙

## 확인할 결과
배지 색이 상태마다 다름. "지원 완료"로 바꾸면 지원일이 오늘로 채워짐(이미 있으면 그대로). "전형 준비 · 코딩테스트"로 바꾸면 작은 달력이 뜨고, 날짜를 고르면 카드에 보라색 "D-3 코딩테스트", 건너뛰기도 됨. "종료"를 고르면 결과 칸이 뜨고 카드가 "종료" 탭으로 이동

## 이 단계에서 만들거나 고칠 파일

### 데이터와 계산 (`features/applications/`)
| 파일 | 내용 | 단계 |
|---|---|---|
| `transitions.ts` | 상태 바꿀 때 규칙 (R20~R22: 지원 완료 일정 생성, 지원일 채우기 등) | 5 |
| `calendarGrid.ts` | 월 달력 칸 계산 (작은 달력과 큰 달력이 같이 씀) | 5, 8 |

화면 컴포넌트: pages/applications/status/: StatusBadge, StatusPicker, ResultPicker / detail/: StatusRow (각각 파일 + 필요하면 `.css`. 구조는 [structure.md](structure.md) "2. 컴포넌트 구조")
