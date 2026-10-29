// js-process: 수집한 공고를 "1차 필터 → 추출(+인젝션 검사) → 중복 확인 → 2차 필터 → 채점" 순서로 처리한다
// (job-search R41, R48–R53, R83). 중복 확인은 queue 모드만 하고, 서버 업데이트 뒤 첫 queue가 소급 적용(R89)을 한 번 한다.
// 게이트웨이 JWT 확인을 끄고 배포하고, 호출자는 getCaller(사용자 토큰 또는 예약 비밀값)로 확인한다.
// 서비스 역할로 쓰되 항상 호출자 user_id로 거른다. AI 호출은 `_shared/ai.ts`만 거친다 (D15).
// 요청: { mode: "queue", limit? }  — 기본. 대기 공고를 기본 5개(최대 10) 꺼내 처리한다 (D17).
//         예약 실행이 15분마다 부른다(R74). 대기열을 다 비운 실행이 "새 추천 공고 N개" 알림을 보낸다.
//         순서: waiting(한도로 미룬 것, R74) → extracted(채점 전에 멈춘 것) → new. 원문이 없거나 숨긴 공고는 건너뛴다 (D31, D11).
//       { mode: "force", postingId } — 그래도 채점 (R46, R49): 필터·의심을 건너뛰고 채점한다.
//         지금 프로필 버전 점수가 있으면 AI를 부르지 않고 scored로 되돌린다 (R99, D73).
//       { mode: "rescore", limit? } — 이전 프로필 버전으로 채점한 공고를 지금 프로필로 다시 채점한다 (R23).
//       { mode: "batch" } — 기존 공고 직군 채우기·옮기기(familyBackfill.ts, 업데이트 뒤 한 번) → 끝난 일괄의 결과를 저장하고(batchResult.ts) 대기 공고의 추출·채점을
//         Anthropic 일괄 작업으로 맡긴다 (R102–R104, R106, R110, D71, batch.ts).
//         응답 { ok: true, saved: { extract, score }, submitted: { extract, score }, held, inFlight: BatchState[], stopped }.
//         예약·앱은 queue 대신 이것을 부른다 (queue는 남겨 둔다, D71).
// 한도에 걸리면 그 공고를 waiting으로 두고 멈춘다 (queue). 크레딧 부족도 같다 (R78, 알림은 _shared/ai.ts).
// Anthropic이 공고 하나의 요청만 거절하면(rejected) 그 공고를 failed로 두고 다음 공고로 간다 (L28).
// 응답: { ok: true, done: [{ postingId, stage }], stopped: { reason, which? } | null, remaining }
//       force는 { ok: true, stage } 또는 { ok: false, reason, which? }. 실패 { ok: false, reason: unauthorized|database|… }
import { getCaller } from "../_shared/auth.ts";
import { loadInFlight, submitBatches } from "./batch.ts";
import { pollBatches } from "./batchResult.ts";
import { backfillDedupe, checkDuplicate } from "./dedupe.ts";
import { ensureFamilyBackfill } from "./familyBackfill.ts";
import { handleOptions, json } from "../_shared/cors.ts";
import type { FilterRow } from "../_shared/filters.ts";
import { lastNoticeAt, sendNotice } from "../_shared/notify.ts";
import {
  type Context,
  extract,
  firstFilter,
  POSTING_COLUMNS,
  type ProcessFailHit,
  type PostingRow,
  score,
  secondFilter,
  hasCurrentScore,
  setStage,
  type Stop,
  type StepResult,
} from "./steps.ts";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 10;
/** 함수 시간 한도(무료 150초) 안에서 끝내려고, 이 시각이 지나면 새 AI 호출을 시작하지 않는다 */
const EXTRACT_BEFORE_MS = 100_000;
const SCORE_BEFORE_MS = 80_000;
/** 소급 적용(R89)은 이 시각까지 끝내지 못하면 멈추고 다음 실행이 처음부터 다시 한다 (D56) */
const BACKFILL_BEFORE_MS = 60_000;
/** 일괄 결과 읽기는 시작 100초에서 멈추고 다음 실행이 이어 읽는다 (D71) */
const POLL_BEFORE_MS = 100_000;
/** 직군 채우기(D75)의 결과 읽기는 이 시각까지만 하고 나머지 시간은 일반 결과 저장·맡기기에 둔다 */
const FAMILY_BEFORE_MS = 40_000;
const QUEUE_STAGES = ["waiting", "extracted", "new"] as const;

async function loadContext(caller: Context["caller"]): Promise<Context | null> {
  const filters = await caller.admin.from("js_filters").select("id, stage, kind, value, enabled")
    .eq("user_id", caller.userId).order("id");
  if (filters.error) return null;
  const settings = await caller.admin.from("js_settings").select("profile_version")
    .eq("user_id", caller.userId).maybeSingle();
  if (settings.error) return null;
  const version = typeof settings.data?.profile_version === "number" ? settings.data.profile_version : 0;
  let profile: Context["profile"] = null;
  if (version > 0) {
    const row = await caller.admin.from("js_profiles").select("data")
      .eq("user_id", caller.userId).eq("version", version).maybeSingle();
    if (row.error) return null;
    if (row.data) {
      const items = (row.data.data as { skills?: { items?: unknown } } | null)?.skills?.items;
      const skills = Array.isArray(items)
        ? items.flatMap((i) => (typeof i?.name === "string" ? [i.name as string] : []))
        : [];
      profile = { version, data: row.data.data, skills };
    }
  }
  return { caller, filters: (filters.data ?? []) as FilterRow[], profile };
}

function limitOf(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) ? Math.min(MAX_LIMIT, Math.max(1, value)) : DEFAULT_LIMIT;
}

/** 한도·크레딧 부족이면 공고를 waiting으로 둔다 (다음 실행이 이어 받는다, R74) */
async function stopWith(ctx: Context, p: PostingRow, stop: Stop): Promise<StepResult> {
  if (stop.reason === "limit" || stop.reason === "credit" || stop.reason === "no-profile") {
    await setStage(ctx, p.id, "waiting");
  }
  return { kind: "stop", stop };
}

/**
 * Anthropic이 이 공고의 요청만 거절했다 (예: 이미지 크기). 다시 불러도 또 거절되므로 failed로 두어
 * 대기열에서 빼고, 걸러진 공고 목록에서 이유와 [그래도 채점]으로 다시 시도할 수 있게 한다.
 */
async function markFailed(ctx: Context, p: PostingRow, message: string): Promise<StepResult> {
  const hit: ProcessFailHit = { id: "process", kind: "process-failed", matched: [message] };
  return (await setStage(ctx, p.id, "failed", [hit])) ? { kind: "done", stage: "failed" } : { kind: "stop", stop: { reason: "database" } };
}

/** 대기 공고 하나를 처리한다 */
async function processOne(ctx: Context, p: PostingRow, startedAt: number): Promise<StepResult> {
  const filtered1 = await firstFilter(ctx, p);
  if (filtered1 === null) return { kind: "stop", stop: { reason: "database" } };
  if (filtered1) return { kind: "done", stage: "filtered1" };

  if (Date.now() - startedAt > EXTRACT_BEFORE_MS) return { kind: "stop", stop: { reason: "time" } };
  const ex = await extract(ctx, p);
  if ("stop" in ex) return ex.stop.reason === "rejected" ? await markFailed(ctx, p, ex.stop.message) : await stopWith(ctx, p, ex.stop);
  if (ex.suspect) {
    return (await setStage(ctx, p.id, "suspect")) ? { kind: "done", stage: "suspect" } : { kind: "stop", stop: { reason: "database" } };
  }

  // 중복 확인 (R83): 묶이면 채점하지 않는다. p가 새 대표면 기존 대표의 단계·추출·점수를 이어 받는다 (R87)
  const dup = await checkDuplicate(ctx, p, ex.fields);
  if (dup === null) return { kind: "stop", stop: { reason: "database" } };
  if (dup.bundled) return { kind: "done", stage: dup.stage };

  const filtered2 = await secondFilter(ctx, p, ex.fields);
  if (filtered2 === null) return { kind: "stop", stop: { reason: "database" } };
  if (filtered2) return { kind: "done", stage: "filtered2" };
  if (!(await setStage(ctx, p.id, "extracted"))) return { kind: "stop", stop: { reason: "database" } };

  if (!ctx.profile) return await stopWith(ctx, p, { reason: "no-profile" });
  if (Date.now() - startedAt > SCORE_BEFORE_MS) return { kind: "stop", stop: { reason: "time" } };
  const scored = await score(ctx, p, ex.fields);
  return scored.kind === "stop" ? await stopWith(ctx, p, scored.stop) : scored;
}

async function pickQueue(ctx: Context, limit: number): Promise<PostingRow[] | null> {
  const picked: PostingRow[] = [];
  // 프로필이 없으면 채점을 기다리는 공고(waiting·extracted)는 진행할 수 없으니 새 공고만 꺼낸다
  const stages = ctx.profile ? QUEUE_STAGES : (["new"] as const);
  for (const stage of stages) {
    if (picked.length >= limit) break;
    const rows = await ctx.caller.admin.from("js_postings").select(POSTING_COLUMNS)
      .eq("user_id", ctx.caller.userId).eq("stage", stage).is("hidden_at", null).not("body_text", "is", null)
      .order("collected_at").limit(limit - picked.length);
    if (rows.error) return null;
    picked.push(...((rows.data ?? []) as PostingRow[]));
  }
  return picked;
}

async function countQueue(ctx: Context): Promise<number> {
  const res = await ctx.caller.admin.from("js_postings").select("id", { count: "exact", head: true })
    .eq("user_id", ctx.caller.userId).in("stage", [...QUEUE_STAGES]).is("hidden_at", null)
    .not("body_text", "is", null);
  return res.count ?? 0;
}

/** 소급 적용이 아직이면(dedupe_version < 1) 한 번 한다. 실패·시간 부족이면 다음 실행이 다시 한다 (D56) */
async function ensureBackfill(ctx: Context, startedAt: number) {
  const row = await ctx.caller.admin.from("js_settings").select("dedupe_version")
    .eq("user_id", ctx.caller.userId).maybeSingle();
  if (row.error) return;
  const version = typeof row.data?.dedupe_version === "number" ? row.data.dedupe_version : 0;
  if (version >= 1) return;
  if (!(await backfillDedupe(ctx, startedAt + BACKFILL_BEFORE_MS))) {
    console.warn("js-process: 소급 묶기를 끝내지 못함 (다음 실행에서 다시)");
  }
}

async function runQueue(ctx: Context, limit: number) {
  const startedAt = Date.now();
  await ensureBackfill(ctx, startedAt);
  const postings = await pickQueue(ctx, limit);
  if (!postings) return json({ ok: false, reason: "database" });
  const done: { postingId: string; stage: string }[] = [];
  let stopped: Stop | null = null;
  let noProfile = false;
  for (const p of postings) {
    const result = await processOne(ctx, p, startedAt);
    if (result.kind === "done") {
      done.push({ postingId: p.id, stage: result.stage });
      continue;
    }
    // 응답이 깨진 공고 하나 때문에 대기열 전체를 멈추지 않는다 (다음 실행에 다시 시도).
    // 프로필이 없으면 그 공고만 waiting으로 두고, 나머지 공고의 필터·추출은 계속한다.
    if (result.stop.reason === "bad-response") continue;
    if (result.stop.reason === "no-profile") {
      noProfile = true;
      continue;
    }
    stopped = result.stop;
    break;
  }
  if (!stopped && noProfile) stopped = { reason: "no-profile" };
  const remaining = await countQueue(ctx);
  if (remaining === 0 && done.some((d) => d.stage === "scored")) await noticeRecommend(ctx);
  return json({ ok: true, done, stopped, remaining });
}

/**
 * 새 추천 공고 알림 (R80): 대기열을 다 처리한 실행에서 한 번 보낸다 (합치기 키 없음).
 * N = 지난 "새 추천 공고" 알림 뒤에 수집된 추천 공고(채점됨, 숨기지·지원하지 않음) 수.
 */
async function noticeRecommend(ctx: Context) {
  const since = await lastNoticeAt(ctx.caller, "new-recommend");
  if (since === undefined) return;
  let query = ctx.caller.admin.from("js_postings").select("id", { count: "exact", head: true })
    .eq("user_id", ctx.caller.userId).eq("stage", "scored").is("hidden_at", null).is("applied_at", null);
  if (since) query = query.gt("collected_at", since);
  const { count, error } = await query;
  if (error || !count) return;
  await sendNotice(ctx.caller, {
    kind: "new-recommend",
    importance: "info",
    title: `새 추천 공고 ${count}개`,
    tab: "recommend",
  });
}

async function loadExtractionFields(ctx: Context, postingId: string): Promise<unknown> {
  const row = await ctx.caller.admin.from("js_extractions").select("fields")
    .eq("posting_id", postingId).eq("user_id", ctx.caller.userId).maybeSingle();
  return row.data?.fields ?? null;
}

/**
 * 그래도 채점 (R46, R49): 필터·의심 표시를 건너뛴다. 한도에 걸려도 단계는 그대로 둔다.
 * 지금 프로필 버전 점수가 있으면(직군으로 옮겨진 공고 등) AI 없이 scored·filtered_by 비움 (R99, D73).
 */
async function runForce(ctx: Context, postingId: string) {
  const row = await ctx.caller.admin.from("js_postings").select(POSTING_COLUMNS)
    .eq("user_id", ctx.caller.userId).eq("id", postingId).maybeSingle();
  if (row.error) return json({ ok: false, reason: "database" });
  if (!row.data) return json({ ok: false, reason: "not-found" });
  const p = row.data as PostingRow;
  if (!ctx.profile) return json({ ok: false, reason: "no-profile" });
  const current = await hasCurrentScore(ctx, p.id);
  if (current === null) return json({ ok: false, reason: "database" });
  if (current) {
    return (await setStage(ctx, p.id, "scored")) ? json({ ok: true, stage: "scored" }) : json({ ok: false, reason: "database" });
  }
  if (p.body_text === null) return json({ ok: false, reason: "no-body" });
  const ex = await extract(ctx, p);
  if ("stop" in ex) return json({ ok: false, ...ex.stop });
  const scored = await score(ctx, p, ex.fields);
  if (scored.kind === "stop") return json({ ok: false, ...scored.stop });
  return json({ ok: true, stage: scored.stage });
}

/** 다시 채점 (R23): 지금 프로필 버전이 아닌 점수를 가진 공고만 */
async function runRescore(ctx: Context, limit: number) {
  if (!ctx.profile) return json({ ok: false, reason: "no-profile" });
  const startedAt = Date.now();
  const stale = () =>
    ctx.caller.admin.from("js_scores").select("posting_id", { count: "exact" })
      .eq("user_id", ctx.caller.userId).neq("profile_version", ctx.profile?.version ?? 0);
  const rows = await stale().limit(limit);
  if (rows.error) return json({ ok: false, reason: "database" });
  const done: { postingId: string; stage: string }[] = [];
  let stopped: Stop | null = null;
  for (const { posting_id: id } of (rows.data ?? []) as { posting_id: string }[]) {
    if (Date.now() - startedAt > SCORE_BEFORE_MS) {
      stopped = { reason: "time" };
      break;
    }
    const posting = await ctx.caller.admin.from("js_postings").select(POSTING_COLUMNS)
      .eq("user_id", ctx.caller.userId).eq("id", id).maybeSingle();
    const fields = await loadExtractionFields(ctx, id);
    if (posting.error || !posting.data || fields === null) continue;
    const result = await score(ctx, posting.data as PostingRow, fields);
    if (result.kind === "done") done.push({ postingId: id, stage: result.stage });
    else if (result.stop.reason !== "bad-response") {
      stopped = result.stop;
      break;
    }
  }
  const left = await stale().limit(1);
  return json({ ok: true, done, stopped, remaining: left.count ?? 0 });
}

/**
 * 일괄 처리 (R102–R104, R106, D71): 직군 채우기(D75) → 진행 중 일괄의 결과 저장(pollBatches) → 맡기기(submitBatches).
 * 추출 결과를 저장하며 `extracted`가 된 공고는 같은 실행에서 채점 일괄로 간다 (R103의 두 번째 맡기기).
 * 결과를 저장한 실행에서 진행 중 일괄도 맡길 공고도 남지 않았으면 새 추천 공고 알림을 보낸다 (R80).
 */
async function runBatch(ctx: Context) {
  const startedAt = Date.now();
  await ensureFamilyBackfill(ctx, startedAt + FAMILY_BEFORE_MS);
  const polled = await pollBatches(ctx, startedAt + POLL_BEFORE_MS);
  const result = await submitBatches(ctx, startedAt);
  const inFlight = await loadInFlight(ctx);
  const savedAny = polled.saved.extract + polled.saved.score > 0;
  const nothingLeft = inFlight !== null && inFlight.states.length === 0 && !result.stopped && result.held === 0;
  if (savedAny && nothingLeft) await noticeRecommend(ctx);
  return json({
    ok: true,
    saved: polled.saved,
    submitted: result.submitted,
    held: result.held,
    inFlight: inFlight?.states ?? [],
    stopped: result.stopped ?? polled.stopped,
  });
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
    // 본문이 없으면 기본값 (queue)
  }
  const ctx = await loadContext(caller);
  if (!ctx) return json({ ok: false, reason: "database" });

  const mode = body.mode ?? "queue";
  if (mode === "queue") return await runQueue(ctx, limitOf(body.limit));
  if (mode === "rescore") return await runRescore(ctx, limitOf(body.limit));
  if (mode === "batch") return await runBatch(ctx);
  if (mode === "force") {
    if (typeof body.postingId !== "string") return json({ ok: false, reason: "bad-request" }, 400);
    return await runForce(ctx, body.postingId);
  }
  return json({ ok: false, reason: "unknown-mode" }, 400);
});
