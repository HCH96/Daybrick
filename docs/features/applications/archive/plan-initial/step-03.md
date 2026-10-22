# 지원 관리 계획 3단계: 상세 팝업 틀

- 요구사항: R12–R16
- 목업: popup.html (popup-head), popup-max.html, part-delete.html
- 경로 기준: `apps/desktop/src/` (Rust는 `apps/desktop/src-tauri/`)
- 공통 규칙: [index.md](index.md)의 "0. 결정 사항"과 "작은 규칙"

## 할 일
상세 팝업 틀: 열기/닫기, 최대화, 제목 고치기, 자동 저장 표시, 삭제 확인

## 확인할 결과
카드를 누르면 가운데 팝업 + 창 전체가 어두워짐. 바깥 클릭·Esc·✕로 닫힘. 최대화하면 사이드바를 남기고 본문을 꽉 채움, 사이드바를 접고 최대화하면 그 자리까지 채움. 제목을 고치면 "저장됨"이 뜨고 카드에도 반영. 🗑 → 확인 → 카드 사라짐

## 이 단계에서 만들거나 고칠 파일

### 공용 컴포넌트 (`components/common/`)
| 파일 | 내용 | 단계 |
|---|---|---|
| `Modal.tsx` (+css) | 앱 창 전체를 어둡게 덮는 바탕 + 가운데 상자, 바깥 클릭·Esc로 닫기 | 3 |
| `ConfirmDialog.tsx` (+css) | 삭제 확인 창 | 3 |

화면 컴포넌트: pages/applications/detail/: ApplicationDetailModal, TitleInput (각각 파일 + 필요하면 `.css`. 구조는 [structure.md](structure.md) "2. 컴포넌트 구조")
