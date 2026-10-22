# r1 · 상세 팝업 (R12–R16)

## A15. 자동 저장·닫을 때 저장·깨진 파일 보호
- 근거: R15, D11, 계획 작은 규칙(0.5초 후 저장, "저장 중… / 저장됨")
- 수행 방법: `useAutoSave.ts`, `storage.ts`, `store.tsx`, `src-tauri/src/storage.rs`, `capabilities/default.json` 코드 읽기
- 예상 결과:
  - 고친 뒤 0.5초 기다렸다 저장, 그 사이 또 고치면 다시 기다림
  - 창을 닫을 때 기다리던 저장을 먼저 씀
  - 파일이 깨졌거나 모르는 버전이면 저장을 막아 기존 파일을 지킴
  - 저장 버튼 없음
- 실제 결과:
  - `SAVE_DELAY_MS = 500`, 바뀔 때마다 `clearTimeout` 후 다시 건다. 상태는 saving → saved / error
  - `onCloseRequested`에서 `flush()`를 기다림. 창 닫기에 필요한 `core:window:allow-destroy` 권한 있음
  - 읽기 실패 시 reducer가 `error` 상태가 되고 `useAutoSave(null)`이라 저장하지 않음. 화면에 "기존 파일을 지키기 위해 저장을 멈췄어요" 안내
  - Rust는 임시 파일(`applications.json.tmp`)에 쓴 뒤 이름을 바꿔 덮음
  - 팝업에 저장 버튼 없음 (`ApplicationDetailModal.tsx`의 버튼: 최대화·삭제·닫기)
- 판정: 통과 (실제 파일 생성과 재시작 후 유지는 사용자 테스트)
