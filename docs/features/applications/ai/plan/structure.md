# 지원 관리 구현 계획: 파일 목록과 컴포넌트 구조
전체 구조가 필요할 때만 읽는다. 단계 하나를 구현할 때는 그 단계의 step 파일만 읽으면 된다.

## 1. 만들거나 수정할 파일

### Rust / 설정
| 구분 | 파일 | 내용 | 단계 |
|---|---|---|---|
| 수정 | `src-tauri/src/lib.rs` | `greet` 대신 저장 명령 등록 | 1 |
| 새로 | `src-tauri/src/storage.rs` | `load_applications`, `save_applications`(임시 파일에 쓴 뒤 바꿔치기), `save_image`(바이트를 그대로 받아 `images/`에 저장) | 1, 7 |
| 수정 | `src-tauri/Cargo.toml`, `tauri.conf.json` | 이미지 표시용 asset 프로토콜 켜기 (앱 데이터 폴더 `images/`만 허용) | 7 |
| 수정 | `package.json` | Tiptap 패키지 추가 | 7 |

### 데이터와 계산 (`features/applications/`)
화면과 무관한 순수 로직. 나중에 테스트 도구를 도입하면 여기부터 테스트한다.

| 파일 | 내용 | 단계 |
|---|---|---|
| `types.ts` | `Application`, `ScheduleEvent`, `PropertyDef`, `PropertyValue`, `StatusId`, `StageId` | 1 |
| `statuses.ts` | 상태 5개·세부 단계 3개, 이름·색 (고정 목록) | 1 |
| `defaultProperties.ts` | 기본 속성 10개와 처음 항목, 역할(`deadline`, `appliedDate`, `priority`, `result`, `company`) | 1 |
| `storage.ts` | Rust 명령 호출, 파일 형식 버전 확인 | 1 |
| `store.tsx` | 전체 데이터 Context + reducer + 0.5초 늦춰 저장 | 1 |
| `transitions.ts` | 상태 바꿀 때 규칙 (R20~R22: 지원 완료 일정 생성, 지원일 채우기 등) | 5 |
| `schedule.ts` | 다음 일정, D-day, 정렬, 탭 거르기 | 2, 6 |
| `calendarGrid.ts` | 월 달력 칸 계산 (작은 달력과 큰 달력이 같이 씀) | 5, 8 |
| `summary.ts` | 홈용 상태별·세부 단계별 개수 | 9 |

### 데이터 모양 (요약)
```ts
type StatusId = "preparing" | "applied" | "stage-prep" | "awaiting" | "closed";
type StageId = "assignment" | "coding-test" | "interview";
type PropertyValue = string | number | boolean | string[] | null; // null = 없음

interface Application {
  id: string; title: string;
  status: StatusId; stage: StageId | null;   // stage는 전형 준비·결과 대기일 때만
  values: Record<string, PropertyValue>;    // 속성 id → 값
  events: ScheduleEvent[];                  // 전형 일정
  body: string;                             // 마크다운
  createdAt: string; updatedAt: string;
}
// 파일: { version: 1, properties: PropertyDef[], applications: Application[] }
```

### 공용 컴포넌트 (`components/common/`)
| 파일 | 내용 | 단계 |
|---|---|---|
| `SegmentedControl.tsx` (+css) | `갤러리 / 달력`, `진행 중 / 종료 / 전체` 전환 버튼 | 1, 2 |
| `Modal.tsx` (+css) | 앱 창 전체를 어둡게 덮는 바탕 + 가운데 상자, 바깥 클릭·Esc로 닫기 | 3 |
| `ConfirmDialog.tsx` (+css) | 삭제 확인 창 | 3 |
| `Popover.tsx` (+css) | 버튼 옆에 뜨는 작은 창 | 4 |
| `MiniCalendar.tsx` (+css) | 날짜를 클릭해서 고르는 작은 달력 | 4 |

### 지원 관리 화면 (`pages/applications/`)
아래 "2. 컴포넌트 구조"의 컴포넌트를 각각 파일(+ 필요하면 `.css`)로 만든다. 폴더 구분:
- `pages/applications/`: `ApplicationsPage`, `ApplicationsHeader`
- `pages/applications/gallery/`: `GalleryView`, `ApplicationCard`, `PriorityBars`
- `pages/applications/calendar/`: `CalendarView`, `CalendarDayCell`, `CalendarEventChip`
- `pages/applications/detail/`: `ApplicationDetailModal`, `TitleInput`, `StatusRow`, `MarkdownBody`
- `pages/applications/status/`: `StatusBadge`, `StatusPicker`, `ResultPicker`
- `pages/applications/schedule/`: `ScheduleButton`, `NextEventLabel`, `SchedulePopover`, `ScheduleItemRow`
- `pages/applications/properties/`: `PropertyList`, `PropertyRow`, `PropertyValueEditor`(+ 종류별 7개), `OptionPicker`, `PropertyMenu`, `AddPropertyButton`
- `pages/home/ApplicationsSummaryCard.tsx` (+css): 홈 지원 현황 카드 본문

### 수정하는 기존 파일
| 파일 | 내용 | 단계 |
|---|---|---|
| `app/pages.ts` | 지원 관리 항목을 실제 화면으로 교체 | 1 |
| `App.tsx` | `ApplicationsProvider`로 감싸기 (홈과 지원 관리가 같은 데이터를 봄) | 1 |
| `styles/theme.css` | 선택 항목 8색(빨강·보라·청록·분홍 추가) | 4 |
| `pages/home/dashboardCards.tsx` | 지원 현황 본문을 `ApplicationsSummaryCard`로 교체 | 9 |
| `pages/home/SummaryStrip.tsx` | 지원 관리 칸에 진행 중 개수 | 9 |

## 2. 컴포넌트 구조

```
App
└─ ApplicationsProvider (데이터 전체 + 저장)
   ├─ HomePage
   │  └─ ApplicationsSummaryCard        상태별 개수 + 세부 단계 개수 (R36·R37)
   └─ ApplicationsPage                   머리줄 + 갤러리/달력 + 팝업 (R1·R2)
      ├─ ApplicationsHeader             제목·부제, [갤러리|달력], [+ 새 지원]
      ├─ GalleryView                    탭 + 카드 바둑판 4열/3열 (R3~R5)
      │  └─ ApplicationCard             제목, StatusBadge, 회사, NextEventLabel, PriorityBars (R6)
      ├─ CalendarView                   월 이동 + 월 달력 (R7~R11)
      │  └─ CalendarDayCell → CalendarEventChip   "+N개 더" 접기
      └─ ApplicationDetailModal         일반/최대화, 저장됨·삭제·닫기 (R12~R16)
         ├─ TitleInput
         ├─ StatusRow
         │  ├─ StatusBadge → StatusPicker (Popover: 상태 → 세부 단계, R18)
         │  │   ├─ ResultPicker         종료 시 결과 고르기 (R20)
         │  │   └─ MiniCalendar         전형 준비 날짜 고르기, 건너뛰기 (R22)
         │  └─ ScheduleButton(📅) + NextEventLabel
         │     └─ SchedulePopover       종류 버튼 + MiniCalendar + 저장된 일정 목록 (R25~R27)
         │        └─ ScheduleItemRow    날짜·시간·메모 고치기, 지우기
         ├─ PropertyList (R28~R33)
         │  ├─ PropertyRow → PropertyValueEditor (종류별 7개)
         │  │   Text / Number / Select / MultiSelect / Date(MiniCalendar) / Url / Checkbox
         │  │   └─ OptionPicker         쓰면서 항목 추가, 8색 고르기 (R30)
         │  ├─ PropertyMenu             이름·종류 바꾸기, 삭제
         │  └─ AddPropertyButton
         └─ MarkdownBody                Tiptap 편집기 + 이미지 붙여 넣기 (R34·R35)
```

### C++ 비유
- `ApplicationsProvider`(Context + reducer)는 앱 전체가 참조하는 싱글턴 데이터 관리자와 비슷하다. 다만 상태를 직접 고치지 않고, 동작(action)을 보내면 reducer가 새 객체를 만들어 돌려준다(불변).
- Rust 명령(`#[tauri::command]`)은 DLL에서 내보낸 함수를 JS가 이름으로 부르는 것과 비슷하다. 차이는 인자·결과가 직렬화되어 오가고, 항상 비동기(`Promise`)라는 점이다.
- 0.5초 늦춰 저장(debounce)은 입력이 올 때마다 다시 거는 watchdog 타이머와 같다. 입력이 멈춰야 한 번 발동한다.

