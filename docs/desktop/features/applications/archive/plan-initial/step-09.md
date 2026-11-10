# 지원 관리 계획 9단계: 홈 연동

- 요구사항: R36–R37
- 목업: 메인 페이지 목업 home.html의 home-apps
- 경로 기준: `apps/desktop/src/` (Rust는 `apps/desktop/src-tauri/`)
- 공통 규칙: [index.md](index.md)의 "0. 결정 사항"과 "작은 규칙"

## 할 일
홈 연동

## 확인할 결과
홈 지원 현황 카드에 "전형 준비 3 · 과제 1 · 코테 1 · 면접 1" 같은 개수. 종료 카드는 세지 않음. 요약 줄에 "진행 중 N곳"

## 이 단계에서 만들거나 고칠 파일

### 데이터와 계산 (`features/applications/`)
| 파일 | 내용 | 단계 |
|---|---|---|
| `summary.ts` | 홈용 상태별·세부 단계별 개수 | 9 |

### 수정하는 기존 파일
| 파일 | 내용 | 단계 |
|---|---|---|
| `pages/home/dashboardCards.tsx` | 지원 현황 본문을 `ApplicationsSummaryCard`로 교체 | 9 |
| `pages/home/SummaryStrip.tsx` | 지원 관리 칸에 진행 중 개수 | 9 |

화면 컴포넌트: pages/home/ApplicationsSummaryCard.tsx (+css) (각각 파일 + 필요하면 `.css`. 구조는 [structure.md](structure.md) "2. 컴포넌트 구조")
