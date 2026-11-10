# 지원 관리 계획 2단계: 갤러리

- 요구사항: R3–R6
- 목업: gallery.html, part-ended-card.html
- 경로 기준: `apps/desktop/src/` (Rust는 `apps/desktop/src-tauri/`)
- 공통 규칙: [index.md](index.md)의 "0. 결정 사항"과 "작은 규칙"

## 할 일
갤러리: 카드 바둑판, 탭, 마감일 순 정렬, 카드 앞면

## 확인할 결과
새 카드가 "제목 없음 · [● 지원 준비] · 예정된 일정 없음"으로 4열 배치, 창을 좁히면 3열. 탭 전환이 동작

## 이 단계에서 만들거나 고칠 파일

### 데이터와 계산 (`features/applications/`)
| 파일 | 내용 | 단계 |
|---|---|---|
| `schedule.ts` | 다음 일정, D-day, 정렬, 탭 거르기 | 2, 6 |

### 공용 컴포넌트 (`components/common/`)
| 파일 | 내용 | 단계 |
|---|---|---|
| `SegmentedControl.tsx` (+css) | `갤러리 / 달력`, `진행 중 / 종료 / 전체` 전환 버튼 | 1, 2 |

화면 컴포넌트: pages/applications/gallery/: GalleryView, ApplicationCard, PriorityBars (각각 파일 + 필요하면 `.css`. 구조는 [structure.md](structure.md) "2. 컴포넌트 구조")
