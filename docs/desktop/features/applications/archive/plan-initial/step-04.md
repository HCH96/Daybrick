# 지원 관리 계획 4단계: 속성

- 요구사항: R28–R33
- 목업: popup.html (popup-props), part-option.html, part-add-prop.html
- 경로 기준: `apps/desktop/src/` (Rust는 `apps/desktop/src-tauri/`)
- 공통 규칙: [index.md](index.md)의 "0. 결정 사항"과 "작은 규칙"

## 할 일
속성: 값 편집 7종, 작은 달력, 선택 항목 추가·색, 속성 추가·이름/종류 바꾸기·삭제

## 확인할 결과
회사에 "네오플"을 쓰면 항목이 생기고 색을 고를 수 있음. 마감일을 달력에서 고르면 카드에 "D-5 마감"(회색). 우선순위 "높음"이면 빨간 막대 3칸. 마감일 순 정렬 확인. 새 속성을 추가하면 모든 카드에 생김. 역할 있는 기본 속성은 종류 바꾸기가 막혀 있음

## 이 단계에서 만들거나 고칠 파일

### 공용 컴포넌트 (`components/common/`)
| 파일 | 내용 | 단계 |
|---|---|---|
| `Popover.tsx` (+css) | 버튼 옆에 뜨는 작은 창 | 4 |
| `MiniCalendar.tsx` (+css) | 날짜를 클릭해서 고르는 작은 달력 | 4 |

### 수정하는 기존 파일
| 파일 | 내용 | 단계 |
|---|---|---|
| `styles/theme.css` | 선택 항목 8색(빨강·보라·청록·분홍 추가) | 4 |

화면 컴포넌트: pages/applications/properties/: PropertyList, PropertyRow, PropertyValueEditor(+ 종류별 7개), OptionPicker, PropertyMenu, AddPropertyButton (각각 파일 + 필요하면 `.css`. 구조는 [structure.md](structure.md) "2. 컴포넌트 구조")
