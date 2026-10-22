# 지원 관리 계획 1단계: 저장 기반 + 페이지 뼈대

- 요구사항: R1–R2
- 목업: gallery.html (gallery-head)
- 경로 기준: `apps/desktop/src/` (Rust는 `apps/desktop/src-tauri/`)
- 공통 규칙: [index.md](index.md)의 "0. 결정 사항"과 "작은 규칙"

## 할 일
저장 기반 + 페이지 뼈대: Rust 저장 명령, 타입·기본 속성, Provider, 머리줄(전환 버튼, + 새 지원)

## 확인할 결과
사이드바 "지원 현황"을 누르면 준비 중 화면 대신 머리줄이 보임. "+ 새 지원"을 누를 때마다 카드 수가 늘고, 앱을 껐다 켜도 남아 있음. `%APPDATA%\<앱 id>\applications.json` 파일이 생김

## 이 단계에서 만들거나 고칠 파일

### Rust / 설정
| 구분 | 파일 | 내용 | 단계 |
|---|---|---|---|
| 수정 | `src-tauri/src/lib.rs` | `greet` 대신 저장 명령 등록 | 1 |
| 새로 | `src-tauri/src/storage.rs` | `load_applications`, `save_applications`(임시 파일에 쓴 뒤 바꿔치기), `save_image`(바이트를 그대로 받아 `images/`에 저장) | 1, 7 |

### 데이터와 계산 (`features/applications/`)
| 파일 | 내용 | 단계 |
|---|---|---|
| `types.ts` | `Application`, `ScheduleEvent`, `PropertyDef`, `PropertyValue`, `StatusId`, `StageId` | 1 |
| `statuses.ts` | 상태 5개·세부 단계 3개, 이름·색 (고정 목록) | 1 |
| `defaultProperties.ts` | 기본 속성 10개와 처음 항목, 역할(`deadline`, `appliedDate`, `priority`, `result`, `company`) | 1 |
| `storage.ts` | Rust 명령 호출, 파일 형식 버전 확인 | 1 |
| `store.tsx` | 전체 데이터 Context + reducer + 0.5초 늦춰 저장 | 1 |

### 공용 컴포넌트 (`components/common/`)
| 파일 | 내용 | 단계 |
|---|---|---|
| `SegmentedControl.tsx` (+css) | `갤러리 / 달력`, `진행 중 / 종료 / 전체` 전환 버튼 | 1, 2 |

### 수정하는 기존 파일
| 파일 | 내용 | 단계 |
|---|---|---|
| `app/pages.ts` | 지원 관리 항목을 실제 화면으로 교체 | 1 |
| `App.tsx` | `ApplicationsProvider`로 감싸기 (홈과 지원 관리가 같은 데이터를 봄) | 1 |

화면 컴포넌트: pages/applications/: ApplicationsPage, ApplicationsHeader (각각 파일 + 필요하면 `.css`. 구조는 [structure.md](structure.md) "2. 컴포넌트 구조")
