# 데이터 동기화: 파일 목록·데이터 모양·컴포넌트 구조
전체 구조가 필요할 때만 읽는다. 경로 기준은 [index.md](index.md) 맨 위.

## 1. 파일 목록 (새 파일은 "새")
### 서버·Rust
| 파일 | 하는 일 | 단계 |
|---|---|---|
| 새 `supabase/migrations/0010_data_sync.sql` | `sync_documents` 테이블, RLS 본인 행, anon 막기, `daybrick_sync_push` RPC | 1 |
| `src-tauri/src/server/migrations.rs` | 10번 추가 | 1 |
| 새 `src-tauri/src/sync.rs` | `load_sync_state`·`save_sync_state`, `write_sync_backup`, `open_sync_backup_dir`, `has_sync_backups`, `sync_device_name` | 2 |
| `src-tauri/src/lib.rs` | 위 명령 등록 | 2 |

### 기능 쪽 (작게 고침)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `features/{plan,calendar,applications,today}/storage.ts` | `loadXData` 안의 검사를 `parseXData(raw)`로 빼서 내보냄 (동작 같음) | 2 |
| `features/*/useAutoSave.ts` (4개) | 저장 성공 뒤 `notifySaved(kind)` | 5 |
| `features/*/store.tsx` (4개) | `useSyncReload(kind, reload)`로 다시 읽기 등록 (R23) | 6 |
| `App.tsx` | `SyncProvider`를 `ServerProvider` 안, 기능 Provider 바깥에 (D9) | 4 |
| `pages/settings/SettingsPage.tsx` | `sections`에 "데이터 동기화" | 4 |

### 새 동기화 (`features/sync/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| 새 `types.ts`, `syncFile.ts` | 상태 모양, sync.json 읽기·쓰기(깨졌으면 꺼진 기본값) | 2 |
| 새 `kinds.ts` | 종류 4개: 이름, 로컬 읽기(raw+parse), 쓰기, 빔 판정, 앱 파일 버전 | 3 |
| 새 `stableJson.ts` | 키 정렬 문자열 + SHA-256 해시 (D8) | 3 |
| 새 `compare.ts` | R18 표 판정 (순수 함수) | 3 |
| 새 `serverApi.ts` | `fetchDoc(kind)`, `pushDoc(kind, data, fileVersion, baseRev)` | 3 |
| 새 `useSync.ts`, `SyncProvider.tsx` | 컨텍스트, 켜기/끄기, 켤 때 비교, `notifySaved`·`useSyncReload` | 4 |
| 새 `useUploadQueue.ts`, `useCloseFlush.ts` | 5초 모으기, 대기 재시도, 충돌 시 멈춤, 창 닫을 때 한 번 | 5 |
| 새 `resolve.ts` | PC 남기기 / 서버 받기, 덮기 전 백업 | 6 |

### 새 화면 (`pages/settings/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| 새 `SyncSection.tsx`·`.css`, `SyncKindRow.tsx`, `SyncNotice.tsx` | 구역, 종류별 줄, 안내(R32) | 4 |
| 새 `SyncChoiceDialog.tsx` | R19 선택창 (Modal) | 6 |
| 새 `SyncAccountDialog.tsx` | 계정 다를 때 묻기 (ConfirmDialog) | 7 |

## 2. 데이터 모양
```sql
-- 서버 (0010)
sync_documents(user_id uuid, kind text, data jsonb, file_version int, rev bigint,
               updated_at timestamptz, device text, primary key (user_id, kind))
daybrick_sync_push(p_kind, p_data, p_file_version, p_base_rev bigint null, p_device)
  → { ok: true, rev, updated_at } | { ok: false, reason: 'conflict', rev, updated_at, device }
  -- p_base_rev null: 행이 없을 때만 넣음 / 아니면 rev = p_base_rev 일 때만 고침
```
```ts
type SyncKind = "plan" | "calendar" | "applications" | "today";
type KindState = "ok" | "pending" | "choice" | "error" | "skipped"; // 맞음·대기·선택 필요·오류·건너뜀
interface KindSync {
  rev: number | null;      // 마지막으로 맞춘 서버 rev
  hash: string | null;     // 그때 내용 해시 (D8)
  syncedAt: string | null; // 마지막으로 올린/맞춘 시각
  state: KindState;
  error: string | null;
}
interface SyncFile { version: 1; enabled: boolean; userId: string | null; kinds: Record<SyncKind, KindSync> }
// compare.ts
type Verdict = "upload" | "ask-pull" | "same" | "choose";
```

## 3. 컴포넌트 구조
```
ServerProvider
└ SyncProvider            sync.json·켜기 흐름·올리기 대기열·창 닫기
  ├ Applications/Plan/Calendar/TodayProvider
  │   ├ useAutoSave → notifySaved(kind)
  │   └ store → useSyncReload(kind, reload)
  └ 설정 화면
    └ SyncSection         [켜짐 ●], [지금 올리기], 백업 폴더 열기
      ├ SyncNotice        연결 안 됨·로그인 필요·서버 업데이트 필요
      ├ SyncKindRow × 4   상태·시각, [고르기], ⋯ › 서버에서 받아오기
      ├ SyncChoiceDialog  양쪽 수정 시각·기기, PC 남기기(추천)/서버 받기
      └ SyncAccountDialog
```

## 4. C++ 비유
- `SyncProvider`는 앱 전체에 하나뿐인 동기화 관리자 객체다. 기능 store는 관찰자(observer)로 "저장했다"를 알리고, 관리자는 등록받은 콜백(`reload`)을 불러 데이터를 바꿔 넣는다.
- `daybrick_sync_push`는 compare-and-swap이다. "rev가 내가 아는 값이면 바꾸고 +1"이라 다른 쪽이 먼저 고쳤으면 실패를 돌려받는다.
- `compare.ts`·`stableJson.ts`는 부작용 없는 순수 함수라 따로 실행해 확인할 수 있다.
