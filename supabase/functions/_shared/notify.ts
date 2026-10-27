// 서버 함수 공용: 알림 센터에 알림 보내기 (job-search D8, R80).
// `daybrick_notify`(notifications 서버 구조 2번)를 서비스 역할로 부른다. 앱은 켤 때·실행 중에 받아 온다.
// 갈 곳은 `{ page: "job-search", tab }`이고 앱 JobSearchPage의 usePageIntent가 탭을 연다 (R81).
import type { Caller } from "./auth.ts";

/** 구직 관리 화면의 탭 (앱 pages/job-search/tabs.ts의 id와 같다) */
export type NoticeTab = "recommend" | "sources" | "mail" | "settings";

/** 알림 종류 (notifications.kind). 같은 기간에 한 번만 보내는 알림은 종류로 구분한다 */
export type NoticeKind =
  | "collect-fail"
  | "new-recommend"
  | "mail-suggest"
  | "limit-near"
  | "limit-over"
  | "credit"
  | "gmail-broken";

export interface Notice {
  kind: NoticeKind;
  importance: "info" | "warning";
  title: string;
  body?: string;
  tab: NoticeTab;
  /** 같은 키의 안 읽은 알림은 하나로 합쳐 갱신된다. 없으면 매번 새 알림 */
  mergeKey?: string;
}

/** 합치기 키 (15단계 표) */
export const noticeKeys = {
  collectFail: (siteId: string) => `js-collect-fail:${siteId}`,
  mail: () => "js-mail",
  limit: (which: "day" | "month") => `js-limit:${which}`,
  credit: () => "js-credit",
  gmailBroken: () => "js-gmail-broken",
};

/** 알림 하나를 보낸다. 실패해도 본 작업을 멈추지 않도록 성공 여부만 돌려준다 */
export async function sendNotice(caller: Caller, notice: Notice): Promise<boolean> {
  const { error } = await caller.admin.rpc("daybrick_notify", {
    p_source: "job-search",
    p_kind: notice.kind,
    p_importance: notice.importance,
    p_title: notice.title,
    p_body: notice.body ?? "",
    p_target: { page: "job-search", tab: notice.tab },
    p_merge_key: notice.mergeKey ?? null,
    p_user_id: caller.userId,
  });
  if (error) console.error("알림 보내기 실패", notice.kind);
  return !error;
}

/**
 * `since`(ISO 시각) 뒤에 같은 제목·같은 합치기 키 알림을 이미 보냈으면 다시 보내지 않는다 (읽었어도 건너뜀).
 * 예약 실행이 15분마다 같은 한도·크레딧 상황을 만나도 하루(또는 한 달)에 한 번만 알리기 위해 쓴다.
 * 종류가 아닌 제목으로 보는 까닭: 80% 알림을 안 읽은 채 초과 알림이 오면 같은 키라 한 행으로 합쳐져
 * 제목만 바뀌고 종류는 처음 것(limit-near)으로 남는다.
 */
export async function sendNoticeOnce(caller: Caller, notice: Notice, since: string): Promise<boolean> {
  let query = caller.admin
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", caller.userId)
    .eq("source", "job-search")
    .eq("title", notice.title)
    .gte("updated_at", since);
  query = notice.mergeKey ? query.eq("merge_key", notice.mergeKey) : query.is("merge_key", null);
  const { count, error } = await query;
  if (error) return false;
  if ((count ?? 0) > 0) return true;
  return await sendNotice(caller, notice);
}

/** 이 종류 알림을 마지막으로 보낸 시각 (ISO). 없으면 null */
export async function lastNoticeAt(caller: Caller, kind: NoticeKind): Promise<string | null | undefined> {
  const { data, error } = await caller.admin
    .from("notifications")
    .select("created_at")
    .eq("user_id", caller.userId)
    .eq("source", "job-search")
    .eq("kind", kind)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) return undefined;
  return (data?.[0]?.created_at as string | undefined) ?? null;
}
