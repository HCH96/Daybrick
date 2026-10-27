// 서버 함수 공용: Claude 호출 (job-search D15). 모든 AI 호출은 이 함수를 거친다.
// 호출 전 한도 검사(R73, R74), 호출 뒤 모델·작업·토큰·비용 기록(R72, R79), 크레딧 부족 판정(R78).
// 날짜 경계(오늘·이번 달)는 한국 시간 기준이다 (D25). 키 값과 응답 본문은 기록하지 않는다.
import type { Caller } from "./auth.ts";

export type AiModel = "claude-haiku-5-5" | "claude-opus-5-5";

/** 작업 종류: 호출 기록의 task 칸 */
export type AiTask = "extract" | "injection" | "score" | "profile" | "mail";

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
  | { kind: "error"; reason: "missing-key" | "network" | "upstream" | "bad-response" | "database" };

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
const RESULT_TOOL = "result";

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

/** 비용 = 각 토큰 수 × 100만 토큰당 단가의 합 */
function costOf(usage: Usage, price: Price): number {
  const sum =
    usage.input * price.input +
    usage.output * price.output +
    usage.cacheRead * price.cacheRead +
    usage.cacheWrite * price.cacheWrite;
  return sum / 1_000_000;
}

/** 오늘 호출 수와 이번 달 사용액이 한도 안인지 본다. 넘었으면 어느 한도인지 돌려준다 */
async function checkLimits(caller: Caller, settings: Record<string, unknown> | null) {
  const { dayStart, monthStart } = kstBoundaries(new Date());
  const today = await caller.admin
    .from("js_ai_calls")
    .select("id", { count: "exact", head: true })
    .eq("user_id", caller.userId)
    .gte("at", dayStart);
  if (today.error) return "database" as const;
  if ((today.count ?? 0) >= num(settings?.daily_limit, DEFAULT_DAILY_LIMIT)) return "daily" as const;

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
    if (page.error) return "database" as const;
    for (const row of page.data ?? []) monthCost += num(row.cost_usd, 0);
    if ((page.data ?? []).length < 1000) break;
  }
  if (monthCost >= num(settings?.monthly_limit_usd, DEFAULT_MONTHLY_LIMIT_USD)) return "monthly" as const;
  return null;
}

/** 크레딧 부족 오류인지: Anthropic은 400 invalid_request_error에 "credit balance" 문구를 돌려준다 */
function isCreditError(status: number, body: unknown): boolean {
  if (status !== 400 && status !== 402) return false;
  const message = (body as { error?: { message?: unknown } } | null)?.error?.message;
  return typeof message === "string" && /credit balance/i.test(message);
}

/**
 * Claude를 한 번 부른다. 결과는 `schema` 모양의 JSON (강제 도구 호출로 받는다).
 * 한도를 넘었으면 부르지 않고 `limit`, 크레딧 부족이면 `credit`을 돌려준다 (알림은 15단계).
 * Anthropic까지 간 호출은 성공·실패 모두 기록하고, 하루 호출 수에 센다.
 */
export async function callClaude(caller: Caller, input: CallClaudeInput): Promise<CallClaudeResult> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return { kind: "error", reason: "missing-key" };

  const settingsRow = await caller.admin
    .from("js_settings")
    .select("daily_limit, monthly_limit_usd, prices")
    .eq("user_id", caller.userId)
    .maybeSingle();
  if (settingsRow.error) return { kind: "error", reason: "database" };
  const settings = settingsRow.data as Record<string, unknown> | null;

  const limit = await checkLimits(caller, settings);
  if (limit === "database") return { kind: "error", reason: "database" };
  if (limit) return { kind: "limit", which: limit };

  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: input.model,
        max_tokens: input.maxTokens ?? 4096,
        system: input.system,
        messages: [{ role: "user", content: input.content }],
        tools: [{ name: RESULT_TOOL, description: "결과를 이 모양으로 돌려준다", input_schema: input.schema }],
        tool_choice: { type: "tool", name: RESULT_TOOL },
      }),
    });
  } catch {
    return { kind: "error", reason: "network" };
  }

  const body: unknown = await response.json().catch(() => null);
  const rawUsage = (body as { usage?: Record<string, unknown> } | null)?.usage ?? {};
  const usage: Usage = {
    input: num(rawUsage.input_tokens, 0),
    output: num(rawUsage.output_tokens, 0),
    cacheRead: num(rawUsage.cache_read_input_tokens, 0),
    cacheWrite: num(rawUsage.cache_creation_input_tokens, 0),
  };
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
    if (isCreditError(response.status, body)) return { kind: "credit" };
    return { kind: "error", reason: "upstream" };
  }

  const blocks = (body as { content?: unknown } | null)?.content;
  const toolUse = Array.isArray(blocks)
    ? blocks.find((b) => (b as { type?: unknown }).type === "tool_use")
    : undefined;
  const data = (toolUse as { input?: unknown } | undefined)?.input;
  if (data === undefined) return { kind: "error", reason: "bad-response" };
  return { kind: "ok", data, costUsd };
}
