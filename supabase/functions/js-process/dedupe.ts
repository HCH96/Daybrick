// js-process 중복 확인 (job-search R83–R89, D53–D57): 추출 뒤·2차 필터 전에 다른 사이트의 같은 공고와 묶는다.
// 판정은 `_shared/dedupe.ts`의 순수 함수(isSameJob·pickRep)만 쓰고, 여기서는 후보 읽기와 묶기(DB)만 한다.
// - checkDuplicate: 처리 중인 공고 하나를 기존 대표들과 비교해 묶는다 (queue 모드만, force·rescore는 건너뜀).
// - backfillDedupe: 서버 업데이트 뒤 한 번, 이미 모은 공고의 norm_key를 다시 계산하고 서로 묶는다 (R89, D56).
import { isSameJob, type JobLike, normalizeText, normKey, pickRep, type RepCandidate } from "../_shared/dedupe.ts";
import type { Context, PostingRow } from "./steps.ts";

/** 한 번에 읽는 행 수 (PostgREST 기본 최대 1000행) */
const PAGE = 1000;
/** 한 번에 고치는 norm_key 행 수 */
const UPSERT_CHUNK = 500;
/** 회사 앞글자로 좁힌 뒤에도 너무 많이 읽지 않게 */
const CANDIDATE_LIMIT = 500;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 추출 항목에서 판정에 쓰는 값: 직무와 마감일(YYYY-MM-DD) */
function jobFields(fields: unknown): { role: string | null; deadline: string | null } {
  const f = isRecord(fields) ? fields : {};
  const role = typeof f.role === "string" && f.role.trim() !== "" ? f.role : null;
  const d = isRecord(f.deadline) ? f.deadline.date : null;
  return { role, deadline: typeof d === "string" && d.trim() !== "" ? d.trim() : null };
}

/** 한국 시간 오늘 (YYYY-MM-DD) */
function todayKst(): string {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
}

/** 회사 앞 두 글자 (정리한 이름). 두 글자 미만이면 회사 일치가 될 수 없어 null (D55) */
function companyPrefix(company: string | null): string | null {
  const chars = [...(company ? normalizeText(company) : "")];
  return chars.length >= 2 ? chars[0] + chars[1] : null;
}

/** 임베드한 추출 행 (일대일이라 객체지만, 배열로 와도 받는다) */
function embeddedFields(value: unknown): unknown {
  if (Array.isArray(value)) return isRecord(value[0]) ? value[0].fields : null;
  return isRecord(value) ? value.fields : null;
}

async function ownSites(ctx: Context): Promise<Map<string, boolean> | null> {
  const res = await ctx.caller.admin.from("js_sites").select("id, own_site").eq("user_id", ctx.caller.userId);
  if (res.error) return null;
  return new Map((res.data ?? []).map((s) => [s.id as string, s.own_site === true]));
}

interface Member extends RepCandidate, JobLike {
  stage: string;
  hiddenAt: string | null;
}

/** 진 쪽 대표(lose)와 그 묶인 공고를 모두 이긴 쪽(win) 아래로 옮긴다. 숨김은 대표만 갖는다 (D57) */
async function bundleInto(ctx: Context, win: string, lose: string[]): Promise<boolean> {
  if (lose.length === 0) return true;
  const { admin } = ctx.caller;
  const children = await admin.from("js_postings").update({ dup_of: win })
    .eq("user_id", ctx.caller.userId).in("dup_of", lose);
  if (children.error) return false;
  const reps = await admin.from("js_postings")
    .update({ stage: "duplicate", dup_of: win, hidden_at: null, filtered_by: null })
    .eq("user_id", ctx.caller.userId).in("id", lose);
  return !reps.error;
}

export type DedupeResult = { bundled: false } | { bundled: true; stage: string };

/**
 * 중복 확인 (R83–R88): 후보 = 같은 사용자·다른 사이트·대표(dup_of null)·풀리지 않음·추출 있음·본인 아님·
 * 마감이 오늘(한국 시간) 이후이거나 없음. 걸러진·숨긴·지원한 공고도 후보다.
 * 일치하면 pickRep([p, 후보 대표])로 대표를 정한다.
 * - 후보가 대표: p(와 p에 묶여 있던 공고, 필터 다시 적용으로 다시 처리되는 경우)를 후보 아래로 옮긴다. p의 추출은 남겨 둔다.
 * - p가 대표: js_switch_rep(후보 → p)로 후보의 stage·추출·점수를 p에 복사한다 (다시 채점하지 않음, R87, D53).
 * 둘 다 지원했으면 묶지 않는다 (D57). 실패하면 null.
 */
export async function checkDuplicate(ctx: Context, p: PostingRow, fields: unknown): Promise<DedupeResult | null> {
  const { admin, userId } = ctx.caller;
  const self = await admin.from("js_postings").select("site_id, applied_at, unbundled, dup_of")
    .eq("user_id", userId).eq("id", p.id).maybeSingle();
  if (self.error) return null;
  // 풀린 공고·이미 묶인 공고는 판정하지 않는다 (D57)
  if (!self.data || self.data.unbundled === true || self.data.dup_of !== null) return { bundled: false };
  const siteId = (self.data.site_id as string | null) ?? "";
  const mine = jobFields(fields);
  const job: JobLike = { siteId, company: p.company, title: p.title, role: mine.role, deadline: mine.deadline };
  const prefix = companyPrefix(p.company);
  if (!prefix) return { bundled: false };

  let query = admin.from("js_postings")
    .select("id, site_id, company, title, stage, applied_at, collected_at, js_extractions!inner(fields)")
    .eq("user_id", userId).eq("unbundled", false).is("dup_of", null).neq("id", p.id).neq("stage", "duplicate")
    .ilike("company", `%${prefix.replace(/[\\%_*]/g, "\\$&")}%`)
    .limit(CANDIDATE_LIMIT);
  if (siteId !== "") query = query.neq("site_id", siteId);
  const rows = await query;
  if (rows.error) return null;

  const today = todayKst();
  const matches: Member[] = [];
  for (const row of rows.data ?? []) {
    const f = jobFields(embeddedFields((row as Record<string, unknown>).js_extractions));
    if (f.deadline !== null && f.deadline.slice(0, 10) < today) continue; // 마감이 지난 공고는 뺀다 (R83)
    const other: JobLike = {
      siteId: (row.site_id as string | null) ?? "",
      company: row.company as string | null,
      title: row.title as string | null,
      role: f.role,
      deadline: f.deadline,
    };
    if (!isSameJob(job, other)) continue;
    matches.push({
      ...other,
      id: row.id as string,
      applied: row.applied_at !== null,
      scored: false,
      ownSite: false,
      collectedAt: row.collected_at as string,
      stage: row.stage as string,
      hiddenAt: null,
    });
  }
  if (matches.length === 0) return { bundled: false };

  const own = await ownSites(ctx);
  if (!own) return null;
  for (const m of matches) m.ownSite = own.get(m.siteId) ?? false;
  // 여러 묶음이 걸리면 그중 하나(pickRep)와만 묶는다 (수집 단계 D60과 같은 규칙)
  const other = pickRep(matches)!;
  const me: Member = {
    ...job,
    id: p.id,
    applied: self.data.applied_at !== null,
    scored: false,
    ownSite: own.get(siteId) ?? false,
    collectedAt: p.collected_at,
    stage: p.stage,
    hiddenAt: null,
  };
  if (me.applied && other.applied) return { bundled: false };

  const rep = pickRep([me, other])!;
  if (rep.id === other.id) {
    return (await bundleInto(ctx, other.id, [p.id])) ? { bundled: true, stage: "duplicate" } : null;
  }
  // p가 대표: 후보 묶음은 지원하지 않은 것이다 (지원했으면 pickRep이 후보를 골랐다)
  const res = await admin.rpc("js_switch_rep", { p_user: userId, p_old: other.id, p_new: p.id });
  if (res.error) return null;
  return { bundled: true, stage: other.stage };
}

/** 표 전체를 PAGE씩 나눠 읽는다 */
async function readAll<T>(
  read: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: unknown }>,
): Promise<T[] | null> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const res = await read(from, from + PAGE - 1);
    if (res.error) return null;
    const rows = (res.data ?? []) as T[];
    out.push(...rows);
    if (rows.length < PAGE) return out;
  }
}

interface BackfillRow {
  id: string;
  site_id: string | null;
  company: string | null;
  title: string | null;
  norm_key: string | null;
  stage: string;
  applied_at: string | null;
  hidden_at: string | null;
  collected_at: string;
  unbundled: boolean;
  dup_of: string | null;
}

/** 대표 우선 순서로 줄 세우기 (pickRep 소급 규칙: 지원함 > 채점 있음 > 자사 > 먼저 수집) */
function repOrder(list: Member[]): Member[] {
  const rest = [...list];
  const out: Member[] = [];
  while (rest.length > 0) {
    const next = pickRep(rest, true)!;
    out.push(next);
    rest.splice(rest.indexOf(next), 1);
  }
  return out;
}

/**
 * 소급 적용 (R89, D56): ① 모든 공고의 norm_key를 새 정리 규칙으로 다시 저장 → ② 추출이 있는 대표 공고
 * (풀리지 않음)를 회사 앞 두 글자로 모아 isSameJob으로 묶음을 만든다. 대표 우선 순서대로 하나씩 보며
 * 기존 묶음의 대표와 같은 공고이고 그 묶음에 같은 사이트가 없으면 들어간다 (둘 다 지원했으면 들어가지 않음).
 * ③ 묶음마다 대표가 아닌 쪽과 그 묶인 공고를 대표 아래로 옮긴다. 숨긴 공고가 묶이면 대표에 숨김을 옮긴다(R88).
 * ④ dedupe_version = 1. deadlineAt(Date.now() 기준 시각)을 넘기면 멈추고 false (다음 실행이 처음부터, 같은 결과).
 */
export async function backfillDedupe(ctx: Context, deadlineAt: number): Promise<boolean> {
  const { admin, userId } = ctx.caller;
  const rows = await readAll<BackfillRow>((from, to) =>
    admin.from("js_postings")
      .select("id, site_id, company, title, norm_key, stage, applied_at, hidden_at, collected_at, unbundled, dup_of")
      .eq("user_id", userId).order("id").range(from, to)
  );
  if (!rows) return false;

  // ① norm_key 다시 계산 (바뀐 행만)
  const changed = rows.flatMap((r) => {
    const key = normKey(r.company, r.title);
    return key !== r.norm_key ? [{ id: r.id, user_id: userId, norm_key: key }] : [];
  });
  for (let i = 0; i < changed.length; i += UPSERT_CHUNK) {
    if (Date.now() > deadlineAt) return false;
    const res = await admin.from("js_postings").upsert(changed.slice(i, i + UPSERT_CHUNK), { onConflict: "id" });
    if (res.error) return false;
  }

  // ② 판정 재료: 추출(직무·마감일)과 채점 여부
  const extractions = await readAll<{ posting_id: string; fields: unknown }>((from, to) =>
    admin.from("js_extractions").select("posting_id, fields").eq("user_id", userId).order("posting_id").range(from, to)
  );
  const scores = await readAll<{ posting_id: string }>((from, to) =>
    admin.from("js_scores").select("posting_id").eq("user_id", userId).order("posting_id").range(from, to)
  );
  const own = await ownSites(ctx);
  if (!extractions || !scores || !own) return false;
  const fieldsOf = new Map(extractions.map((e) => [e.posting_id, e.fields]));
  const scored = new Set(scores.map((s) => s.posting_id));

  const buckets = new Map<string, Member[]>();
  for (const r of rows) {
    if (r.unbundled || r.dup_of !== null || r.stage === "duplicate" || !fieldsOf.has(r.id)) continue;
    const prefix = companyPrefix(r.company);
    if (!prefix) continue;
    const f = jobFields(fieldsOf.get(r.id));
    const siteId = r.site_id ?? "";
    const list = buckets.get(prefix) ?? [];
    list.push({
      id: r.id, siteId, company: r.company, title: r.title, role: f.role, deadline: f.deadline,
      applied: r.applied_at !== null, scored: scored.has(r.id), ownSite: own.get(siteId) ?? false,
      collectedAt: r.collected_at, stage: r.stage, hiddenAt: r.hidden_at,
    });
    buckets.set(prefix, list);
  }

  // ③ 묶음 만들기와 저장
  for (const list of buckets.values()) {
    if (list.length < 2) continue;
    const groups: { rep: Member; sites: Set<string>; others: Member[] }[] = [];
    for (const m of repOrder(list)) {
      const group = groups.find((g) =>
        !g.sites.has(m.siteId) && !(m.applied && g.rep.applied) && isSameJob(g.rep, m)
      );
      if (group) {
        group.others.push(m);
        group.sites.add(m.siteId);
      } else groups.push({ rep: m, sites: new Set([m.siteId]), others: [] });
    }
    for (const g of groups) {
      if (g.others.length === 0) continue;
      if (Date.now() > deadlineAt) return false;
      const hidden = g.others.find((o) => o.hiddenAt !== null)?.hiddenAt ?? null;
      if (g.rep.hiddenAt === null && !g.rep.applied && hidden !== null) {
        const res = await admin.from("js_postings").update({ hidden_at: hidden })
          .eq("user_id", userId).eq("id", g.rep.id);
        if (res.error) return false;
      }
      if (!(await bundleInto(ctx, g.rep.id, g.others.map((o) => o.id)))) return false;
    }
  }

  // ④ 끝 표시
  const done = await admin.from("js_settings").upsert({ user_id: userId, dedupe_version: 1 }, { onConflict: "user_id" });
  return !done.error;
}
