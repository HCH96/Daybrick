import type { ApiResult } from "../server/management";
import type { ServerSession } from "../server/session";
import { PAGE_SIZE, isRecord, postgrestError } from "./api";
import type { BundleSource } from "./types";

/** 중복 공고 묶음 읽기 (R91–R93, D54) */

/** 한 번에 넣는 id 수. `id.in`·`dup_of.in` 두 번 들어가 주소가 길어지므로 나눈다 (L25) */
const ID_CHUNK = 80;
const DELETED_SITE = "지운 사이트";

interface SourceRow {
  id: string;
  dupOf: string | null;
  url: string | null;
  siteName: string;
}

function siteName(value: unknown): string {
  const item: unknown = Array.isArray(value) ? value[0] : value;
  const name = isRecord(item) && typeof item.name === "string" ? item.name.trim() : "";
  return name !== "" ? name : DELETED_SITE;
}

function parseRow(row: unknown): SourceRow | null {
  if (!isRecord(row) || typeof row.id !== "string") return null;
  return {
    id: row.id,
    dupOf: typeof row.dup_of === "string" ? row.dup_of : null,
    url: typeof row.url === "string" && row.url.trim() !== "" ? row.url.trim() : null,
    siteName: siteName(row.js_sites),
  };
}

/** 대표 공고 id 목록의 묶음 출처를 읽는다. 묶인 공고가 없는 대표는 맵에 넣지 않는다 */
export async function loadBundleSources(
  session: ServerSession,
  repIds: string[],
): Promise<ApiResult<Map<string, BundleSource[]>>> {
  const ids = [...new Set(repIds)];
  const rows: SourceRow[] = [];
  for (let i = 0; i < ids.length; i += ID_CHUNK) {
    const chunk = ids.slice(i, i + ID_CHUNK).join(",");
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error, status } = await session.client
        .from("js_postings")
        .select("id, dup_of, url, collected_at, js_sites(name)")
        .or(`id.in.(${chunk}),dup_of.in.(${chunk})`)
        .order("collected_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      if (error) return { ok: false, error: postgrestError(error, status) };
      const page: unknown[] = data ?? [];
      for (const r of page) {
        const parsed = parseRow(r);
        if (!parsed) return { ok: false, error: "bad-response" };
        rows.push(parsed);
      }
      if (page.length < PAGE_SIZE) break;
    }
  }
  const wanted = new Set(ids);
  const reps = new Map<string, SourceRow>();
  const members = new Map<string, SourceRow[]>();
  for (const row of rows) {
    if (wanted.has(row.id)) reps.set(row.id, row);
    if (row.dupOf !== null && wanted.has(row.dupOf)) {
      const list = members.get(row.dupOf) ?? [];
      list.push(row);
      members.set(row.dupOf, list);
    }
  }
  const result = new Map<string, BundleSource[]>();
  for (const [repId, list] of members) {
    const rep = reps.get(repId);
    if (!rep) continue;
    result.set(repId, [
      { postingId: rep.id, siteName: rep.siteName, url: rep.url, isRep: true },
      ...list.map((m) => ({ postingId: m.id, siteName: m.siteName, url: m.url, isRep: false })),
    ]);
  }
  return { ok: true, value: result };
}

/** 묶음 풀기 (R93, D54·D58): rpc `js_unbundle`. 대표를 풀었으면 새 대표 id, 아니면 null */
export async function unbundlePosting(session: ServerSession, postingId: string): Promise<ApiResult<string | null>> {
  const { data, error, status } = await session.client.rpc("js_unbundle", { p_id: postingId });
  if (error) return { ok: false, error: postgrestError(error, status) };
  const value: unknown = data;
  return { ok: true, value: typeof value === "string" ? value : null };
}
