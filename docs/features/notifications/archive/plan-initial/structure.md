# 알림 계획: 파일 목록과 데이터 모양
전체 구조가 필요할 때만 읽는다.

## 1. 파일 목록
### Rust (`apps/desktop/src-tauri/src/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `notifications.rs` | `notifications.json` 읽기(없으면 None)·쓰기(임시 파일 바꿔치기). JSON은 문자열로 주고받음 | 1 |
| `lib.rs` | 명령 등록 | 1 |
| `server/migrations.rs` | `MIGRATIONS`에 2번 추가 | 6 |

### 서버 (저장소 `supabase/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `migrations/0002_notifications.sql` | `notifications` 테이블, 부분 고유 인덱스, RLS, `daybrick_notify(...)`, 실시간 발행 목록 추가 | 6 |

### 프론트 로직 (`features/notifications/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `types.ts` | 아래 2절의 타입 | 1 |
| `storage.ts` | Rust 명령 감싸기, 버전 확인, 깨진 파일이면 저장 막기 (Tauri 밖이면 메모리) | 1 |
| `logic.ts` | 순수 함수: `mergeNotification`, `pruneRead`, `countUnread`, `markRead`, `markUnread`, `markAllRead`, `sortForList` | 1 |
| `reducer.ts` | 상태 바꾸기 (로컬·서버 사본·대기 기록) | 1 (4·7·8에서 넓힘) |
| `NotificationsProvider.tsx`, `useNotifications.ts` | 상태·동작 공유, `notify` 받는 쪽 등록 | 1 (7에서 넓힘) |
| `useAutoSave.ts` | 디바운스 저장, 창 닫을 때 바로 저장 | 1 |
| `notify.ts` | 공용 보내기 함수와 대기 줄 | 1 |
| `devNotify.ts` | 개발 모드 전용 `window.daybrickNotify` | 1 |
| `sourceLabel.ts` | 보낸 기능 이름 (PAGE_LABELS 또는 "Daybrick") | 3 |
| `serverSync.ts` | 서버 알림 받기·정리, 실시간 구독, 확인 기록 쓰기 | 7, 8 |
| `useServerNotifications.ts` | 연결 상태에 따라 받기·구독·사본 저장·대기 기록 반영 | 7, 8 |
| `pendingAcks.ts` | 대기 기록 쌓기·합치기·반영 순서 | 8 |

### 화면
| 파일 | 단계 |
|---|---|
| `components/icons/TitleBarIcons.tsx` (`BellIcon`), `components/notifications/NotificationBell.tsx`(+css) | 2 |
| 수정: `components/layout/TitleBar.tsx`(+css), `styles/theme.css` (배지 색) | 2 |
| `components/notifications/NotificationPanel.tsx`(+css), `PanelHead.tsx`, `NotificationRow.tsx`(+css), `PanelEmpty.tsx`, `NotificationIcons.tsx` | 3 |
| 수정: `components/common/Popover.tsx`(+css, `bottom-end`), 새 `utils/relativeTime.ts` | 3 |
| `app/pageIntent.tsx` (`PageIntentProvider`, `openTarget`, `usePageIntent`) | 5 |
| 수정: `App.tsx` (1·5) | |

## 2. 데이터 모양
```ts
// notifications.json (앱 데이터 폴더)
interface NotificationsFile { version: 1; local: AppNotification[]; serverCopy: AppNotification[];
  pendingAcks: PendingAck[]; }
type Importance = "info" | "warning";
interface NotificationTarget { page: string; tab?: string; popup?: string }
interface AppNotification {
  id: string; origin: "local" | "server";
  source: string; kind: string; importance: Importance;
  title: string; body: string; target?: NotificationTarget; mergeKey?: string;
  createdAt: string; updatedAt: string; readAt: string | null;   // readAt 없음 = 안 읽음
}
interface PendingAck { id: string; readAt: string | null; at: string }
type NotifyInput = Pick<AppNotification, "source" | "kind" | "importance" | "title" | "body"
  | "target" | "mergeKey">;
```
- 서버 `notifications` 열: `id uuid`, `user_id`, `source`, `kind`, `importance`, `title`, `body`, `target jsonb`, `merge_key`, `created_at`, `updated_at`, `read_at`.
- RLS: 본인 행만 select·update·delete. insert는 `daybrick_notify`로만.

## 3. 컴포넌트 구조
```
App.tsx
└ ServerProvider
  └ NotificationsProvider
    └ PageIntentProvider
      ├ TitleBar
      │  └ NotificationBell → NotificationPanel (Popover bottom-end)
      │       ├ PanelHead  ├ NotificationRow ×N  └ PanelEmpty
      └ … 기존 화면
```

## 4. C++ 비유
- `notify()`는 전역 이벤트 버스에 메시지를 넣는 함수다. 받는 쪽(Provider)이 아직 등록되지 않았으면 큐에 쌓아 둔다.
- reducer는 상태 구조체를 받아 새 구조체를 돌려주는 순수 함수다. Provider는 그 구조체를 들고 있는 싱글턴 객체라고 보면 된다.
- `pendingAcks`는 서버에 보내지 못한 쓰기를 모아 둔 재시도 큐다. 연결되면 앞에서부터 꺼내 보낸다.
