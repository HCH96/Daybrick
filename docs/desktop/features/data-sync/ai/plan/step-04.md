# 데이터 동기화 4단계: 켜기와 설정 구역

- 요구사항: R7, R17, R18, R27, R29, R32
- 목업: 없음. 명세 req-settings.md "화면 구성"과 지금 설정 화면(`ServerSectionConnected`)의 `settings-row`·`settings-btn` 모양을 따른다.
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D3, D4, D5, D9

## 할 일
- 새 `features/sync/useSync.ts`: 컨텍스트와 `useSync()`. 값: `file`(sync.json), `blocked`(이유: "off"·"login"·"server-update"·"app-update"·null), `enable()`, `disable()`, `busy`, `notifySaved(kind)`(5단계에서 채움, 지금은 빈 함수).
- 새 `features/sync/SyncProvider.tsx`:
  - 켤 때 `loadSyncFile`. 막힘 이유는 `useServer()`의 status·serverSession으로 정한다 (server-update면 동기화 안 함, R7).
  - `enable()`: 켜짐 저장 → 종류마다 `readLocal`·`fetchDoc` → `decide` → "upload"는 `pushDoc`(서버 없음이면 baseRev null), "same"은 rev·hash 기록, "ask-pull"·"choose"는 state "choice"로 둔다(6단계에서 고르기). 읽지 못한 종류는 "skipped" (R13). 계정 id를 `userId`에 적는다.
  - `disable()`: 켜짐만 끄고 rev·hash는 둔다. 다시 켜면 enable 흐름을 다시 탄다 (R27). 서버·로컬 데이터는 건드리지 않는다.
- `App.tsx`: `ServerProvider` 안, `NavigationContext`·기능 Provider 바깥에 `SyncProvider` (D9).
- 새 `pages/settings/SyncSection.tsx`·`.css`: 제목 "데이터 동기화" + 켜기 스위치. 아래 `SyncNotice`, 종류별 `SyncKindRow` 4줄, [지금 올리기](5단계에서 동작, 지금은 숨김).
- 새 `SyncKindRow.tsx`: 이름 · 상태 글자(맞음·대기·선택 필요·오류·건너뜀) · 보조 문구("11/8 19:08 올림", 오류 문구, "파일을 읽지 못함").
- 새 `SyncNotice.tsx` (R32): 연결 안 됨 → [서버 연결 시작](openSetup), 로그인 필요 → 로그인 안내, 서버 업데이트 필요 → [서버 업데이트](openUpdate). 이때 스위치는 켤 수 없다.
- `SettingsPage.tsx`: `sections`에 `{ id: "sync", label: "데이터 동기화", component: SyncSection }`를 서버 연결 다음에.
- 상태는 이 구역에만 보인다. 제목 표시줄에는 아무것도 더하지 않는다 (R29).

## 확인할 결과
- `npm run build` 성공.
- 설정에 "데이터 동기화" 구역이 있고 처음엔 꺼져 있다. 꺼져 있는 동안 서버 `sync_documents`에 행이 생기지 않는다.
- 켜면 서버가 빈 종류는 올라가 "맞음 · 11/8 HH:mm 올림"으로 보이고, 대시보드에 행 4개가 생긴다(투데이 파일이 없으면 빈 데이터 행).
- 끄고 다시 켜면 이미 같은 내용이라 모두 "맞음"이고, 서버 rev는 그대로다.
- 끈 뒤에도 서버 행 4개와 로컬 파일은 그대로다.
- 로그아웃 상태에서는 "로그인이 필요합니다" 안내가 보이고 스위치를 켤 수 없다.
- 서버가 9번인 서버(업데이트 전)에 연결하면 "서버 업데이트 필요" 안내와 [서버 업데이트] 버튼이 보인다.

## 이 단계에서 만들거나 고칠 파일
- 새 `features/sync/useSync.ts`, `features/sync/SyncProvider.tsx`
- `App.tsx`, `pages/settings/SettingsPage.tsx`
- 새 `pages/settings/SyncSection.tsx`, `SyncSection.css`, `SyncKindRow.tsx`, `SyncNotice.tsx`
