import type { StatusId } from "../applications/types";
import type { ApiResult } from "../server/management";
import type { ServerSession } from "../server/session";
import { isRecord, postgrestError } from "./api";

/** 지원 건 요약(`js_applications`, D1·R57)과 공고 `applied_at` 쓰기 (R57–R59) */

export interface NewServerApplication {
  postingId: string;
  company: string;
  domain: string | null;
  cardId: string;
  status: StatusId;
}

/** 지원 건을 만들고 그 id를 돌려준다 */
export async function createServerApplication(
  session: ServerSession,
  input: NewServerApplication,
): Promise<ApiResult<string>> {
  const { data, error, status } = await session.client
    .from("js_applications")
    .insert({
      posting_id: input.postingId,
      company: input.company,
      domain: input.domain,
      card_id: input.cardId,
      status: input.status,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: postgrestError(error, status) };
  const row: unknown = data;
  if (!isRecord(row) || typeof row.id !== "string") return { ok: false, error: "bad-response" };
  return { ok: true, value: row.id };
}

/** 지원한 공고는 추천·걸러진 공고·보관함에서 빠진다 (D38, D39) */
export async function markPostingApplied(session: ServerSession, postingId: string): Promise<ApiResult<null>> {
  const { error, status } = await session.client
    .from("js_postings")
    .update({ applied_at: new Date().toISOString() })
    .eq("id", postingId);
  if (error) return { ok: false, error: postgrestError(error, status) };
  return { ok: true, value: null };
}

/** 카드 상태를 지원 건에 반영한다. closed면 메일 확인 대상에서 빠진다 (R58, R59). 지원 건이 지워졌으면 아무것도 바꾸지 않는다 */
export async function updateServerApplication(
  session: ServerSession,
  serverId: string,
  change: { status: StatusId; closed: boolean },
): Promise<ApiResult<null>> {
  const { error, status } = await session.client
    .from("js_applications")
    .update({ status: change.status, closed: change.closed })
    .eq("id", serverId);
  if (error) return { ok: false, error: postgrestError(error, status) };
  return { ok: true, value: null };
}
