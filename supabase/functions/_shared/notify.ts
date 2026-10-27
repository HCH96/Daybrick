// 서버 함수 공용: 알림 센터에 알림 보내기 (job-search D8, R80).
// `daybrick_notify`(notifications 서버 구조 2번)를 서비스 역할로 부른다. 알림 연결은 15단계에서 모두 한다.
import type { Caller } from "./auth.ts";

/** 구직 관리 화면의 탭 (앱 pages/job-search/tabs.ts의 id와 같다) */
export type NoticeTab = "recommend" | "sources" | "mail" | "settings";

export interface Notice {
  kind: string;
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
  return !error;
}
