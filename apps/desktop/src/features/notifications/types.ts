/** 알림 중요도: 정보(회색 점) / 주의(주황 경고 아이콘) (R23) */
export type Importance = "info" | "warning";

/** 갈 곳: 페이지 id와 그 안의 탭·팝업 이름 (R25). 실제로 여는 일은 그 기능이 한다. */
export interface NotificationTarget {
  page: string;
  tab?: string;
  popup?: string;
}

/** 알림 하나. 로컬 id는 `local-` 접두어, 서버 id는 uuid. */
export interface AppNotification {
  id: string;
  origin: "local" | "server";
  /** 보낸 기능 (PageId 또는 그 밖의 이름) */
  source: string;
  kind: string;
  importance: Importance;
  title: string;
  body: string;
  target?: NotificationTarget;
  /** 같은 source·mergeKey의 안 읽은 알림은 하나로 합친다 (R24) */
  mergeKey?: string;
  createdAt: string;
  updatedAt: string;
  /** 확인한 시각. null이면 안 읽음 */
  readAt: string | null;
}

/** 서버에 아직 보내지 못한 확인/되돌림 기록 (8단계에서 씀) */
export interface PendingAck {
  id: string;
  readAt: string | null;
  at: string;
}

/** notifications.json 전체 (D8) */
export interface NotificationsFile {
  version: 1;
  local: AppNotification[];
  serverCopy: AppNotification[];
  pendingAcks: PendingAck[];
}

/** 서버 `notifications` 테이블 한 행 (열 이름은 snake_case, 0002_notifications.sql) */
export type ServerNotificationRow = {
  id: string;
  user_id: string;
  source: string;
  kind: string;
  importance: string;
  title: string;
  body: string;
  target: unknown;
  merge_key: string | null;
  created_at: string;
  updated_at: string;
  read_at: string | null;
};

/** notify()에 넘기는 값 (R22) */
export type NotifyInput = Pick<
  AppNotification,
  "source" | "kind" | "importance" | "title" | "body" | "target" | "mergeKey"
>;
