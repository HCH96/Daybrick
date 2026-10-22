# 지원 관리 (Applications) 구현 계획

- 기능 명세서: [docs/ai/features/applications.md](../features/applications.md) (R1~R37)
- 승인된 목업: [docs/human/mockups/applications.html](../../human/mockups/applications.html)
- 작성일: 2026-10-22
- 상태: 승인됨 (2026-10-22), 구현 중 (4단계 완료)
- 경로 기준: `apps/desktop/src/` (Rust는 `apps/desktop/src-tauri/`)

## 0. 결정 사항 (2026-10-22 사용자 승인, 추천안 4개 그대로)

| # | 항목 | 결정 | 고려했던 다른 선택지 |
|---|---|---|---|
| 1 | 저장 방식 | 앱 데이터 폴더에 JSON 파일 1개(`applications.json`) + `images/` 폴더. Rust 명령으로 읽기/쓰기 | SQLite (지금 데이터 양에는 과함) |
| 2 | 마크다운 편집기 (R34) | Tiptap + 마크다운 변환 확장 | Milkdown, BlockNote |
| 3 | 역할 있는 기본 속성(마감일·지원일·우선순위·결과·회사)의 종류 바꾸기 | 막는다. 이름·항목 변경과 삭제는 가능 | 허용하고 종류가 바뀌면 역할을 끔 |
| 4 | 홈 요약 줄의 "지원 관리" 칸 | "진행 중 N곳"으로 채운다 | 명세 범위(R36 카드)만 하고 그대로 둠 |

### 작은 규칙 (계획에서 정함)
- 우선순위 막대는 기본 항목 3개(높음·중간·낮음)에만 붙인다. 새로 추가한 항목은 칩으로만 보여준다.
- 결과 속성을 삭제하면 종료로 바꿀 때 결과 고르는 칸이 뜨지 않는다.
- 자동 저장은 마지막으로 고친 뒤 0.5초 기다렸다가 파일에 쓴다. 팝업 오른쪽 위에 "저장 중… / 저장됨"을 표시한다.
- 목업의 페이지 부제 "진행 중 N곳 · 이번 주 일정 N개"도 넣는다.
- id는 JS의 `crypto.randomUUID()`로 만든다.
- 본문 마크다운에는 이미지를 상대 경로(`images/<id>.png`)로 저장하고, 화면에 보여줄 때 asset 프로토콜 주소로 바꾼다.

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

## 3. 구현 순서와 단계별 확인할 결과

실행: `apps/desktop`에서 `npm run tauri dev`. 단계마다 끝나면 멈추고 사용자 화면 확인을 받는다.

| 단계 | 할 일 | 확인할 결과 |
|---|---|---|
| 1 | 저장 기반 + 페이지 뼈대: Rust 저장 명령, 타입·기본 속성, Provider, 머리줄(전환 버튼, + 새 지원) | 사이드바 "지원 현황"을 누르면 준비 중 화면 대신 머리줄이 보임. "+ 새 지원"을 누를 때마다 카드 수가 늘고, 앱을 껐다 켜도 남아 있음. `%APPDATA%\<앱 id>\applications.json` 파일이 생김 |
| 2 | 갤러리: 카드 바둑판, 탭, 마감일 순 정렬, 카드 앞면 | 새 카드가 "제목 없음 · [● 지원 준비] · 예정된 일정 없음"으로 4열 배치, 창을 좁히면 3열. 탭 전환이 동작 |
| 3 | 상세 팝업 틀: 열기/닫기, 최대화, 제목 고치기, 자동 저장 표시, 삭제 확인 | 카드를 누르면 가운데 팝업 + 창 전체가 어두워짐. 바깥 클릭·Esc·✕로 닫힘. 최대화하면 사이드바를 남기고 본문을 꽉 채움, 사이드바를 접고 최대화하면 그 자리까지 채움. 제목을 고치면 "저장됨"이 뜨고 카드에도 반영. 🗑 → 확인 → 카드 사라짐 |
| 4 | 속성: 값 편집 7종, 작은 달력, 선택 항목 추가·색, 속성 추가·이름/종류 바꾸기·삭제 | 회사에 "네오플"을 쓰면 항목이 생기고 색을 고를 수 있음. 마감일을 달력에서 고르면 카드에 "D-5 마감"(회색). 우선순위 "높음"이면 빨간 막대 3칸. 마감일 순 정렬 확인. 새 속성을 추가하면 모든 카드에 생김. 역할 있는 기본 속성은 종류 바꾸기가 막혀 있음 |
| 5 | 상태: 큰 배지, 상태 → 세부 단계 고르기, 종료·결과, 지원 완료·전형 준비 규칙 | 배지 색이 상태마다 다름. "지원 완료"로 바꾸면 지원일이 오늘로 채워짐(이미 있으면 그대로). "전형 준비 · 코딩테스트"로 바꾸면 작은 달력이 뜨고, 날짜를 고르면 카드에 보라색 "D-3 코딩테스트", 건너뛰기도 됨. "종료"를 고르면 결과 칸이 뜨고 카드가 "종료" 탭으로 이동 |
| 6 | 전형 일정 창: 종류 버튼 + 날짜, 목록에서 날짜·시간·메모 고치기·지우기 | 📅에서 면접 2개(메모 "1차", "2차") 저장. 📅 옆과 카드에 가장 가까운 일정 하나만 보임. 지난 일정만 남으면 📅 옆은 비고 카드에는 "예정된 일정 없음". D-1·당일은 빨간색 |
| 7 | 본문 편집기: Tiptap, 이미지 붙여 넣기 | `# 제목`, `- 목록`, `**굵게**`를 치는 즉시 서식이 바뀜. 캡처 이미지를 Ctrl+V 하면 보이고, 앱을 다시 켜도 남아 있음. `images/` 폴더에 파일이 생김 |
| 8 | 달력: 월 이동, `제목 · 일정 종류`, 상태 색, 마감일 점선, 지난 일정 흐리게, +N개 더 | "달력"을 누르면 이번 달이 보이고 5~6단계에서 넣은 일정이 그 날짜에 표시. 지원 준비 카드 마감일은 점선·회색, 상태(대기·준비)는 안 보임. 일정을 누르면 그 카드 팝업이 열림. 종료 카드의 지난 일정도 남아 있음 |
| 9 | 홈 연동 | 홈 지원 현황 카드에 "전형 준비 3 · 과제 1 · 코테 1 · 면접 1" 같은 개수. 종료 카드는 세지 않음. 요약 줄에 "진행 중 N곳" |
| 10 | 마무리 | `npm run build`·`cargo check` 통과, 960x640·1200x800·최대화에서 확인, 진행 기록·PROJECT.md 한 줄 갱신, `/test 지원관리` 안내 |

## 이번 계획에 넣지 않는 것
명세서의 "이번 범위에서 제외하는 것" 그대로 (OS 창 분리, 상태 목록 편집, 댓글, 지원 경로 속성, 달력 주 단위 보기와 날짜 눌러 추가, 끌어서 순서 바꾸기·정렬·필터, 검색, 이미지 크기 조절, Supabase 동기화).
