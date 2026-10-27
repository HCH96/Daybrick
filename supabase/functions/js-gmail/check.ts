// js-gmail check: 지난 확인 이후 메일 → 지원 건과 맞는 메일만 Haiku 분류 → 상태 변경 제안 (job-search R64–R67, R69, R70).
// 지원 건과 맞지 않는 메일은 본문을 받지 않고 AI에도 보내지 않는다 (R65).
// 서버에는 제목·보낸 사람·받은 날·짧은 근거 발췌만 저장한다 (R69).
import type { Caller } from "../_shared/auth.ts";
import { callClaude } from "../_shared/ai.ts";
import { MAIL_SCHEMA, MAIL_SYSTEM, mailContent, type MailCandidate } from "../_shared/prompts.ts";
import { GmailError, listHeads, readBody, type MailHead } from "./gmail.ts";
import { markBroken, storedAccessToken } from "./token.ts";

/** 처음 확인할 때 거슬러 보는 기간 */
const FIRST_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;
/** 한 번에 분류하는 메일 수 상한 (남은 메일은 다음 확인이 이어 받는다) */
const MAX_CLASSIFY = 20;
/** 시작 뒤 이만큼 지나면 새 분류를 시작하지 않는다 (서버 함수 시간 한도) */
const TIME_LIMIT_MS = 100_000;
const QUOTE_LIMIT = 150;

export type CheckStop =
  | { reason: "limit"; which: "daily" | "monthly" }
  | { reason: "credit" | "time" | "ai-error" | "gmail" | "rejected" | "database" };

export type CheckResult =
  | { ok: true; scanned: number; matched: number; suggested: number; stopped: CheckStop | null }
  | { ok: false; reason: "not-connected" | "rejected" | "missing-key" | "network" | "upstream" | "database" };

interface OpenApplication {
  id: string;
  company: string;
  domain: string | null;
  status: string;
  title: string | null;
}

type Json = Record<string, unknown>;

function isRecord(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 회사 이름 비교용: 법인 표기·공백·기호를 지우고 소문자로 */
function normName(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\(주\)|㈜|주식회사|\(유\)|유한회사|co\.,?\s*ltd\.?|inc\.?|corp\.?/g, "")
    .replace(/[\s\p{P}\p{S}]/gu, "");
}

/** 이 메일과 맞는 진행 중 지원 건들: 보낸 사람 도메인이 같거나, 제목·보낸 사람 이름에 회사 이름이 있다 (R65) */
function candidatesFor(head: MailHead, apps: OpenApplication[]): OpenApplication[] {
  const senderDomain = head.senderEmail.split("@")[1] ?? "";
  const text = normName(`${head.subject} ${head.senderName}`);
  return apps.filter((a) => {
    const domain = a.domain?.toLowerCase() ?? "";
    if (domain && (senderDomain === domain || senderDomain.endsWith(`.${domain}`))) return true;
    const name = normName(a.company);
    return name.length >= 2 && text.includes(name);
  });
}

async function openApplications(caller: Caller): Promise<OpenApplication[] | null> {
  const { data, error } = await caller.admin
    .from("js_applications")
    .select("id, company, domain, status, js_postings(title)")
    .eq("user_id", caller.userId)
    .eq("closed", false);
  if (error) return null;
  return (data ?? []).map((row: Json) => {
    const posting = isRecord(row.js_postings) ? row.js_postings : null;
    return {
      id: String(row.id),
      company: typeof row.company === "string" ? row.company : "",
      domain: typeof row.domain === "string" ? row.domain : null,
      status: typeof row.status === "string" ? row.status : "",
      title: posting && typeof posting.title === "string" ? posting.title : null,
    };
  });
}

/** 메일 분류 → 바꿀 상태 (req-gmail.md 표). other는 제안 없음 */
const CATEGORY_STATUS: Record<string, string> = {
  "next-stage": "stage-prep",
  attended: "awaiting",
  rejected: "closed",
  offer: "closed",
};

/** 세부 단계 → 지원 관리 일정 종류 */
const STAGE_EVENT: Record<string, string> = {
  assignment: "assignment-due",
  "coding-test": "coding-test",
  interview: "interview",
};

/** 근거 발췌: 주소를 지우고 짧게 (R69, ai-rules.md) */
function cleanQuote(value: unknown): string {
  const text = typeof value === "string" ? value : "";
  const clean = text.replace(/https?:\/\/\S+|www\.\S+/gi, "").replace(/\s+/g, " ").trim();
  return clean.length > QUOTE_LIMIT ? `${clean.slice(0, QUOTE_LIMIT)}…` : clean;
}

function readSchedule(value: unknown, stage: string | null): Json | null {
  if (!isRecord(value) || !stage) return null;
  const date = typeof value.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.date) ? value.date : null;
  if (!date) return null;
  const time = typeof value.time === "string" && /^\d{2}:\d{2}$/.test(value.time) ? value.time : null;
  const label = typeof value.label === "string" ? value.label.trim().slice(0, 60) : "";
  return { date, time, label, kind: STAGE_EVENT[stage] };
}

/** 분류 결과 → 저장할 제안 행. 제안이 없으면 null */
function toSuggestion(data: unknown, head: MailHead, candidates: Map<string, OpenApplication>): Json | null {
  if (!isRecord(data)) return null;
  const category = typeof data.category === "string" ? data.category : "other";
  const toStatus = CATEGORY_STATUS[category];
  if (!toStatus) return null;
  const picked = typeof data.application === "string" ? candidates.get(data.application) : undefined;
  // 후보가 하나뿐이면 AI가 고르지 못해도 그 지원 건이다
  const app = picked ?? (candidates.size === 1 ? [...candidates.values()][0] : undefined);
  if (!app) return null;
  const hasStage = toStatus === "stage-prep" || toStatus === "awaiting";
  const stage = hasStage && typeof data.stage === "string" && data.stage in STAGE_EVENT ? data.stage : null;
  return {
    application_id: app.id,
    subject: head.subject.slice(0, 200),
    sender: (head.senderEmail || head.senderName).slice(0, 200),
    received_at: head.receivedAt,
    category,
    from_status: app.status,
    to_status: toStatus,
    stage,
    schedule: category === "next-stage" ? readSchedule(data.schedule, stage) : null,
    quote: cleanQuote(data.quote),
  };
}

/** 같은 메일로 이미 만든 제안이 있는지 (확인이 겹쳐도 두 번 만들지 않음) */
async function alreadySuggested(caller: Caller, head: MailHead): Promise<boolean> {
  const { data } = await caller.admin
    .from("js_mail_suggestions")
    .select("id")
    .eq("user_id", caller.userId)
    .eq("received_at", head.receivedAt)
    .eq("subject", head.subject.slice(0, 200))
    .limit(1);
  return (data ?? []).length > 0;
}

async function saveCheckedAt(caller: Caller, ms: number): Promise<boolean> {
  const { error } = await caller.admin
    .from("js_gmail_tokens")
    .update({ last_checked_at: new Date(ms).toISOString() })
    .eq("user_id", caller.userId);
  return !error;
}

export async function checkMail(caller: Caller): Promise<CheckResult> {
  const startedAt = Date.now();
  const { data: row, error: rowError } = await caller.admin
    .from("js_gmail_tokens")
    .select("last_checked_at")
    .eq("user_id", caller.userId)
    .maybeSingle();
  if (rowError) return { ok: false, reason: "database" };
  const access = await storedAccessToken(caller);
  if (!access.ok) return { ok: false, reason: access.reason };

  const apps = await openApplications(caller);
  if (!apps) return { ok: false, reason: "database" };
  if (apps.length === 0) {
    // 진행 중인 지원 건이 없으면 메일을 읽지 않는다
    if (!(await saveCheckedAt(caller, startedAt))) return { ok: false, reason: "database" };
    return { ok: true, scanned: 0, matched: 0, suggested: 0, stopped: null };
  }

  const lastMs = row?.last_checked_at ? Date.parse(row.last_checked_at) : NaN;
  const since = Number.isFinite(lastMs) ? lastMs : startedAt - FIRST_LOOKBACK_MS;
  let heads: MailHead[];
  try {
    heads = await listHeads(access.accessToken, since);
  } catch (e) {
    const reason = e instanceof GmailError ? e.reason : "upstream";
    if (reason === "rejected") await markBroken(caller);
    return { ok: false, reason };
  }

  let matched = 0;
  let classified = 0;
  let suggested = 0;
  let stopped: CheckStop | null = null;
  // 멈추면 그 메일 바로 앞까지만 확인한 것으로 남겨 다음 확인이 이어 받는다
  let checkedUntil = startedAt;
  for (const head of heads) {
    const found = candidatesFor(head, apps);
    if (found.length === 0) continue;
    matched++;
    if (classified >= MAX_CLASSIFY || Date.now() - startedAt > TIME_LIMIT_MS) stopped = { reason: "time" };
    else if (await alreadySuggested(caller, head)) continue;
    if (stopped) {
      checkedUntil = Math.max(since, head.receivedMs - 1);
      break;
    }

    let body: string;
    try {
      body = await readBody(access.accessToken, head.id);
    } catch (e) {
      const reason = e instanceof GmailError ? e.reason : "upstream";
      if (reason === "rejected") await markBroken(caller);
      stopped = { reason: reason === "rejected" ? "rejected" : "gmail" };
      checkedUntil = Math.max(since, head.receivedMs - 1);
      break;
    }
    const candidates = new Map<string, OpenApplication>(found.map((a, i) => [`A${i + 1}`, a]));
    const list: MailCandidate[] = [...candidates].map(([key, a]) => ({ key, company: a.company, title: a.title, status: a.status }));
    const sender = head.senderName ? `${head.senderName} <${head.senderEmail}>` : head.senderEmail;
    const result = await callClaude(caller, {
      task: "mail",
      model: "claude-haiku-5-5",
      system: MAIL_SYSTEM,
      content: mailContent(list, { subject: head.subject, sender, receivedAt: head.receivedAt }, body),
      schema: MAIL_SCHEMA,
      maxTokens: 1024,
    });
    if (result.kind !== "ok") {
      stopped = result.kind === "limit"
        ? { reason: "limit", which: result.which }
        : { reason: result.kind === "credit" ? "credit" : "ai-error" };
      checkedUntil = Math.max(since, head.receivedMs - 1);
      break;
    }
    classified++;
    const suggestion = toSuggestion(result.data, head, candidates);
    if (!suggestion) continue;
    const { error } = await caller.admin.from("js_mail_suggestions").insert({ ...suggestion, user_id: caller.userId });
    if (error) {
      stopped = { reason: "database" };
      checkedUntil = Math.max(since, head.receivedMs - 1);
      break;
    }
    suggested++;
  }

  if (!(await saveCheckedAt(caller, checkedUntil))) return { ok: false, reason: "database" };
  return { ok: true, scanned: heads.length, matched, suggested, stopped };
}
