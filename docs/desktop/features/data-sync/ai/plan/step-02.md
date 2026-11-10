# 데이터 동기화 2단계: 로컬 파일 기반 (sync.json·백업·parse 분리)

- 요구사항: R11(대기 기록 유지), R13, R21, R33의 바탕
- 목업: 없음
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D5, D8

## 할 일
- 새 `src-tauri/src/sync.rs` (plan.rs와 같은 방식: 문자열 그대로, 임시 파일 → 바꿔치기):
  - `load_sync_state() -> Option<String>`, `save_sync_state(json)` : 앱 데이터 폴더 `sync.json`.
  - `write_sync_backup(kind, json) -> String` : `sync-backups/<kind>-<YYYYMMDD-HHmmss>.json`에 쓰고 경로를 돌려준다. kind는 4개만 받는다 (그 밖이면 오류).
  - `has_sync_backups() -> bool`, `open_sync_backup_dir()` : 폴더를 opener 플러그인(`OpenerExt::open_path`)으로 연다.
  - `sync_device_name() -> String` : `COMPUTERNAME`, 없으면 "PC".
- `src-tauri/src/lib.rs`: `mod sync;`, 명령 등록.
- `features/{plan,calendar,applications,today}/storage.ts`: `loadXData` 안의 "JSON.parse → 모양 검사 → 버전 검사 → 빈 칸 채우기"를 `export function parseXData(raw: string): XData`로 빼고, `loadXData`는 그것을 부른다. 동작은 바꾸지 않는다. 각 파일의 현재 버전 상수도 내보낸다(`X_FILE_VERSION`).
- 새 `features/sync/types.ts` (structure.md 2절), `features/sync/syncFile.ts`:
  - `loadSyncFile()`: 없거나 깨졌으면 기본값(꺼짐, 종류마다 rev·hash null, state "ok") — 깨진 sync.json 때문에 앱이 멈추지 않게.
  - `saveSyncFile(file)`. Tauri 밖에서는 둘 다 메모리 기본값.

## 확인할 결과
- `cargo check`, `npm run build` 성공.
- 플랜·캘린더·지원 관리·투데이 화면이 전처럼 읽히고, 고친 내용이 다시 켠 뒤에도 남는다 (parse 분리로 동작이 바뀌지 않음).
- 개발자 도구에서 `invoke("write_sync_backup", { kind: "plan", json: "{}" })`를 부르면 `%APPDATA%\com.daybrick.desktop\sync-backups\plan-….json`이 생기고, `open_sync_backup_dir`로 탐색기가 열린다. `kind: "x"`면 오류.

## 이 단계에서 만들거나 고칠 파일
- 새 `src-tauri/src/sync.rs`, `src-tauri/src/lib.rs`
- `features/plan/storage.ts`, `features/calendar/storage.ts`, `features/applications/storage.ts`, `features/today/storage.ts`
- 새 `features/sync/types.ts`, `features/sync/syncFile.ts`
