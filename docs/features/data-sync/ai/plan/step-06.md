# 데이터 동기화 6단계: 선택창·받아오기·백업

- 요구사항: R15, R19–R23, R31, R33
- 목업: 없음. 명세 화면 구성의 [고르기], "종류별 ⋯ › 서버에서 받아오기", "백업 폴더 열기"
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D4, D5, D8, D9

## 할 일
- 새 `features/sync/resolve.ts`:
  - `keepLocal(kind)` (PC 남기기, 서버를 덮음): 서버 행을 다시 읽어 `write_sync_backup`으로 서버 내용을 백업 → `pushDoc(baseRev = 지금 서버 rev)` → 맞춘 상태 기록. 그 사이 또 바뀌어 충돌하면 "선택 필요"로 두고 다시 고르게 한다.
  - `takeServer(kind)` (서버 받기, PC를 덮음): 서버 데이터를 `kinds.parse`로 검사(버전이 앱보다 크거나 모양이 틀리면 거부하고 오류 문구, R22) → 로컬 파일을 백업 → `writeLocal` → 등록된 `reload(kind)` 호출 (R23) → rev·hash 기록.
  - 백업이 실패하면 덮지 않는다 (D5).
- `features/*/store.tsx` (4개): `useSyncReload(kind, reload)`로 다시 읽기 함수를 등록한다. reload는 `loadXData()`로 파일을 읽어 `dispatch({ type: "loaded", data })`. 자동 저장이 같은 내용을 한 번 더 쓰더라도 해시가 같아 다시 올라가지 않는다 (D8).
- 새 `pages/settings/SyncChoiceDialog.tsx` (Modal, R19·R20): 종류 이름, "이 PC: 11/8 19:08 · <기기>" / "서버: 11/8 18:40 · <기기>", [PC 내용 남기기 (추천)] [서버 내용 받기], 아래에 "덮이는 쪽은 백업 폴더에 남습니다". 로컬 시각은 파일 내용의 가장 늦은 updatedAt이 없으면 "알 수 없음".
- 로컬이 빈 경우(R15, R18 "ask-pull")는 같은 창에서 "서버에서 받아오기"를 추천 버튼으로 둔다.
- `SyncKindRow.tsx`: 상태가 "선택 필요"면 [고르기] → 선택창. ⋯ 메뉴(Popover) › "서버에서 받아오기" → `ConfirmDialog`("PC의 <종류> 내용을 서버 내용으로 바꿉니다. 지금 내용은 백업됩니다.") → `takeServer` (R31).
- `SyncSection.tsx`: `has_sync_backups`가 true면 "백업 폴더 열기" 링크 (R33).

## 확인할 결과
- `npm run build` 성공.
- 5단계처럼 plan을 "선택 필요"로 만든 뒤 [고르기]를 누르면 양쪽 시각·기기 이름이 보인다.
  - "PC 내용 남기기": `sync-backups/plan-….json`에 서버 내용이 생기고 서버가 PC 내용으로 바뀐다.
  - "서버 내용 받기": `sync-backups/plan-….json`에 원래 plan.json이 생기고, 앱을 다시 켜지 않아도 플랜 화면이 서버 내용으로 바뀐다.
- 대시보드에서 calendar 행의 `file_version`을 99로 바꾸고 받아오기를 하면 거부되고 calendar.json은 그대로다.
- 앱을 끄고 plan.json을 다른 곳으로 옮긴 뒤 켜면 plan이 "선택 필요"이고, 선택창이 "서버에서 받아오기"를 추천한다. 자동으로 빈 내용을 올리지 않는다 (서버 rev 그대로).
- 백업이 생긴 뒤 "백업 폴더 열기"가 보이고 누르면 탐색기가 열린다.

## 이 단계에서 만들거나 고칠 파일
- 새 `features/sync/resolve.ts`, 새 `pages/settings/SyncChoiceDialog.tsx`
- `features/plan/store.tsx`, `features/calendar/store.tsx`, `features/applications/store.tsx`, `features/today/store.tsx`
- `features/sync/useSync.ts`, `features/sync/SyncProvider.tsx`, `pages/settings/SyncKindRow.tsx`, `pages/settings/SyncSection.tsx`
