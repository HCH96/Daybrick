// js-collect: 사이트 어댑터 규칙으로 공고를 모은다 (job-search R25, R35–R40, D30).
// JWT 확인을 켜고 배포한다. 서비스 역할로 쓰되 항상 호출자 user_id로 거른다. AI는 부르지 않는다.
// 요청: { action: "run", siteId? } — siteId가 없으면 켜진 사이트 전체, 있으면 그 사이트 하나(꺼져 있어도).
// 순서: 사이트마다 목록 읽기 → 새 공고만 넣기(stage new, body_text null) → 남은 시간 안에 원문 받기.
// 원문을 못 받은 공고(body_text null)는 다음 실행이 이어 받는다 (R39: 받은 원문은 다시 받지 않는다).
// 응답: { ok: true, sites: [{ siteId, name, ok, read, added, reason? }], pending } 또는 { ok: false, reason }
import { type AdapterRule, type ListItem, missingVars, readBodyHtml, readDetail, readList, sleep, validateRule } from "../_shared/adapter.ts";
import { type Caller, getCaller } from "../_shared/auth.ts";
import { handleOptions, json } from "../_shared/cors.ts";
import { extId, normKey } from "../_shared/dedupe.ts";

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
  adapter: { rule: unknown } | null;
}

interface SiteRun {
  siteId: string;
  name: string;
  ok: boolean;
  read: number;
  added: number;
  reason?: string;
}

interface Target {
  site: SiteRow;
  rule: AdapterRule;
  vars: Record<string, string>;
}

function stringVars(raw: Record<string, unknown> | null): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw ?? {})) if (typeof v === "string" || typeof v === "number") out[k] = String(v);
  return out;
}

function chunks<T>(items: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += QUERY_CHUNK) out.push(items.slice(i, i + QUERY_CHUNK));
  return out;
}

/** 실패 판정 (R36): 0개이거나 제목·링크가 빠진 공고가 절반을 넘으면 실패 */
function judge(items: ListItem[]): string | null {
  if (items.length === 0) return "읽은 공고 0개";
  const broken = items.filter((item) => !item.title || !item.link).length;
  if (broken * 2 > items.length) return `제목·링크가 빠진 공고가 절반을 넘음 (${broken}/${items.length})`;
  return null;
}

/** 새 공고만 넣는다 (R35). 넣은 공고 수. 목록이 준 본문은 listBodies(사이트|ext_id → HTML)에 모은다 */
async function saveNew(caller: Caller, siteId: string, items: ListItem[], listBodies: Map<string, string>) {
  const candidates = new Map<string, { item: ListItem; ext: string; key: string | null }>();
  for (const item of items) {
    if (!item.title || !item.link) continue;
    const ext = extId(item.id, item.link);
    if (!ext || candidates.has(ext)) continue;
    candidates.set(ext, { item, ext, key: normKey(item.company, item.title) });
  }
  const exts = [...candidates.keys()];
  for (const part of chunks(exts)) {
    const found = await caller.admin.from("js_postings").select("ext_id")
      .eq("user_id", caller.userId).eq("site_id", siteId).in("ext_id", part);
    if (found.error) throw new Error("database");
    for (const row of found.data ?? []) candidates.delete(row.ext_id as string);
  }
  const keys = [...new Set([...candidates.values()].flatMap((c) => (c.key ? [c.key] : [])))];
  const taken = new Set<string>();
  for (const part of chunks(keys)) {
    const found = await caller.admin.from("js_postings").select("norm_key, site_id")
      .eq("user_id", caller.userId).in("norm_key", part);
    if (found.error) throw new Error("database");
    for (const row of found.data ?? []) if (row.site_id !== siteId) taken.add(row.norm_key as string);
  }
  const rows = [...candidates.values()]
    .filter((c) => !c.key || !taken.has(c.key))
    .map(({ item, ext, key }) => {
      if (item.body) listBodies.set(`${siteId}|${ext}`, item.body);
      return {
        user_id: caller.userId, site_id: siteId, ext_id: ext, url: item.link, company: item.company,
        title: item.title, duty: item.duty, norm_key: key, stage: "new",
      };
    });
  if (rows.length === 0) return 0;
  const saved = await caller.admin.from("js_postings")
    .upsert(rows, { onConflict: "user_id,site_id,ext_id", ignoreDuplicates: true }).select("id");
  if (saved.error) throw new Error("database");
  return saved.data?.length ?? 0;
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

/** 원문이 없는 공고(body_text null)의 원문을 남은 시간 안에 받는다. 남은 공고 수 */
async function fetchBodies(caller: Caller, targets: Target[], listBodies: Map<string, string>, deadline: number) {
  const bySite = new Map(targets.map((t) => [t.site.id, t]));
  const rows = await caller.admin.from("js_postings").select("id, site_id, ext_id, url")
    .eq("user_id", caller.userId).in("site_id", [...bySite.keys()]).is("body_text", null)
    .order("collected_at", { ascending: false }).limit(300);
  if (rows.error) throw new Error("database");
  const postings = rows.data ?? [];
  const lastRequest = new Map<string, number>();
  let done = 0;
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
      if (!res.ok) continue; // 다음 실행이 다시 받는다
      detail = res.detail;
    }
    const imagePaths = detail.text.length < IMAGE_BODY_MAX_TEXT && detail.images.length > 0
      ? await storeImages(caller, p.id as string, detail.images)
      : [];
    const saved = await caller.admin.from("js_postings")
      .update({ body_text: detail.text, image_paths: imagePaths }).eq("id", p.id).eq("user_id", caller.userId);
    if (!saved.error) done++;
  }
  return postings.length - done;
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

async function run(caller: Caller, siteId: string | null): Promise<Response> {
  const deadline = Date.now() + BUDGET_MS;
  let query = caller.admin.from("js_sites").select("id, name, vars, adapter:js_adapters(rule)")
    .eq("user_id", caller.userId);
  query = siteId ? query.eq("id", siteId) : query.eq("enabled", true);
  const sites = await query;
  if (sites.error) return json({ ok: false, reason: "database" });
  if ((sites.data ?? []).length === 0) return json({ ok: false, reason: "no-sites" });

  const runs: SiteRun[] = [];
  const targets: Target[] = [];
  const listBodies = new Map<string, string>();
  for (const site of (sites.data ?? []) as unknown as SiteRow[]) {
    const result: SiteRun = { siteId: site.id, name: site.name, ok: false, read: 0, added: 0 };
    const checked = site.adapter ? validateRule(site.adapter.rule) : null;
    const vars = stringVars(site.vars);
    if (!checked) result.reason = "어댑터 없음";
    else if (!checked.ok) result.reason = `규칙 형식 오류: ${checked.errors[0]}`;
    else if (missingVars(checked.rule, vars).length > 0) {
      result.reason = `사이트 값 없음: ${missingVars(checked.rule, vars).join(", ")}`;
    } else if (Date.now() > deadline) result.reason = "시간이 모자라 이번에는 건너뜀";
    else {
      const list = await readList(checked.rule, vars, deadline);
      if (!list.ok) result.reason = list.reason;
      else {
        result.read = list.items.length;
        const failed = judge(list.items);
        if (failed) result.reason = failed;
        else {
          try {
            result.added = await saveNew(caller, site.id, list.items, listBodies);
            result.ok = true;
          } catch {
            result.reason = "공고를 저장하지 못함";
          }
        }
      }
      targets.push({ site, rule: checked.rule, vars });
    }
    await record(caller, result);
    runs.push(result);
  }

  let pending = 0;
  try {
    if (targets.length > 0) pending = await fetchBodies(caller, targets, listBodies, deadline);
  } catch {
    return json({ ok: false, reason: "database" });
  }
  return json({ ok: true, sites: runs, pending });
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
  return json({ ok: false, reason: "unknown-action" }, 400);
});
