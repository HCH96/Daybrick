// js-collect: 사이트 어댑터 규칙으로 공고를 모은다 (job-search R25, R33, R35–R40, D30).
// 게이트웨이 JWT 확인을 끄고 배포하고, 호출자는 getCaller(사용자 토큰 또는 예약 비밀값)로 확인한다.
// 서비스 역할로 쓰되 항상 호출자 user_id로 거른다. AI는 부르지 않는다.
// 요청: { action: "run", siteId? } — siteId가 없으면 켜진 사이트 전체, 있으면 그 사이트 하나(꺼져 있어도).
// 순서: 사이트마다 목록 읽기 → 새 공고만 넣기(stage new, body_text null) → 남은 시간 안에 원문 받기.
// 같은 사이트 재등록(기존 공고가 목록에서 내려가고 같은 회사·정리 제목으로 다시 올라옴)은 먼저 묶는다 (R111–R112, D76).
// 다른 사이트의 같은 공고(norm_key)는 그 묶음 대표에 stage duplicate·dup_of로 넣고 원문을 받지 않는다 (R82, D54).
// 실패한 사이트는 "수집 실패" 알림을 보낸다 (R36, 사이트별 합치기 키).
// 원문을 못 받은 공고(body_text null)는 다음 실행이 이어 받는다 (R39: 받은 원문은 다시 받지 않는다).
//       { action: "bodies" } — 원문만 이어 받기 (예약 실행이 원문 없는 공고가 있을 때 부른다).
//       { action: "test", rule, vars } — 시험 수집 (R29, R32, test.ts): 저장하지 않는다.
// 응답: { ok: true, sites: [{ siteId, name, ok, read, added, bundled, reason? }], pending, failed: [{ site, extId, reason }] }
//       또는 { ok: false, reason }. failed는 이번에 원문 받기에 실패한 공고 (최대 20건).
//       added는 새 대표·단독 공고 수, bundled는 다른 사이트 공고나 같은 사이트 재등록으로 묶인 수.
import {
  type AdapterRule,
  judgeList,
  type ListItem,
  missingVars,
  readBodyHtml,
  readDetail,
  readList,
  sleep,
  stringVars,
  validateRule,
} from "../_shared/adapter.ts";
import { type Caller, getCaller } from "../_shared/auth.ts";
import { handleOptions, json } from "../_shared/cors.ts";
import { extId, isRelisted, normKey, pickRep, type RepCandidate } from "../_shared/dedupe.ts";
import { noticeKeys, sendNotice } from "../_shared/notify.ts";
import { testRule } from "./test.ts";

const BUCKET = "job-search";
/** 함수 시간 한도(무료 150초)보다 넉넉히 일찍 멈춘다 */
const BUDGET_MS = 110_000;
/** 본문 글이 이보다 짧으면 이미지 본문으로 보고 이미지를 저장한다 (R38) */
const IMAGE_BODY_MAX_TEXT = 200;
const MAX_IMAGES = 10;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const QUERY_CHUNK = 40;

interface SiteRow {
  id: string;
  name: string;
  vars: Record<string, unknown> | null;
  own_site?: boolean;
  adapter: { rule: unknown } | null;
}

interface SiteRun {
  siteId: string;
  name: string;
  ok: boolean;
  read: number;
  added: number;
  bundled: number;
  reason?: string;
}

interface Target {
  site: SiteRow;
  rule: AdapterRule;
  vars: Record<string, string>;
}

/**
 * in() 조건 하나에 넣을 값의 주소 바이트 상한. 요청 주소가 8KB를 넘으면 게이트웨이가 연결을 끊는다
 * (사용자 테스트 r1 4번: 넥슨 한글 키 40개 = 8,198바이트에서 실패, L25). 나머지 주소 부분을 위해 넉넉히 둔다.
 */
const QUERY_MAX_BYTES = 4_000;

/** in() 조회용으로 값을 나눈다: 묶음마다 최대 QUERY_CHUNK개, 주소 바이트 QUERY_MAX_BYTES 이하 */
function chunks(values: string[]): string[][] {
  const out: string[][] = [];
  let part: string[] = [];
  let bytes = 0;
  for (const value of values) {
    // 값 하나 + 구분 쉼표(%2C)의 주소 바이트. 따옴표로 감싸일 수 있어 여유를 더한다
    const size = encodeURIComponent(value).length + 9;
    if (part.length > 0 && (part.length >= QUERY_CHUNK || bytes + size > QUERY_MAX_BYTES)) {
      out.push(part);
      part = [];
      bytes = 0;
    }
    part.push(value);
    bytes += size;
  }
  if (part.length > 0) out.push(part);
  return out;
}

interface DbResult {
  status: number;
  error: { message?: string; code?: string; details?: string | null; hint?: string | null } | null;
}

/** 값 목록을 in() 조건으로 넣을 때 주소에서 차지하는 대략의 바이트 수 (주소 길이 한도 확인용) */
function inParamBytes(values: string[]): number {
  return encodeURIComponent(`in.(${values.join(",")})`).length;
}

/**
 * saveNew의 DB 실패를 로그로 남기고 던질 오류를 만든다 (사용자 테스트 r1 4번: 넥슨 "공고를 저장하지 못함" 원인 확인용).
 * 상태 코드·오류 코드·메시지(300자)·단계·사이트·개수만 남긴다. 공고 제목 같은 값은 남기지 않는다.
 */
function dbFail(step: string, siteId: string, res: DbResult, extra: Record<string, number> = {}): Error {
  const e = res.error;
  const info = Object.entries(extra).map(([k, v]) => ` ${k}=${v}`).join("");
  console.error(
    `js-collect 저장 실패: step=${step} site=${siteId} status=${res.status} code=${e?.code ?? "(없음)"}` +
      `${info} message=${(e?.message ?? "(없음)").slice(0, 300)}` +
      ` details=${(e?.details ?? "(없음)").slice(0, 300)} hint=${(e?.hint ?? "(없음)").slice(0, 200)}`,
  );
  return new Error("database");
}

interface SaveResult {
  /** 새 대표·단독 공고 수 */
  added: number;
  /** 다른 사이트 공고에 묶이거나(R82) 같은 사이트 재등록으로 묶인(R111) 수 */
  bundled: number;
}

interface Candidate {
  item: ListItem;
  ext: string;
  key: string | null;
}

/** 묶음 대표 후보 (pickRep 입력) */
interface RepRow extends RepCandidate {
  siteId: string | null;
}

/**
 * 다른 사이트에서 같은 norm_key를 가진 공고의 묶음 대표를 찾는다 (R35, R82, D57).
 * 풀린 공고(unbundled)는 후보에서 빼고, 대표와 묶인 공고 모두로 찾아 대표(dup_of ?? id)로 올린다.
 * 돌려주는 값: norm_key → 대표 (여러 묶음이 걸리면 pickRep으로 하나)
 */
async function findReps(caller: Caller, siteId: string, keys: string[]): Promise<Map<string, RepRow>> {
  const repIdsByKey = new Map<string, Set<string>>();
  for (const part of chunks(keys)) {
    const found = await caller.admin.from("js_postings").select("id, site_id, norm_key, dup_of")
      .eq("user_id", caller.userId).eq("unbundled", false).in("norm_key", part);
    if (found.error) throw dbFail("norm-key-lookup", siteId, found, { count: part.length, inBytes: inParamBytes(part) });
    for (const row of found.data ?? []) {
      if (row.site_id === siteId) continue; // 같은 사이트는 ext_id로만 판정한다
      const key = row.norm_key as string;
      const set = repIdsByKey.get(key) ?? new Set<string>();
      set.add((row.dup_of as string | null) ?? (row.id as string));
      repIdsByKey.set(key, set);
    }
  }
  const repIds = [...new Set([...repIdsByKey.values()].flatMap((s) => [...s]))];
  if (repIds.length === 0) return new Map();

  const sites = await caller.admin.from("js_sites").select("id, own_site").eq("user_id", caller.userId);
  if (sites.error) throw dbFail("site-lookup", siteId, sites);
  const own = new Map((sites.data ?? []).map((s) => [s.id as string, s.own_site === true]));

  const reps = new Map<string, RepRow>();
  for (const part of chunks(repIds)) {
    const found = await caller.admin.from("js_postings").select("id, site_id, applied_at, collected_at")
      .eq("user_id", caller.userId).in("id", part);
    if (found.error) throw dbFail("rep-lookup", siteId, found, { count: part.length });
    for (const row of found.data ?? []) {
      const rowSite = row.site_id as string | null;
      reps.set(row.id as string, {
        id: row.id as string,
        siteId: rowSite,
        applied: row.applied_at !== null,
        scored: false,
        ownSite: rowSite ? own.get(rowSite) ?? false : false,
        collectedAt: row.collected_at as string,
      });
    }
  }
  const out = new Map<string, RepRow>();
  for (const [key, ids] of repIdsByKey) {
    const rep = pickRep([...ids].flatMap((id) => reps.get(id) ?? []));
    if (rep) out.set(key, rep);
  }
  return out;
}

/** 재등록 처리 방법 (D76): 대표 아래 duplicate로 넣기, 또는 새 공고를 넣은 뒤 대표를 새 공고로 바꾸기 */
type RelistPlan =
  | { kind: "under"; repId: string }
  | { kind: "switch"; oldId: string };

/**
 * 같은 사이트 재등록을 찾는다 (R111, R112, D66, D76). 이번 목록에 없는 같은 사이트·같은 norm_key·풀리지 않은 공고와
 * isRelisted로 비교한다. 애매하면 묶지 않는다(D53): 같은 키의 새 공고가 둘 이상이거나, 걸린 기존 공고가 여러 묶음이면 건너뛴다.
 * - 걸린 기존 공고에 묶음 대표가 없고 묶인 공고만 걸림 → 그 대표 아래 duplicate
 * - 대표가 걸렸고 지원한 공고 → 대표 아래 duplicate (D57: 지원한 묶음은 대표를 바꾸지 않음)
 * - 그 밖 → 새 공고를 대표로 (js_switch_rep)
 * 돌려주는 값: 새 공고 ext_id → 처리 방법
 */
async function findRelists(
  caller: Caller,
  siteId: string,
  candidates: Map<string, Candidate>,
  listed: ReadonlySet<string>,
): Promise<Map<string, RelistPlan>> {
  const byKey = new Map<string, Candidate[]>();
  for (const c of candidates.values()) {
    if (!c.key) continue;
    byKey.set(c.key, [...(byKey.get(c.key) ?? []), c]);
  }
  const keys = [...byKey].filter(([, list]) => list.length === 1).map(([key]) => key);
  const plans = new Map<string, RelistPlan>();
  if (keys.length === 0) return plans;

  interface OldRow { id: string; ext: string; company: string | null; title: string | null; dupOf: string | null; applied: boolean }
  const oldByKey = new Map<string, OldRow[]>();
  for (const part of chunks(keys)) {
    const found = await caller.admin.from("js_postings")
      .select("id, ext_id, company, title, norm_key, dup_of, applied_at")
      .eq("user_id", caller.userId).eq("site_id", siteId).eq("unbundled", false).in("norm_key", part);
    if (found.error) throw dbFail("relist-lookup", siteId, found, { count: part.length, inBytes: inParamBytes(part) });
    for (const row of found.data ?? []) {
      const key = row.norm_key as string;
      oldByKey.set(key, [...(oldByKey.get(key) ?? []), {
        id: row.id as string,
        ext: row.ext_id as string,
        company: row.company as string | null,
        title: row.title as string | null,
        dupOf: row.dup_of as string | null,
        applied: row.applied_at !== null,
      }]);
    }
  }

  for (const key of keys) {
    const c = byKey.get(key)![0];
    const newJob = { siteId, extId: c.ext, company: c.item.company, title: c.item.title };
    const matched = (oldByKey.get(key) ?? [])
      .filter((o) => isRelisted(newJob, { siteId, extId: o.ext, company: o.company, title: o.title }, listed));
    if (matched.length === 0) continue;
    const groups = new Set(matched.map((o) => o.dupOf ?? o.id));
    if (groups.size !== 1) continue;
    const repId = [...groups][0];
    const rep = matched.find((o) => o.dupOf === null);
    if (!rep || rep.applied) plans.set(c.ext, { kind: "under", repId });
    else plans.set(c.ext, { kind: "switch", oldId: rep.id });
  }
  return plans;
}

/**
 * 새 공고를 넣는다 (R35, R82, R86–R88, R111–R112). 목록이 준 본문은 listBodies(사이트|ext_id → HTML)에 모은다.
 * 먼저 같은 사이트 재등록(findRelists)을 묶고, 묶인 공고는 다른 사이트 판정을 하지 않는다 (D76).
 * 다른 사이트의 같은 공고가 있으면 버리지 않고 그 묶음 대표에 duplicate로 넣는다 (원문·AI 처리 없음).
 * 대표가 자사 사이트가 아니고 이 사이트가 자사이며 대표를 지원하지 않았으면 새 공고로 대표를 바꾼다 (R87, D54, D57).
 * judgeList를 통과한 목록에서만 부른다 (목록이 온전해야 "목록에 없음"을 믿을 수 있다).
 */
async function saveNew(
  caller: Caller,
  site: SiteRow,
  items: ListItem[],
  listBodies: Map<string, string>,
): Promise<SaveResult> {
  const siteId = site.id;
  const listed = new Set<string>();
  const candidates = new Map<string, Candidate>();
  for (const item of items) {
    const ext = extId(item.id, item.link);
    if (ext) listed.add(ext);
    if (!item.title || !item.link) continue;
    if (!ext || candidates.has(ext)) continue;
    candidates.set(ext, { item, ext, key: normKey(item.company, item.title) });
  }
  const exts = [...candidates.keys()];
  for (const part of chunks(exts)) {
    const found = await caller.admin.from("js_postings").select("ext_id")
      .eq("user_id", caller.userId).eq("site_id", siteId).in("ext_id", part);
    if (found.error) throw dbFail("ext-lookup", siteId, found, { count: part.length, inBytes: inParamBytes(part) });
    // 이미 있는데 원문이 비어 있는 공고는 이번 목록의 본문을 챙긴다 (상세가 막힌 사이트에서 다시 채우려고, D90)
    const noBody = await caller.admin.from("js_postings").select("ext_id")
      .eq("user_id", caller.userId).eq("site_id", siteId).in("ext_id", part)
      .is("body_text", null).neq("stage", "duplicate");
    if (noBody.error) throw dbFail("ext-lookup", siteId, noBody, { count: part.length, inBytes: inParamBytes(part) });
    for (const row of noBody.data ?? []) {
      const body = candidates.get(row.ext_id as string)?.item.body;
      if (body) listBodies.set(`${siteId}|${row.ext_id}`, body);
    }
    for (const row of found.data ?? []) candidates.delete(row.ext_id as string);
  }
  if (candidates.size === 0) return { added: 0, bundled: 0 };

  const row = ({ item, ext, key }: Candidate, dupOf: string | null) => {
    if (item.body) listBodies.set(`${siteId}|${ext}`, item.body);
    return {
      user_id: caller.userId, site_id: siteId, ext_id: ext, url: item.link, company: item.company,
      title: item.title, duty: item.duty, norm_key: key,
      stage: dupOf ? "duplicate" : "new", dup_of: dupOf,
    };
  };

  // R111–R112: 같은 사이트 재등록 묶기 (다른 사이트 판정보다 먼저). 묶인 수는 bundled로만 센다
  let relisted = 0;
  const relists = await findRelists(caller, siteId, candidates, listed);
  if (relists.size > 0) {
    const under: ReturnType<typeof row>[] = [];
    const fresh: ReturnType<typeof row>[] = [];
    for (const [ext, plan] of relists) {
      const c = candidates.get(ext)!;
      if (plan.kind === "under") under.push(row(c, plan.repId));
      else fresh.push(row(c, null));
    }
    if (under.length > 0) {
      const saved = await caller.admin.from("js_postings")
        .upsert(under, { onConflict: "user_id,site_id,ext_id", ignoreDuplicates: true }).select("id");
      if (saved.error) throw dbFail("insert-relist", siteId, saved, { rows: under.length });
      relisted += saved.data?.length ?? 0;
    }
    if (fresh.length > 0) {
      const saved = await caller.admin.from("js_postings")
        .upsert(fresh, { onConflict: "user_id,site_id,ext_id", ignoreDuplicates: true }).select("id, ext_id");
      if (saved.error) throw dbFail("insert-relist", siteId, saved, { rows: fresh.length });
      // 새 공고가 대표가 되고 기존 공고의 단계·숨김·추출·점수를 복사한다 (R112, D54). 원문은 fetchBodies가 받는다
      for (const p of saved.data ?? []) {
        const plan = relists.get(p.ext_id as string);
        if (plan?.kind !== "switch") continue;
        const res = await caller.admin.rpc("js_switch_rep", { p_user: caller.userId, p_old: plan.oldId, p_new: p.id });
        if (res.error) throw dbFail("switch-rep-relist", siteId, res);
        relisted++;
      }
    }
    for (const ext of relists.keys()) candidates.delete(ext);
    if (candidates.size === 0) return { added: 0, bundled: relisted };
  }

  const keys = [...new Set([...candidates.values()].flatMap((c) => (c.key ? [c.key] : [])))];
  const reps = await findReps(caller, siteId, keys);

  const alone = [...candidates.values()].filter((c) => !c.key || !reps.has(c.key)).map((c) => row(c, null));
  const bundledRows = [...candidates.values()]
    .flatMap((c) => (c.key && reps.has(c.key) ? [row(c, reps.get(c.key)!.id)] : []));

  let added = 0;
  if (alone.length > 0) {
    const saved = await caller.admin.from("js_postings")
      .upsert(alone, { onConflict: "user_id,site_id,ext_id", ignoreDuplicates: true }).select("id");
    if (saved.error) throw dbFail("insert", siteId, saved, { rows: alone.length });
    added = saved.data?.length ?? 0;
  }
  if (bundledRows.length === 0) return { added, bundled: relisted };

  const saved = await caller.admin.from("js_postings")
    .upsert(bundledRows, { onConflict: "user_id,site_id,ext_id", ignoreDuplicates: true }).select("id, dup_of");
  if (saved.error) throw dbFail("insert-duplicate", siteId, saved, { rows: bundledRows.length });
  let bundled = relisted + (saved.data?.length ?? 0);

  // R87: 자사 공고가 들어오면 대표를 바꾼다. 같은 대표에 여러 개가 묶였으면 처음 것 하나만 대표가 되고,
  // 나머지는 js_switch_rep이 새 대표 아래로 옮긴다. 새 대표는 body_text가 null이라 fetchBodies가 원문만 받는다.
  if (site.own_site !== true) return { added, bundled };
  const byId = new Map([...reps.values()].map((r) => [r.id, r]));
  const switched = new Set<string>();
  for (const p of saved.data ?? []) {
    const oldId = p.dup_of as string;
    const rep = byId.get(oldId);
    if (!rep || switched.has(oldId) || rep.ownSite || rep.applied) continue;
    const res = await caller.admin.rpc("js_switch_rep", { p_user: caller.userId, p_old: oldId, p_new: p.id });
    if (res.error) throw dbFail("switch-rep", siteId, res);
    switched.add(oldId);
    added++;
    bundled--;
  }
  return { added, bundled };
}

function extOf(contentType: string): string | null {
  const type = contentType.split(";")[0].trim().toLowerCase();
  const map: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp" };
  return map[type] ?? null;
}

/** 이미지 본문을 비공개 저장소에 넣는다 (R38). 넣은 경로 목록 */
async function storeImages(caller: Caller, postingId: string, urls: string[]): Promise<string[]> {
  const paths: string[] = [];
  for (const url of urls.slice(0, MAX_IMAGES)) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
      const ext = extOf(res.headers.get("content-type") ?? "");
      if (!res.ok || !ext) continue;
      const bytes = new Uint8Array(await res.arrayBuffer());
      if (bytes.byteLength > MAX_IMAGE_BYTES) continue;
      const path = `${caller.userId}/postings/${postingId}/${paths.length + 1}.${ext}`;
      const up = await caller.admin.storage.from(BUCKET)
        .upload(path, bytes, { contentType: `image/${ext === "jpg" ? "jpeg" : ext}`, upsert: true });
      if (!up.error) paths.push(path);
    } catch {
      // 받지 못한 이미지는 건너뛴다
    }
  }
  return paths;
}

/** 원문 받기 실패 한 건 (응답·함수 로그로 원인을 보려고 남긴다, D89) */
interface BodyFailure {
  site: string;
  extId: string;
  reason: string;
}
/** 응답에 싣는 실패 건수 상한 */
const MAX_FAILURES = 20;

/**
 * 원문이 없는 공고(body_text null, 묶인 duplicate 제외)의 원문을 남은 시간 안에 받는다.
 * 남은 공고 수와 실패 목록(최대 20건)을 돌려준다. 실패는 함수 로그에도 남긴다.
 */
async function fetchBodies(
  caller: Caller,
  targets: Target[],
  listBodies: Map<string, string>,
  deadline: number,
): Promise<{ pending: number; failed: BodyFailure[] }> {
  const bySite = new Map(targets.map((t) => [t.site.id, t]));
  const rows = await caller.admin.from("js_postings").select("id, site_id, ext_id, url")
    .eq("user_id", caller.userId).in("site_id", [...bySite.keys()]).is("body_text", null)
    .neq("stage", "duplicate") // R82: 묶인 공고는 원문을 받지 않는다
    .order("collected_at", { ascending: false }).limit(300);
  if (rows.error) throw new Error("database");
  // 목록이 준 본문이 있는 공고를 먼저 저장한다. 요청이 없어 빠르고, 시간이 모자라 버려지면 상세가 막힌 사이트는 다시 못 받는다 (D90)
  const hasListed = (p: { site_id: unknown; ext_id: unknown }) => listBodies.has(`${p.site_id}|${p.ext_id}`);
  const postings = [...(rows.data ?? [])].sort((a, b) => Number(hasListed(b)) - Number(hasListed(a)));
  const lastRequest = new Map<string, number>();
  let done = 0;
  const failed: BodyFailure[] = [];
  const fail = (site: string, extId: string, reason: string) => {
    console.warn(`js-collect: 원문 받기 실패 (${site} ${extId}): ${reason}`);
    if (failed.length < MAX_FAILURES) failed.push({ site, extId, reason });
  };
  for (const p of postings) {
    if (Date.now() > deadline) break;
    const target = bySite.get(p.site_id as string);
    if (!target) continue;
    const link = (p.url as string | null) ?? "";
    const listed = listBodies.get(`${p.site_id}|${p.ext_id}`);
    let detail;
    if (listed !== undefined) {
      detail = readBodyHtml(listed, target.rule.detail?.images ?? "img", link);
    } else {
      const wait = (lastRequest.get(target.site.id) ?? 0) + target.rule.delayMs - Date.now();
      if (wait > 0) await sleep(wait); // R37: 같은 사이트 요청 사이 간격
      const res = await readDetail(target.rule, { ...target.vars, id: p.ext_id as string, link });
      lastRequest.set(target.site.id, Date.now());
      if (!res.ok) {
        fail(target.site.name, p.ext_id as string, res.reason); // 다음 실행이 다시 받는다
        continue;
      }
      detail = res.detail;
    }
    const imagePaths = detail.text.length < IMAGE_BODY_MAX_TEXT && detail.images.length > 0
      ? await storeImages(caller, p.id as string, detail.images)
      : [];
    const saved = await caller.admin.from("js_postings")
      .update({ body_text: detail.text, image_paths: imagePaths }).eq("id", p.id).eq("user_id", caller.userId);
    if (saved.error) fail(target.site.name, p.ext_id as string, `저장 실패: ${saved.error.message}`);
    else done++;
  }
  return { pending: postings.length - done, failed };
}

async function record(caller: Caller, run: SiteRun) {
  const at = new Date().toISOString();
  await caller.admin.from("js_collect_runs").insert({
    user_id: caller.userId, site_id: run.siteId, at, count: run.added, ok: run.ok, reason: run.reason ?? null,
  });
  await caller.admin.from("js_sites").update({
    last_result: { ok: run.ok, read: run.read, added: run.added, reason: run.reason ?? null },
    last_at: at,
  }).eq("id", run.siteId).eq("user_id", caller.userId);
}

/** 수집 실패 알림 (R36): 사이트마다 합치기 키가 있어 다시 실패하면 같은 알림이 갱신된다 */
async function noticeFail(caller: Caller, run: SiteRun) {
  await sendNotice(caller, {
    kind: "collect-fail",
    importance: "warning",
    title: `수집 실패: ${run.name}`,
    body: run.reason ?? "",
    tab: "sources",
    mergeKey: noticeKeys.collectFail(run.siteId),
  });
}

/** 원문만 이어 받기 (예약 실행): 목록은 다시 읽지 않고, 켜진 사이트의 원문 없는 공고만 받는다 */
async function bodiesOnly(caller: Caller): Promise<Response> {
  const deadline = Date.now() + BUDGET_MS;
  const sites = await caller.admin.from("js_sites").select("id, name, vars, adapter:js_adapters(rule)")
    .eq("user_id", caller.userId).eq("enabled", true);
  if (sites.error) return json({ ok: false, reason: "database" });
  const targets: Target[] = [];
  for (const site of (sites.data ?? []) as unknown as SiteRow[]) {
    const checked = site.adapter ? validateRule(site.adapter.rule) : null;
    const vars = stringVars(site.vars);
    if (checked?.ok && missingVars(checked.rule, vars).length === 0) targets.push({ site, rule: checked.rule, vars });
  }
  if (targets.length === 0) return json({ ok: false, reason: "no-sites" });
  try {
    const { pending, failed } = await fetchBodies(caller, targets, new Map(), deadline);
    return json({ ok: true, sites: [], pending, failed });
  } catch {
    return json({ ok: false, reason: "database" });
  }
}

async function run(caller: Caller, siteId: string | null): Promise<Response> {
  const deadline = Date.now() + BUDGET_MS;
  let query = caller.admin.from("js_sites").select("id, name, vars, own_site, adapter:js_adapters(rule)")
    .eq("user_id", caller.userId);
  query = siteId ? query.eq("id", siteId) : query.eq("enabled", true);
  const sites = await query;
  if (sites.error) return json({ ok: false, reason: "database" });
  if ((sites.data ?? []).length === 0) return json({ ok: false, reason: "no-sites" });

  const runs: SiteRun[] = [];
  const targets: Target[] = [];
  const listBodies = new Map<string, string>();
  for (const site of (sites.data ?? []) as unknown as SiteRow[]) {
    const result: SiteRun = { siteId: site.id, name: site.name, ok: false, read: 0, added: 0, bundled: 0 };
    const checked = site.adapter ? validateRule(site.adapter.rule) : null;
    const vars = stringVars(site.vars);
    let skipped = false;
    if (!checked) result.reason = "어댑터 없음";
    else if (!checked.ok) result.reason = `규칙 형식 오류: ${checked.errors[0]}`;
    else if (missingVars(checked.rule, vars).length > 0) {
      result.reason = `사이트 값 없음: ${missingVars(checked.rule, vars).join(", ")}`;
    } else if (Date.now() > deadline) {
      result.reason = "시간이 모자라 이번에는 건너뜀";
      skipped = true; // 사이트 문제가 아니므로 실패 알림을 보내지 않는다
    } else {
      const list = await readList(checked.rule, vars, deadline);
      if (!list.ok) result.reason = list.reason;
      else {
        result.read = list.items.length;
        const failed = judgeList(list.items);
        if (failed) result.reason = failed;
        else {
          try {
            const saved = await saveNew(caller, site, list.items, listBodies);
            result.added = saved.added;
            result.bundled = saved.bundled;
            result.ok = true;
          } catch (e) {
            // DB 실패는 dbFail이 이미 남겼다. 그 밖의 예외(코드 오류 등)만 여기서 남긴다
            if (!(e instanceof Error && e.message === "database")) {
              console.error(`js-collect 저장 중 예외: site=${site.id} ${e instanceof Error ? e.stack ?? e.message : String(e)}`);
            }
            result.reason = "공고를 저장하지 못함";
          }
        }
      }
      targets.push({ site, rule: checked.rule, vars });
    }
    await record(caller, result);
    if (!result.ok && !skipped) await noticeFail(caller, result);
    runs.push(result);
  }

  let bodies: { pending: number; failed: BodyFailure[] } = { pending: 0, failed: [] };
  try {
    if (targets.length > 0) bodies = await fetchBodies(caller, targets, listBodies, deadline);
  } catch {
    return json({ ok: false, reason: "database" });
  }
  return json({ ok: true, sites: runs, pending: bodies.pending, failed: bodies.failed });
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  const caller = await getCaller(req);
  if (!caller) return json({ ok: false, reason: "unauthorized" }, 401);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // 본문이 없으면 기본값
  }
  const action = body.action ?? "run";
  const siteId = typeof body.siteId === "string" ? body.siteId : null;
  if (action === "run") return await run(caller, siteId);
  if (action === "bodies") return await bodiesOnly(caller);
  if (action === "test") return await testRule(body.rule, body.vars);
  return json({ ok: false, reason: "unknown-action" }, 400);
});
