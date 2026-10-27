import { STAGES, STATUSES } from "../applications/statuses";
import type { EventKind, StageId, StatusId } from "../applications/types";
import type { ApiResult } from "../server/management";
import type { ServerSession } from "../server/session";
import { functionError, isRecord, postgrestError, toNumber } from "./api";

/**
 * 메일 제안 탭 서버 읽기·쓰기와 `js-gmail check` 호출 (R64–R69).
 * 서버에는 메일 제목·보낸 사람·받은 날·근거 발췌만 있다 (R69).
 */

/** 메일 분류 (req-gmail.md 표). "기타"는 제안을 만들지 않아 여기에 없다 */
export type MailCategory = "next-stage" | "attended" | "rejected" | "offer";

export interface MailSchedule {
  date: string; // YYYY-MM-DD
  time: string | null; // HH:mm
  label: string; // 원문의 전형 이름
  kind: EventKind;
}

export type SuggestionState = "pending" | "approved" | "rejected";

export interface MailSuggestion {
  id: string;
  /** 대상 지원 건(`js_applications.id`). 지원 건이 지워졌으면 null */
  applicationId: string | null;
  company: string;
  postingTitle: string | null;
  subject: string;
  sender: string;
  receivedAt: string | null;
  category: MailCategory;
  fromStatus: StatusId | null;
  toStatus: StatusId | null;
  stage: StageId | null;
  schedule: MailSchedule | null;
  quote: string;
  state: SuggestionState;
  handledAt: string | null;
}

export interface MailTabData {
  pending: MailSuggestion[];
  /** 최근 30일 처리한 제안 (처리한 시각 최신순) */
  done: MailSuggestion[];
  /** 메일 확인 대상인 진행 중 지원 건 수 */
  openApplications: number;
}

const DONE_DAYS = 30;
const CATEGORIES: readonly MailCategory[] = ["next-stage", "attended", "rejected", "offer"];
const EVENT_KINDS: readonly EventKind[] = ["assignment-due", "coding-test", "interview"];
const SELECT =
  "id, application_id, subject, sender, received_at, category, from_status, to_status, stage, schedule, quote, state, handled_at, js_applications(company, js_postings(title))";

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function statusOf(value: unknown): StatusId | null {
  return STATUSES.find((s) => s.id === value)?.id ?? null;
}

function stageOf(value: unknown): StageId | null {
  return STAGES.find((s) => s.id === value)?.id ?? null;
}

function scheduleOf(value: unknown): MailSchedule | null {
  if (!isRecord(value) || typeof value.date !== "string") return null;
  const kind = EVENT_KINDS.find((k) => k === value.kind);
  if (!kind || !/^\d{4}-\d{2}-\d{2}$/.test(value.date)) return null;
  return { date: value.date, time: typeof value.time === "string" ? value.time : null, label: text(value.label), kind };
}

function parseSuggestion(row: unknown): MailSuggestion | null {
  if (!isRecord(row) || typeof row.id !== "string") return null;
  const category = CATEGORIES.find((c) => c === row.category);
  if (!category) return null;
  const app = isRecord(row.js_applications) ? row.js_applications : null;
  const posting = app && isRecord(app.js_postings) ? app.js_postings : null;
  return {
    id: row.id,
    applicationId: typeof row.application_id === "string" ? row.application_id : null,
    company: text(app?.company),
    postingTitle: posting && typeof posting.title === "string" ? posting.title : null,
    subject: text(row.subject),
    sender: text(row.sender),
    receivedAt: typeof row.received_at === "string" ? row.received_at : null,
    category,
    fromStatus: statusOf(row.from_status),
    toStatus: statusOf(row.to_status),
    stage: stageOf(row.stage),
    schedule: scheduleOf(row.schedule),
    quote: text(row.quote),
    state: row.state === "approved" || row.state === "rejected" ? row.state : "pending",
    handledAt: typeof row.handled_at === "string" ? row.handled_at : null,
  };
}

function parseList(rows: unknown): MailSuggestion[] {
  return (Array.isArray(rows) ? rows : []).map(parseSuggestion).filter((s): s is MailSuggestion => s !== null);
}

/** 대기 중 제안·최근 30일 처리한 제안·진행 중 지원 건 수 */
export async function loadMailTab(session: ServerSession): Promise<ApiResult<MailTabData>> {
  const since = new Date(Date.now() - DONE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const [pending, done, open] = await Promise.all([
    session.client.from("js_mail_suggestions").select(SELECT).eq("state", "pending").order("received_at", { ascending: false }),
    session.client
      .from("js_mail_suggestions")
      .select(SELECT)
      .neq("state", "pending")
      .gte("handled_at", since)
      .order("handled_at", { ascending: false }),
    session.client.from("js_applications").select("id", { count: "exact", head: true }).eq("closed", false),
  ]);
  if (pending.error) return { ok: false, error: postgrestError(pending.error, pending.status) };
  if (done.error) return { ok: false, error: postgrestError(done.error, done.status) };
  if (open.error) return { ok: false, error: postgrestError(open.error, open.status) };
  return {
    ok: true,
    value: { pending: parseList(pending.data), done: parseList(done.data), openApplications: open.count ?? 0 },
  };
}

/** 메일 제안 탭 칩에 보일 대기 중 제안 수 */
export async function countPendingSuggestions(session: ServerSession): Promise<ApiResult<number>> {
  const { count, error, status } = await session.client
    .from("js_mail_suggestions")
    .select("id", { count: "exact", head: true })
    .eq("state", "pending");
  if (error) return { ok: false, error: postgrestError(error, status) };
  return { ok: true, value: count ?? 0 };
}

/** 제안을 승인·거절로 처리한다 (R68). 아직 대기 중인 제안만 바꾼다 */
export async function setSuggestionState(
  session: ServerSession,
  id: string,
  state: "approved" | "rejected",
): Promise<ApiResult<null>> {
  const { error, status } = await session.client
    .from("js_mail_suggestions")
    .update({ state, handled_at: new Date().toISOString() })
    .eq("id", id)
    .eq("state", "pending");
  if (error) return { ok: false, error: postgrestError(error, status) };
  return { ok: true, value: null };
}

export type MailCheckStop =
  | { reason: "limit"; which: "daily" | "monthly" }
  | { reason: "credit" | "time" | "ai-error" | "gmail" | "rejected" | "database" };

const CHECK_FAILS = ["not-connected", "rejected", "missing-key", "network", "upstream", "database"] as const;
export type MailCheckFail = (typeof CHECK_FAILS)[number];

export type MailCheckResult =
  | { ok: true; scanned: number; matched: number; suggested: number; stopped: MailCheckStop | null }
  | { ok: false; reason: MailCheckFail };

const STOP_REASONS = ["credit", "time", "ai-error", "gmail", "rejected", "database"] as const;

function parseStop(value: unknown): MailCheckStop | null {
  if (!isRecord(value)) return null;
  if (value.reason === "limit") return { reason: "limit", which: value.which === "monthly" ? "monthly" : "daily" };
  const reason = STOP_REASONS.find((r) => r === value.reason);
  return reason ? { reason } : { reason: "ai-error" };
}

/** [지금 확인] (R64): 서버 함수가 지난 확인 이후 메일을 확인해 제안을 만든다 */
export async function checkMailNow(session: ServerSession): Promise<ApiResult<MailCheckResult>> {
  const { data, error } = await session.client.functions.invoke<unknown>("js-gmail", { body: { action: "check" } });
  if (error) return { ok: false, error: functionError(error) };
  if (!isRecord(data) || typeof data.ok !== "boolean") return { ok: false, error: "bad-response" };
  if (!data.ok) {
    const reason = CHECK_FAILS.find((r) => r === data.reason) ?? "upstream";
    return { ok: true, value: { ok: false, reason } };
  }
  return {
    ok: true,
    value: {
      ok: true,
      scanned: toNumber(data.scanned) ?? 0,
      matched: toNumber(data.matched) ?? 0,
      suggested: toNumber(data.suggested) ?? 0,
      stopped: parseStop(data.stopped),
    },
  };
}
