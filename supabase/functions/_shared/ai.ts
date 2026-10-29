// 서버 함수 공용: Claude 호출 (job-search D15). 모든 AI 호출은 이 함수를 거친다.
// 호출 전 한도 검사(R73, R74), 호출 뒤 모델·작업·토큰·비용 기록(R72, R79), 크레딧 부족 판정(R78).
// 날짜 경계(오늘·이번 달)는 한국 시간 기준이다 (D25). 키 값과 응답 본문은 기록하지 않는다.
// 한도 80%·초과·크레딧 부족 알림도 여기서 보낸다 (R74, R78, R80). 같은 기간에 한 번만 보낸다.
// 일괄(Batch) 호출은 `messageParams`로 같은 요청 본문을 만들고, 결과가 오면 `recordBatchCall`로 할인 단가 기록을 남긴다.
// 일괄 호출은 하루 호출 수에 세지 않고 이번 달 사용액에만 넣는다 (R73, R110, D25, D64, D72).
import type { Caller } from "./auth.ts";
import { noticeKeys, sendNoticeOnce } from "./notify.ts";

export type AiModel = "claude-haiku-5-5" | "claude-opus-5-5";

/** 작업 종류: 호출 기록의 task 칸. `family`는 기존 공고 직군 채우기 일괄 (R100, D75) */
export type AiTask = "extract" | "injection" | "score" | "profile" | "mail" | "family";

export interface CallClaudeInput {
  task: AiTask;
  model: AiModel;
  system: string;
  /** 글자 또는 Anthropic 내용 블록 목록(이미지·PDF 등) */
  content: string | Record<string, unknown>[];
  /** 돌려받을 JSON의 모양 (JSON Schema) */
  schema: Record<string, unknown>;
  maxTokens?: number;
}

export type CallClaudeResult =
  | { kind: "ok"; data: unknown; costUsd: number }
  | { kind: "limit"; which: "daily" | "monthly" }
  | { kind: "credit" }
  | {
    kind: "error";
    reason: "missing-key" | "network" | "upstream" | "bad-response" | "database";
    /** upstream 중 이 요청의 내용(messages…)만 거절된 경우의 오류 메시지. 같은 내용으로 다시 불러도 또 거절된다 */
    rejected?: string;
  };

interface Price {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

/** 설정 행이 없을 때 쓰는 기본값 (0003의 js_settings 기본값과 같다) */
const DEFAULT_DAILY_LIMIT = 100;
const DEFAULT_MONTHLY_LIMIT_USD = 10;
const DEFAULT_PRICES: Record<AiModel, Price> = {
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.4, cacheWrite: 5 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125 },
};

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 일괄 처리 할인 배율: 기록 비용 = 토큰 × 단가 × 이 값 (단가표는 그대로, D72) */
export const BATCH_DISCOUNT = 0.5;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * prompts.ts의 출력 형식을 structured outputs가 받는 모양으로 바꾼다 (원본은 건드리지 않는다).
 * - 모든 object에 `additionalProperties: false` (필수)
 * - `type: ["string", "null"]` 같은 여러 타입은 `anyOf`로 나눈다. enum은 타입에 맞는 값만 각 갈래에 남긴다
 */
export function toOutputSchema(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(toOutputSchema);
  if (!isPlainObject(node)) return node;

  if (Array.isArray(node.type)) {
    const { type, description, enum: values, ...rest } = node;
    const branches = (type as unknown[]).map((t) => {
      if (t === "null") return { type: "null" };
      const branch: Record<string, unknown> = { ...rest, type: t };
      if (Array.isArray(values)) {
        const kept = values.filter((v) => v !== null && (t !== "string" || typeof v === "string"));
        if (kept.length) branch.enum = kept;
      }
      return toOutputSchema(branch);
    });
    return description === undefined ? { anyOf: branches } : { description, anyOf: branches };
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(node)) {
    if (k === "properties" && isPlainObject(v)) {
      out.properties = Object.fromEntries(Object.entries(v).map(([name, s]) => [name, toOutputSchema(s)]));
    } else if (k === "items" || k === "anyOf" || k === "allOf") {
      out[k] = toOutputSchema(v);
    } else {
      out[k] = v;
    }
  }
  if (node.type === "object") out.additionalProperties = false;
  return out;
}

/** 한국 시간 오늘 0시·이번 달 1일 0시 (UTC ISO 글자) */
export function kstBoundaries(now: Date): { dayStart: string; monthStart: string } {
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  const y = kst.getUTCFullYear();
  const m = kst.getUTCMonth();
  const day = Date.UTC(y, m, kst.getUTCDate()) - KST_OFFSET_MS;
  const month = Date.UTC(y, m, 1) - KST_OFFSET_MS;
  return { dayStart: new Date(day).toISOString(), monthStart: new Date(month).toISOString() };
}

function num(value: unknown, fallback: number): number {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

function readPrice(prices: unknown, model: AiModel): Price {
  const fallback = DEFAULT_PRICES[model];
  if (typeof prices !== "object" || prices === null) return fallback;
  const p = (prices as Record<string, unknown>)[model];
  if (typeof p !== "object" || p === null) return fallback;
  const r = p as Record<string, unknown>;
  return {
    input: num(r.input, fallback.input),
    output: num(r.output, fallback.output),
    cacheRead: num(r.cacheRead, fallback.cacheRead),
    cacheWrite: num(r.cacheWrite, fallback.cacheWrite),
  };
}

interface Usage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

/** Anthropic 응답의 usage 칸을 토큰 수로 읽는다 (없는 값은 0) */
function readTokens(raw: unknown): Usage {
  const r = isPlainObject(raw) ? raw : {};
  return {
    input: num(r.input_tokens, 0),
    output: num(r.output_tokens, 0),
    cacheRead: num(r.cache_read_input_tokens, 0),
    cacheWrite: num(r.cache_creation_input_tokens, 0),
  };
}

/** 비용 =각 토큰 수 × 100만 토큰당 단가의 합 */
function costOf(usage: Usage, price: Price): number {
  const sum =
    usage.input * price.input +
    usage.output * price.output +
    usage.cacheRead * price.cacheRead +
    usage.cacheWrite * price.cacheWrite;
  return sum / 1_000_000;
}

/** 지금 사용량과 한도 (80% 알림 판단에 다시 쓴다) */
interface UsageState {
  dayStart: string;
  monthStart: string;
  todayCount: number;
  dailyLimit: number;
  monthCost: number;
  monthlyLimit: number;
}

/** 한도·단가 설정 행. 읽지 못하면 undefined (행이 없으면 null) */
async function readSettings(caller: Caller): Promise<Record<string, unknown> | null | undefined> {
  const row = await caller.admin
    .from("js_settings")
    .select("daily_limit, monthly_limit_usd, prices")
    .eq("user_id", caller.userId)
    .maybeSingle();
  if (row.error) return undefined;
  return row.data as Record<string, unknown> | null;
}

/** 오늘 호출 수(일괄 제외, R73)와 이번 달 사용액(일괄 포함)을 읽는다. 읽지 못하면 null */
async function readUsage(caller: Caller, settings: Record<string, unknown> | null): Promise<UsageState | null> {
  const { dayStart, monthStart } = kstBoundaries(new Date());
  const today = await caller.admin
    .from("js_ai_calls")
    .select("id", { count: "exact", head: true })
    .eq("user_id", caller.userId)
    .eq("batch", false)
    .gte("at", dayStart);
  if (today.error) return null;

  // 이번 달 비용 합: 1000행씩 나눠 읽는다 (Supabase 한 번 응답 상한)
  let monthCost = 0;
  for (let from = 0; ; from += 1000) {
    const page = await caller.admin
      .from("js_ai_calls")
      .select("cost_usd")
      .eq("user_id", caller.userId)
      .gte("at", monthStart)
      .order("at")
      .range(from, from + 999);
    if (page.error) return null;
    for (const row of page.data ?? []) monthCost += num(row.cost_usd, 0);
    if ((page.data ?? []).length < 1000) break;
  }
  return {
    dayStart,
    monthStart,
    todayCount: today.count ?? 0,
    dailyLimit: num(settings?.daily_limit, DEFAULT_DAILY_LIMIT),
    monthCost,
    monthlyLimit: num(settings?.monthly_limit_usd, DEFAULT_MONTHLY_LIMIT_USD),
  };
}

/** 넘은 한도 (넘지 않았으면 null) */
function overLimit(usage: UsageState): "daily" | "monthly" | null {
  if (usage.todayCount >= usage.dailyLimit) return "daily";
  if (usage.monthCost >= usage.monthlyLimit) return "monthly";
  return null;
}

const NEAR_RATIO = 0.8;

function usd(value: number): string {
  return `$${value.toFixed(2)}`;
}

/** 한도 초과 알림 (R74): 하루 한도는 오늘, 월 한도는 이번 달에 한 번만 보낸다 */
async function noticeOver(caller: Caller, which: "daily" | "monthly", usage: UsageState) {
  const daily = which === "daily";
  await sendNoticeOnce(caller, {
    kind: "limit-over",
    importance: "warning",
    title: daily ? "AI 하루 한도 초과" : "AI 월 한도 초과",
    body: daily
      ? `오늘 AI 호출 ${usage.todayCount}/${usage.dailyLimit}회. AI 작업을 멈췄고, 남은 작업은 내일 이어서 처리해요.`
      : `이번 달 사용액 ${usd(usage.monthCost)} / ${usd(usage.monthlyLimit)}. AI 작업을 멈췄고, 남은 작업은 다음 달에 이어서 처리해요.`,
    tab: "settings",
    mergeKey: noticeKeys.limit(daily ? "day" : "month"),
  }, daily ? usage.dayStart : usage.monthStart);
}

/** 한도 80% 알림 (R74): 이번 호출까지 더한 사용량이 80% 이상이면 기간마다 한 번 */
async function noticeNear(caller: Caller, usage: UsageState, costUsd: number) {
  const count = usage.todayCount + 1;
  if (count >= usage.dailyLimit * NEAR_RATIO) {
    await sendNoticeOnce(caller, {
      kind: "limit-near",
      importance: "warning",
      title: "AI 하루 한도 80% 사용",
      body: `오늘 AI 호출 ${count}/${usage.dailyLimit}회. 한도를 넘으면 남은 작업은 내일 이어서 처리해요.`,
      tab: "settings",
      mergeKey: noticeKeys.limit("day"),
    }, usage.dayStart);
  }
  await noticeNearMonth(caller, usage, costUsd);
}

/** 월 한도 80% 알림만 (일괄 호출은 하루 호출 수에 세지 않는다, R73) */
async function noticeNearMonth(caller: Caller, usage: UsageState, costUsd: number) {
  const cost = usage.monthCost + costUsd;
  if (cost >= usage.monthlyLimit * NEAR_RATIO) {
    await sendNoticeOnce(caller, {
      kind: "limit-near",
      importance: "warning",
      title: "AI 월 한도 80% 사용",
      body: `이번 달 사용액 ${usd(cost)} / ${usd(usage.monthlyLimit)}. 한도를 넘으면 남은 작업은 다음 달에 이어서 처리해요.`,
      tab: "settings",
      mergeKey: noticeKeys.limit("month"),
    }, usage.monthStart);
  }
}

/** 크레딧 부족 알림 (R78): 하루에 한 번. 일괄 맡기기·결과에서 크레딧 부족을 봤을 때도 부른다 */
export async function noticeCredit(caller: Caller, usage: Pick<UsageState, "dayStart"> = kstBoundaries(new Date())) {
  await sendNoticeOnce(caller, {
    kind: "credit",
    importance: "warning",
    title: "Anthropic 크레딧 부족",
    body: "API가 크레딧 부족 오류를 돌려줘 AI 작업을 멈췄어요. 크레딧을 충전하면 남은 작업을 이어서 처리해요.",
    tab: "settings",
    mergeKey: noticeKeys.credit(),
  }, usage.dayStart);
}

/** 크레딧 부족 오류인지: Anthropic은 400 invalid_request_error에 "credit balance" 문구를 돌려준다 */
export function isCreditError(status: number, body: unknown): boolean {
  if (status !== 400 && status !== 402) return false;
  const message = (body as { error?: { message?: unknown } } | null)?.error?.message;
  return typeof message === "string" && /credit balance/i.test(message);
}

/**
 * 400 오류가 보낸 내용(messages.N.content…) 탓인지. 그렇다면 메시지(200자)를 돌려준다.
 * 이런 오류는 그 요청만의 문제라(예: 이미지가 8,000픽셀을 넘음) 다른 요청은 계속할 수 있다.
 */
function contentRejection(status: number, body: unknown): string | undefined {
  if (status !== 400) return undefined;
  const message = (body as { error?: { message?: unknown } } | null)?.error?.message;
  return typeof message === "string" && /^messages\.\d+\.content/.test(message) ? message.slice(0, 200) : undefined;
}

/**
 * Anthropic 오류 응답을 함수 로그에 남긴다: 상태 코드, 오류 종류·메시지, 요청 ID.
 * 키 값과 요청 본문은 남기지 않는다. 메시지는 길면 300자로 자른다.
 */
function logUpstream(input: CallClaudeInput, status: number, body: unknown) {
  const error = (body as { error?: { type?: unknown; message?: unknown } } | null)?.error;
  const type = typeof error?.type === "string" ? error.type : "(없음)";
  const message = typeof error?.message === "string" ? error.message.slice(0, 300) : "(없음)";
  const requestId = (body as { request_id?: unknown } | null)?.request_id;
  console.error(
    `Anthropic 오류: status=${status} type=${type} task=${input.task} model=${input.model}` +
      ` request_id=${typeof requestId === "string" ? requestId : "(없음)"} message=${message}`,
  );
}

/**
 * Claude를 한 번 부른다. 결과는 `schema` 모양의 JSON (structured outputs `output_config.format`로 받는다).
 * Opus 5.5는 강제 도구 호출(tool_choice tool·any)을 400으로 거절해서 이 방식을 쓴다.
 * 한도를 넘었으면 부르지 않고 `limit`, 크레딧 부족이면 `credit`을 돌려주고 알림을 보낸다.
 * Anthropic까지 간 호출은 성공·실패 모두 기록하고, 하루 호출 수에 센다.
 */
export async function callClaude(caller: Caller, input: CallClaudeInput): Promise<CallClaudeResult> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return { kind: "error", reason: "missing-key" };

  const settings = await readSettings(caller);
  if (settings === undefined) return { kind: "error", reason: "database" };

  const usageNow = await readUsage(caller, settings);
  if (!usageNow) return { kind: "error", reason: "database" };
  const limit = overLimit(usageNow);
  if (limit) {
    await noticeOver(caller, limit, usageNow);
    return { kind: "limit", which: limit };
  }

  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify(messageParams(input)),
    });
  } catch {
    return { kind: "error", reason: "network" };
  }

  const body: unknown = await response.json().catch(() => null);
  const usage = readTokens((body as { usage?: unknown } | null)?.usage);
  const costUsd = response.ok ? costOf(usage, readPrice(settings?.prices, input.model)) : 0;

  const logged = await caller.admin.from("js_ai_calls").insert({
    user_id: caller.userId,
    model: input.model,
    task: input.task,
    input_tokens: usage.input,
    output_tokens: usage.output,
    cache_read: usage.cacheRead,
    cache_write: usage.cacheWrite,
    cost_usd: costUsd,
    ok: response.ok,
  });
  if (logged.error) console.error("js_ai_calls 기록 실패");

  if (!response.ok) {
    if (isCreditError(response.status, body)) {
      await noticeCredit(caller, usageNow);
      return { kind: "credit" };
    }
    logUpstream(input, response.status, body);
    return { kind: "error", reason: "upstream", rejected: contentRejection(response.status, body) };
  }
  await noticeNear(caller, usageNow, costUsd);

  const data = readResult(input, body);
  if (data === undefined) return { kind: "error", reason: "bad-response" };
  return { kind: "ok", data, costUsd };
}

/**
 * Messages API 요청 본문. 바로 호출(`callClaude`)과 일괄 맡기기(`_shared/batch.ts`의 params)가 같이 쓴다.
 * 결과는 structured outputs(`output_config.format`)로 받는다 (D45).
 */
export function messageParams(input: CallClaudeInput): Record<string, unknown> {
  return {
    model: input.model,
    max_tokens: input.maxTokens ?? 4096,
    system: input.system,
    messages: [{ role: "user", content: input.content }],
    output_config: { format: { type: "json_schema", schema: toOutputSchema(input.schema) } },
  };
}

/**
 * 이번 달 남은 사용액 = 월 한도 − 이번 달 사용액 (하루 호출 수는 보지 않는다, D64). 0보다 작으면 0.
 * 남은 양이 없으면 월 한도 초과 알림을 보낸다 (이번 달 한 번, R74). 읽지 못하면 null.
 */
export async function monthlyRoom(caller: Caller): Promise<number | null> {
  const settings = await readSettings(caller);
  if (settings === undefined) return null;
  const usage = await readUsage(caller, settings);
  if (!usage) return null;
  const room = usage.monthlyLimit - usage.monthCost;
  if (room > 0) return room;
  await noticeOver(caller, "monthly", usage);
  return 0;
}

export interface BatchCallRecord {
  task: AiTask;
  model: AiModel;
  /** 결과 메시지의 usage 칸 그대로 (실패 항목이면 없어도 된다) */
  usage: unknown;
  ok: boolean;
}

/**
 * 일괄 결과 하나를 호출 기록에 남긴다 (`batch = true`, 비용 = 토큰 × 단가 × BATCH_DISCOUNT, R110, D72).
 * 기록한 뒤 이번 달 사용액이 80%·100%에 이르렀으면 월 한도 알림을 보낸다 (R74).
 * 기록한 비용을 돌려주고, 읽기·기록에 실패하면 null.
 */
export async function recordBatchCall(caller: Caller, record: BatchCallRecord): Promise<number | null> {
  const settings = await readSettings(caller);
  if (settings === undefined) return null;
  const usageNow = await readUsage(caller, settings);
  if (!usageNow) return null;
  const tokens = readTokens(record.usage);
  const costUsd = record.ok ? costOf(tokens, readPrice(settings?.prices, record.model)) * BATCH_DISCOUNT : 0;
  const logged = await caller.admin.from("js_ai_calls").insert({
    user_id: caller.userId,
    model: record.model,
    task: record.task,
    input_tokens: tokens.input,
    output_tokens: tokens.output,
    cache_read: tokens.cacheRead,
    cache_write: tokens.cacheWrite,
    cost_usd: costUsd,
    ok: record.ok,
    batch: true,
  });
  if (logged.error) {
    console.error("js_ai_calls 일괄 기록 실패");
    return null;
  }
  const after = { ...usageNow, monthCost: usageNow.monthCost + costUsd };
  if (after.monthCost >= after.monthlyLimit) await noticeOver(caller, "monthly", after);
  else await noticeNearMonth(caller, usageNow, costUsd);
  return costUsd;
}

/**
 * 성공 응답에서 결과 JSON을 꺼낸다. structured outputs라 글자 블록 하나가 스키마 모양의 JSON이다.
 * 중간에 끊겼거나(max_tokens) 거절(refusal)이면 모양이 맞지 않을 수 있어 버린다. 못 꺼내면 undefined
 */
export function readResult(input: Pick<CallClaudeInput, "task" | "model">, body: unknown): unknown {
  const stop = (body as { stop_reason?: unknown } | null)?.stop_reason;
  if (stop !== "end_turn") {
    console.error(`Anthropic 응답 끝 이유가 예상과 다름: stop_reason=${String(stop)} task=${input.task} model=${input.model}`);
    return undefined;
  }
  const blocks = (body as { content?: unknown } | null)?.content;
  const text = Array.isArray(blocks)
    ? (blocks.find((b) => (b as { type?: unknown }).type === "text") as { text?: unknown } | undefined)?.text
    : undefined;
  if (typeof text !== "string") {
    console.error(`Anthropic 응답에 글자 블록이 없음: task=${input.task} model=${input.model}`);
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    console.error(`Anthropic 응답 JSON 해석 실패: task=${input.task} model=${input.model}`);
    return undefined;
  }
}
