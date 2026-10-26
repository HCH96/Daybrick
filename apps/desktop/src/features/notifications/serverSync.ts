import type { SupabaseClient } from "@supabase/supabase-js";
import { READ_KEEP_DAYS } from "./logic";
import type { AppNotification, NotificationTarget, ServerNotificationRow } from "./types";

/**
 * 서버 알림 받기·정리·실시간 구독 (R30–R32, D11, D12).
 * 서버 행은 snake_case 열이라 앱의 AppNotification(`origin: "server"`)으로 바꿔서 넘긴다.
 */

const TABLE = "notifications";
const COLUMNS = "id,user_id,source,kind,importance,title,body,target,merge_key,created_at,updated_at,read_at";
const DAY_MS = 24 * 60 * 60 * 1000;

function toTarget(value: unknown): NotificationTarget | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const raw = value as Record<string, unknown>;
  if (typeof raw.page !== "string") return undefined;
  const target: NotificationTarget = { page: raw.page };
  if (typeof raw.tab === "string") target.tab = raw.tab;
  if (typeof raw.popup === "string") target.popup = raw.popup;
  return target;
}

/** 서버 행 하나를 앱 알림으로 바꾼다 */
export function rowToNotification(row: ServerNotificationRow): AppNotification {
  const notification: AppNotification = {
    id: row.id,
    origin: "server",
    source: row.source,
    kind: row.kind,
    importance: row.importance === "warning" ? "warning" : "info",
    title: row.title,
    body: row.body ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    readAt: row.read_at ?? null,
  };
  const target = toTarget(row.target);
  if (target) notification.target = target;
  if (row.merge_key) notification.mergeKey = row.merge_key;
  return notification;
}

/**
 * 확인한 지 30일이 지난 내 행을 먼저 지우고 (D11),
 * 안 읽은 행 전체와 확인한 지 30일 안의 행을 받아 온다 (R30). 받기에 실패하면 예외를 던진다.
 */
export async function fetchServerNotifications(client: SupabaseClient, now: Date = new Date()): Promise<AppNotification[]> {
  const cutoff = new Date(now.getTime() - READ_KEEP_DAYS * DAY_MS).toISOString();

  // RLS가 본인 행만 지우게 한다. 정리에 실패해도 받기는 계속한다.
  const { error: deleteError } = await client.from(TABLE).delete().lt("read_at", cutoff);
  if (deleteError) console.error("오래된 서버 알림 정리 실패", deleteError.message);

  const { data, error } = await client
    .from(TABLE)
    .select(COLUMNS)
    .or(`read_at.is.null,read_at.gte."${cutoff}"`)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as ServerNotificationRow[];
  return rows.map(rowToNotification);
}

/**
 * 내 알림 행의 추가·변경을 실시간으로 구독한다 (R31, D12).
 * 구독 상태가 SUBSCRIBED가 될 때마다(처음 연결·다시 연결) onSubscribed를 부른다.
 * 반환값은 구독 해제 함수.
 */
export function subscribeServerNotifications(
  client: SupabaseClient,
  userId: string,
  onChange: (notification: AppNotification) => void,
  onSubscribed: () => void,
): () => void {
  const filter = `user_id=eq.${userId}`;
  const channel = client
    .channel(`notifications:${userId}`)
    .on<ServerNotificationRow>("postgres_changes", { event: "INSERT", schema: "public", table: TABLE, filter }, (payload) => {
      onChange(rowToNotification(payload.new));
    })
    .on<ServerNotificationRow>("postgres_changes", { event: "UPDATE", schema: "public", table: TABLE, filter }, (payload) => {
      onChange(rowToNotification(payload.new));
    })
    .subscribe((status, err) => {
      if (status === "SUBSCRIBED") onSubscribed();
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.error("서버 알림 실시간 구독 문제", status, err?.message ?? "");
      }
    });

  return () => {
    void client.removeChannel(channel);
  };
}
