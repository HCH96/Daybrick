import { FunctionsFetchError, FunctionsHttpError, type PostgrestError } from "@supabase/supabase-js";
import type { ApiErrorKind, ApiResult } from "../server/management";
import type { ServerSession } from "../server/session";
import type { FlowPosting } from "./filterRules";
import { parseProfileData } from "./profileDraft";
import type {
  Adapter,
  AiCall,
  BalanceRecord,
  FilterKind,
  FilterRule,
  JsSettings,
  ModelPrice,
  PostingStage,
  ProfileData,
  ProfileDraft,
  ProfileSource,
  SavedProfile,
  Site,
  SiteLastResult,
} from "./types";

/**
 * 구직 관리 서버 읽기·쓰기 (로그인 세션의 Supabase 클라이언트 사용).
 * 실패는 서버 연결과 같은 원인 종류(`ApiErrorKind`)로 돌려준다. 단계마다 함수를 더한다.
 */

export function postgrestError(error: PostgrestError, status: number): ApiErrorKind {
  // status 0 = 요청 자체가 실패 (인터넷 끊김)
  if (status === 0) return "network";
  if (error.code === "42501" || status === 403) return "forbidden";
  if (status === 401) return "unauthorized";
  if (status === 404) return "not-found";
  if (status === 429) return "rate-limited";
  return "server";
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** numeric 열은 글자로 올 수 있어 숫자로 바꾼다 */
export function toNumber(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

function parsePrice(value: unknown): ModelPrice | null {
  if (!isRecord(value)) return null;
  const input = toNumber(value.input);
  const output = toNumber(value.output);
  if (input === null || output === null) return null;
  return {
    input,
    output,
    cacheRead: toNumber(value.cacheRead) ?? 0,
    cacheWrite: toNumber(value.cacheWrite) ?? 0,
  };
}

function parseSettings(row: unknown): JsSettings | null {
  if (!isRecord(row)) return null;
  const dailyLimit = toNumber(row.daily_limit);
  const monthlyLimitUsd = toNumber(row.monthly_limit_usd);
  const profileVersion = toNumber(row.profile_version);
  if (dailyLimit === null || monthlyLimitUsd === null || profileVersion === null) return null;
  const prices: Record<string, ModelPrice> = {};
  if (isRecord(row.prices)) {
    for (const [model, value] of Object.entries(row.prices)) {
      const price = parsePrice(value);
      if (price) prices[model] = price;
    }
  }
  return { dailyLimit, monthlyLimitUsd, prices, profileVersion };
}

/** 본인 설정을 읽는다. 행이 없으면 기본값(하루 100회, 월 $10, 기본 단가)으로 만든 뒤 돌려준다 (R73, R79) */
export async function loadSettings(session: ServerSession): Promise<ApiResult<JsSettings>> {
  const { data, error, status } = await session.client.rpc("js_ensure_settings");
  if (error) return { ok: false, error: postgrestError(error, status) };
  const settings = parseSettings(data);
  return settings ? { ok: true, value: settings } : { ok: false, error: "bad-response" };
}

/** 하루 호출 수·월 사용액 한도를 저장한다 (R73) */
export async function saveLimits(
  session: ServerSession,
  limits: { dailyLimit: number; monthlyLimitUsd: number },
): Promise<ApiResult<null>> {
  const { error, status } = await session.client
    .from("js_settings")
    .update({ daily_limit: limits.dailyLimit, monthly_limit_usd: limits.monthlyLimitUsd })
    .eq("user_id", session.userId);
  return error ? { ok: false, error: postgrestError(error, status) } : { ok: true, value: null };
}

/** 모델 단가표를 저장한다 (R79). 받은 표로 통째로 바꾼다 */
export async function savePrices(
  session: ServerSession,
  prices: Record<string, ModelPrice>,
): Promise<ApiResult<null>> {
  const { error, status } = await session.client
    .from("js_settings")
    .update({ prices })
    .eq("user_id", session.userId);
  return error ? { ok: false, error: postgrestError(error, status) } : { ok: true, value: null };
}

function parseBalanceRecord(row: unknown): BalanceRecord | null {
  if (!isRecord(row)) return null;
  const amountUsd = toNumber(row.amount_usd);
  if (typeof row.id !== "string" || typeof row.set_at !== "string" || amountUsd === null) return null;
  return { id: row.id, amountUsd, setAt: row.set_at };
}

/** 기준 잔액 입력 기록: 최근 것부터 `limit`개 (R76) */
export async function loadBalanceRecords(session: ServerSession, limit: number): Promise<ApiResult<BalanceRecord[]>> {
  const { data, error, status } = await session.client
    .from("js_balance_records")
    .select("id, amount_usd, set_at")
    .order("set_at", { ascending: false })
    .limit(limit);
  if (error) return { ok: false, error: postgrestError(error, status) };
  const records = (data ?? []).map(parseBalanceRecord);
  return records.every((r): r is BalanceRecord => r !== null)
    ? { ok: true, value: records }
    : { ok: false, error: "bad-response" };
}

/** 기준 잔액을 새로 넣는다: 이 시점부터 기준 이후 사용액을 $0부터 센다 (R76) */
export async function addBalanceRecord(session: ServerSession, amountUsd: number): Promise<ApiResult<null>> {
  const { error, status } = await session.client.from("js_balance_records").insert({ amount_usd: amountUsd });
  return error ? { ok: false, error: postgrestError(error, status) } : { ok: true, value: null };
}

function parseAiCall(row: unknown): AiCall | null {
  if (!isRecord(row)) return null;
  const costUsd = toNumber(row.cost_usd);
  if (typeof row.id !== "string" || typeof row.at !== "string" || costUsd === null) return null;
  return {
    id: row.id,
    at: row.at,
    model: typeof row.model === "string" ? row.model : "",
    task: typeof row.task === "string" ? row.task : "",
    inputTokens: toNumber(row.input_tokens) ?? 0,
    outputTokens: toNumber(row.output_tokens) ?? 0,
    cacheRead: toNumber(row.cache_read) ?? 0,
    cacheWrite: toNumber(row.cache_write) ?? 0,
    costUsd,
    ok: row.ok !== false,
    batch: row.batch === true,
  };
}

export const PAGE_SIZE = 1000;

/** `sinceIso` 이후의 AI 호출 기록 (읽기만, R72). 서버 응답 상한(1000행)을 넘으면 나눠 읽는다 */
export async function loadAiCallsSince(session: ServerSession, sinceIso: string): Promise<ApiResult<AiCall[]>> {
  const calls: AiCall[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error, status } = await session.client
      .from("js_ai_calls")
      .select("id, at, model, task, input_tokens, output_tokens, cache_read, cache_write, cost_usd, ok, batch")
      .gte("at", sinceIso)
      .order("at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) return { ok: false, error: postgrestError(error, status) };
    const rows = data ?? [];
    for (const row of rows) {
      const call = parseAiCall(row);
      if (!call) return { ok: false, error: "bad-response" };
      calls.push(call);
    }
    if (rows.length < PAGE_SIZE) return { ok: true, value: calls };
  }
}

// ===== 프로필 (R17–R22) =====

const BUCKET = "job-search";

function parseSource(row: unknown, sizes: Map<string, number>): ProfileSource | null {
  if (!isRecord(row)) return null;
  const kind = row.kind;
  if (typeof row.id !== "string" || typeof row.name !== "string" || typeof row.created_at !== "string") return null;
  if (kind !== "pdf" && kind !== "md" && kind !== "text") return null;
  const storagePath = typeof row.storage_path === "string" ? row.storage_path : null;
  return {
    id: row.id,
    name: row.name,
    kind,
    storagePath,
    text: typeof row.text === "string" ? row.text : null,
    createdAt: row.created_at,
    sizeBytes: storagePath ? (sizes.get(storagePath) ?? null) : null,
  };
}

/** Storage `<user_id>/sources/` 파일 크기 (경로 → 바이트). 읽지 못하면 빈 표 (크기만 안 보인다) */
async function loadSourceSizes(session: ServerSession): Promise<Map<string, number>> {
  const folder = `${session.userId}/sources`;
  const sizes = new Map<string, number>();
  const { data, error } = await session.client.storage.from(BUCKET).list(folder, { limit: 1000 });
  if (error || !data) return sizes;
  for (const file of data) {
    const size: unknown = isRecord(file.metadata) ? file.metadata.size : undefined;
    if (typeof size === "number") sizes.set(`${folder}/${file.name}`, size);
  }
  return sizes;
}

/** 프로필 자료 목록 (넣은 순서) */
export async function loadProfileSources(session: ServerSession): Promise<ApiResult<ProfileSource[]>> {
  const [rows, sizes] = await Promise.all([
    session.client
      .from("js_profile_sources")
      .select("id, name, kind, storage_path, text, created_at")
      .order("created_at", { ascending: true }),
    loadSourceSizes(session),
  ]);
  if (rows.error) return { ok: false, error: postgrestError(rows.error, rows.status) };
  const sources = (rows.data ?? []).map((row) => parseSource(row, sizes));
  return sources.every((s): s is ProfileSource => s !== null)
    ? { ok: true, value: sources }
    : { ok: false, error: "bad-response" };
}

/** 파일 자료(PDF·MD) 넣기: Storage에 올리고 목록에 한 줄. MD는 글도 `text` 칸에 넣는다 (R17) */
export async function addFileSource(
  session: ServerSession,
  file: File,
  kind: "pdf" | "md",
): Promise<ApiResult<null>> {
  // 파일 이름에 한글·공백이 있어도 되도록 저장 경로는 무작위 이름을 쓴다 (원래 이름은 name 칸)
  const path = `${session.userId}/sources/${crypto.randomUUID()}.${kind}`;
  const text = kind === "md" ? await file.text() : null;
  const contentType = kind === "pdf" ? "application/pdf" : "text/markdown";
  const uploaded = await session.client.storage.from(BUCKET).upload(path, file, { contentType });
  if (uploaded.error) return { ok: false, error: "server" };
  const { error, status } = await session.client
    .from("js_profile_sources")
    .insert({ name: file.name, kind, storage_path: path, text });
  if (error) {
    await session.client.storage.from(BUCKET).remove([path]);
    return { ok: false, error: postgrestError(error, status) };
  }
  return { ok: true, value: null };
}

/** 붙여 넣은 텍스트 자료 넣기 (R17) */
export async function addTextSource(session: ServerSession, name: string, text: string): Promise<ApiResult<null>> {
  const { error, status } = await session.client.from("js_profile_sources").insert({ name, kind: "text", text });
  return error ? { ok: false, error: postgrestError(error, status) } : { ok: true, value: null };
}

/** 자료 삭제: Storage 파일과 목록 줄 */
export async function deleteProfileSource(session: ServerSession, source: ProfileSource): Promise<ApiResult<null>> {
  if (source.storagePath) {
    const removed = await session.client.storage.from(BUCKET).remove([source.storagePath]);
    if (removed.error) return { ok: false, error: "server" };
  }
  const { error, status } = await session.client.from("js_profile_sources").delete().eq("id", source.id);
  return error ? { ok: false, error: postgrestError(error, status) } : { ok: true, value: null };
}

/** 저장된 버전 목록의 한 줄 */
export interface ProfileVersionInfo {
  version: number;
  savedAt: string;
}

export interface ProfileState {
  /** 가장 큰 버전 (지금 채점에 쓰이는 프로필). 없으면 null */
  latest: SavedProfile | null;
  /** 최근 버전부터 */
  versions: ProfileVersionInfo[];
  draft: ProfileDraft | null;
}

/** 저장된 버전 목록에 보여 줄 수 */
const VERSION_LIST_SIZE = 20;

function parseSavedProfile(row: unknown): SavedProfile | null {
  if (!isRecord(row)) return null;
  const version = toNumber(row.version);
  if (typeof row.id !== "string" || typeof row.saved_at !== "string" || version === null) return null;
  const sources = Array.isArray(row.sources) ? row.sources.filter((s): s is string => typeof s === "string") : [];
  return { id: row.id, version, data: parseProfileData(row.data), sources, savedAt: row.saved_at };
}

/** 저장된 최신 프로필·버전 목록·초안을 함께 읽는다 (R21, R22) */
export async function loadProfileState(session: ServerSession): Promise<ApiResult<ProfileState>> {
  const [latest, versions, draft] = await Promise.all([
    session.client
      .from("js_profiles")
      .select("id, version, data, sources, saved_at")
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle(),
    session.client
      .from("js_profiles")
      .select("version, saved_at")
      .order("version", { ascending: false })
      .limit(VERSION_LIST_SIZE),
    session.client.from("js_profile_drafts").select("data, created_at").maybeSingle(),
  ]);
  if (latest.error) return { ok: false, error: postgrestError(latest.error, latest.status) };
  if (versions.error) return { ok: false, error: postgrestError(versions.error, versions.status) };
  if (draft.error) return { ok: false, error: postgrestError(draft.error, draft.status) };

  const saved = latest.data ? parseSavedProfile(latest.data) : null;
  if (latest.data && !saved) return { ok: false, error: "bad-response" };
  const list: ProfileVersionInfo[] = [];
  for (const row of versions.data ?? []) {
    const version = toNumber(row.version);
    if (version === null || typeof row.saved_at !== "string") return { ok: false, error: "bad-response" };
    list.push({ version, savedAt: row.saved_at });
  }
  const draftRow: unknown = draft.data;
  const parsedDraft: ProfileDraft | null =
    isRecord(draftRow) && typeof draftRow.created_at === "string"
      ? { data: parseProfileData(draftRow.data), createdAt: draftRow.created_at }
      : null;
  return { ok: true, value: { latest: saved, versions: list, draft: parsedDraft } };
}

/**
 * 프로필 저장 (R21): 새 버전 행 → 설정의 지금 버전 → 초안 삭제 순서.
 * 버전 행이 먼저 들어가야 설정이 없는 버전을 가리키지 않는다.
 */
export async function saveProfile(
  session: ServerSession,
  version: number,
  data: ProfileData,
  sourceNames: string[],
): Promise<ApiResult<null>> {
  const inserted = await session.client.from("js_profiles").insert({ version, data, sources: sourceNames });
  if (inserted.error) return { ok: false, error: postgrestError(inserted.error, inserted.status) };
  const updated = await session.client
    .from("js_settings")
    .update({ profile_version: version })
    .eq("user_id", session.userId);
  if (updated.error) return { ok: false, error: postgrestError(updated.error, updated.status) };
  return discardProfileDraft(session);
}

/** 초안 버리기: 저장된 프로필은 그대로 (R22) */
export async function discardProfileDraft(session: ServerSession): Promise<ApiResult<null>> {
  const { error, status } = await session.client.from("js_profile_drafts").delete().eq("user_id", session.userId);
  return error ? { ok: false, error: postgrestError(error, status) } : { ok: true, value: null };
}

/** `js-profile` 실패 이유 (서버 함수가 돌려주는 글자, limit은 어느 한도인지 함께) */
const GENERATE_REASONS = [
  "no-sources",
  "too-large",
  "credit",
  "missing-key",
  "network",
  "upstream",
  "bad-response",
  "database",
] as const;

export type ProfileGenerateFailure =
  | { reason: "limit"; which: "daily" | "monthly" }
  | { reason: (typeof GENERATE_REASONS)[number] };

export type ProfileGenerateResult = { ok: true } | ({ ok: false } & ProfileGenerateFailure);

export function functionError(error: unknown): ApiErrorKind {
  if (error instanceof FunctionsHttpError) {
    const response: unknown = error.context;
    if (response instanceof Response) {
      if (response.status === 401) return "unauthorized";
      if (response.status === 403) return "forbidden";
      if (response.status === 404) return "not-found";
      if (response.status === 429) return "rate-limited";
    }
    return "server";
  }
  if (error instanceof FunctionsFetchError) return "network";
  return "server";
}

/** 프로필 만들기 (R18): 서버 함수 `js-profile`이 자료를 모아 Opus 5.5로 초안을 만들어 초안 칸에 넣는다 */
export async function generateProfile(session: ServerSession): Promise<ApiResult<ProfileGenerateResult>> {
  const { data, error } = await session.client.functions.invoke<unknown>("js-profile", { body: {} });
  if (error) return { ok: false, error: functionError(error) };
  if (!isRecord(data) || typeof data.ok !== "boolean") return { ok: false, error: "bad-response" };
  if (data.ok) return { ok: true, value: { ok: true } };
  if (data.reason === "limit") {
    return { ok: true, value: { ok: false, reason: "limit", which: data.which === "monthly" ? "monthly" : "daily" } };
  }
  const reason = GENERATE_REASONS.find((r) => r === data.reason) ?? "upstream";
  return { ok: true, value: { ok: false, reason } };
}

// ===== 수집 사이트·어댑터 (R24, R31, R34) =====

function parseAdapter(row: unknown): Adapter | null {
  if (!isRecord(row)) return null;
  const version = toNumber(row.version);
  if (typeof row.id !== "string" || typeof row.name !== "string" || version === null) return null;
  return { id: row.id, name: row.name, rule: row.rule, version, builtin: row.builtin === true };
}

function parseLastResult(value: unknown): SiteLastResult | null {
  if (!isRecord(value) || typeof value.ok !== "boolean") return null;
  return {
    ok: value.ok,
    read: toNumber(value.read) ?? 0,
    added: toNumber(value.added) ?? 0,
    reason: typeof value.reason === "string" ? value.reason : null,
  };
}

function parseSite(row: unknown): Site | null {
  if (!isRecord(row)) return null;
  if (typeof row.id !== "string" || typeof row.name !== "string" || typeof row.url !== "string") return null;
  const vars: Record<string, string> = {};
  if (isRecord(row.vars)) {
    for (const [key, value] of Object.entries(row.vars)) {
      if (typeof value === "string" || typeof value === "number") vars[key] = String(value);
    }
  }
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    adapterId: typeof row.adapter_id === "string" ? row.adapter_id : null,
    vars,
    enabled: row.enabled !== false,
    ownSite: row.own_site === true,
    lastResult: parseLastResult(row.last_result),
    lastAt: typeof row.last_at === "string" ? row.last_at : null,
  };
}

export interface SourcesState {
  sites: Site[];
  adapters: Adapter[];
}

/**
 * 수집 사이트 탭 데이터: 기본 어댑터·사이트를 먼저 맞춘 뒤(`js_ensure_defaults`, D31) 사이트와 어댑터를 읽는다.
 * 사이트는 이름순, 어댑터는 기본 것 먼저 이름순.
 */
export async function loadSources(session: ServerSession): Promise<ApiResult<SourcesState>> {
  const ensured = await session.client.rpc("js_ensure_defaults");
  if (ensured.error) return { ok: false, error: postgrestError(ensured.error, ensured.status) };
  const [sites, adapters] = await Promise.all([
    session.client
      .from("js_sites")
      .select("id, name, url, adapter_id, vars, enabled, own_site, last_result, last_at")
      .order("name", { ascending: true }),
    session.client
      .from("js_adapters")
      .select("id, name, rule, version, builtin")
      .order("builtin", { ascending: false })
      .order("name", { ascending: true }),
  ]);
  if (sites.error) return { ok: false, error: postgrestError(sites.error, sites.status) };
  if (adapters.error) return { ok: false, error: postgrestError(adapters.error, adapters.status) };
  const parsedSites = (sites.data ?? []).map(parseSite);
  const parsedAdapters = (adapters.data ?? []).map(parseAdapter);
  if (!parsedSites.every((s): s is Site => s !== null)) return { ok: false, error: "bad-response" };
  if (!parsedAdapters.every((a): a is Adapter => a !== null)) return { ok: false, error: "bad-response" };
  return { ok: true, value: { sites: parsedSites, adapters: parsedAdapters } };
}

/** 사이트 켜기·끄기 (R31). 꺼진 사이트는 [지금 수집]·예약 수집에서 빠진다 */
export async function setSiteEnabled(session: ServerSession, siteId: string, enabled: boolean): Promise<ApiResult<null>> {
  const { error, status } = await session.client.from("js_sites").update({ enabled }).eq("id", siteId);
  return error ? { ok: false, error: postgrestError(error, status) } : { ok: true, value: null };
}

/** 자사 채용 사이트 여부 바꾸기 (R90). 다음 중복 판정부터 적용된다 */
export async function setSiteOwn(session: ServerSession, siteId: string, own: boolean): Promise<ApiResult<null>> {
  const { error, status } = await session.client.from("js_sites").update({ own_site: own }).eq("id", siteId);
  return error ? { ok: false, error: postgrestError(error, status) } : { ok: true, value: null };
}

/**
 * 사이트 삭제 (R31): `js_sites` 행만 지운다.
 * 이미 모은 공고·수집 기록은 남고 `site_id`만 비워진다 (외래 키 on delete set null).
 */
export async function deleteSite(session: ServerSession, siteId: string): Promise<ApiResult<null>> {
  const { error, status } = await session.client.from("js_sites").delete().eq("id", siteId);
  return error ? { ok: false, error: postgrestError(error, status) } : { ok: true, value: null };
}

/** `js-collect run`이 돌려준 사이트 하나의 결과 */
export interface CollectSiteResult {
  siteId: string;
  name: string;
  ok: boolean;
  read: number;
  added: number;
  reason: string | null;
}

const COLLECT_REASONS = ["no-sites", "database", "unauthorized"] as const;
export type CollectFailReason = (typeof COLLECT_REASONS)[number];

export type CollectResult =
  | { ok: true; sites: CollectSiteResult[]; pending: number }
  | { ok: false; reason: CollectFailReason };

function parseCollectSite(value: unknown): CollectSiteResult | null {
  if (!isRecord(value) || typeof value.siteId !== "string" || typeof value.ok !== "boolean") return null;
  return {
    siteId: value.siteId,
    name: typeof value.name === "string" ? value.name : "",
    ok: value.ok,
    read: toNumber(value.read) ?? 0,
    added: toNumber(value.added) ?? 0,
    reason: typeof value.reason === "string" ? value.reason : null,
  };
}

/** 지금 수집 (R34): 켜진 사이트 전체를 서버 함수 `js-collect`로 바로 수집한다 (최대 2분쯤 걸린다) */
export async function runCollect(session: ServerSession): Promise<ApiResult<CollectResult>> {
  const { data, error } = await session.client.functions.invoke<unknown>("js-collect", { body: { action: "run" } });
  if (error) {
    // 401 응답도 본문에 { ok: false, reason: "unauthorized" }가 오지만 연결 원인으로 알린다
    return { ok: false, error: functionError(error) };
  }
  if (!isRecord(data) || typeof data.ok !== "boolean") return { ok: false, error: "bad-response" };
  if (!data.ok) {
    const reason = COLLECT_REASONS.find((r) => r === data.reason) ?? "database";
    return { ok: true, value: { ok: false, reason } };
  }
  if (!Array.isArray(data.sites)) return { ok: false, error: "bad-response" };
  const sites = data.sites.map(parseCollectSite);
  if (!sites.every((s): s is CollectSiteResult => s !== null)) return { ok: false, error: "bad-response" };
  return { ok: true, value: { ok: true, sites, pending: toNumber(data.pending) ?? 0 } };
}

// ===== 사이트 추가·시험 수집·어댑터 교체 (R28, R29, R32) =====

/** 시험 수집에서 처음 5개 중 하나 */
export interface TestSample {
  title: string | null;
  company: string | null;
  link: string | null;
  /** 본문 글자 수·이미지 수. 상세 규칙이 없으면 null */
  bodyChars: number | null;
  images: number | null;
  /** 상세를 받지 못한 이유 */
  bodyError: string | null;
}

/** `js-collect test` 결과 (서버 `js-collect/test.ts`) */
export type CollectTestResult =
  | {
      ok: true;
      /** 실패 판정(R36)을 통과했으면 true. 이때만 저장할 수 있다 */
      passed: boolean;
      problem: string | null;
      read: number;
      /** 칸 이름 → 값이 읽힌 공고 수 */
      fields: Record<string, number>;
      sample: TestSample[];
      ms: number;
    }
  | { ok: false; reason: "invalid-rule"; errors: string[] }
  | { ok: false; reason: "missing-vars"; missing: string[] };

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function parseSample(value: unknown): TestSample | null {
  if (!isRecord(value)) return null;
  const text = (v: unknown) => (typeof v === "string" ? v : null);
  return {
    title: text(value.title),
    company: text(value.company),
    link: text(value.link),
    bodyChars: toNumber(value.bodyChars),
    images: toNumber(value.images),
    bodyError: text(value.bodyError),
  };
}

function parseTestResult(data: unknown): CollectTestResult | null {
  if (!isRecord(data) || typeof data.ok !== "boolean") return null;
  if (!data.ok) {
    if (data.reason === "invalid-rule") return { ok: false, reason: "invalid-rule", errors: stringList(data.errors) };
    if (data.reason === "missing-vars") return { ok: false, reason: "missing-vars", missing: stringList(data.missing) };
    return null;
  }
  const fields: Record<string, number> = {};
  if (isRecord(data.fields)) {
    for (const [key, value] of Object.entries(data.fields)) {
      const n = toNumber(value);
      if (n !== null) fields[key] = n;
    }
  }
  const sample = Array.isArray(data.sample) ? data.sample.map(parseSample) : [];
  if (!sample.every((s): s is TestSample => s !== null)) return null;
  return {
    ok: true,
    passed: data.passed === true,
    problem: typeof data.problem === "string" ? data.problem : null,
    read: toNumber(data.read) ?? 0,
    fields,
    sample,
    ms: toNumber(data.ms) ?? 0,
  };
}

/** 시험 수집 (R29): 규칙과 사이트별 값으로 목록을 읽어 본다. 서버는 아무것도 저장하지 않는다 */
export async function testCollect(
  session: ServerSession,
  rule: unknown,
  vars: Record<string, string>,
): Promise<ApiResult<CollectTestResult>> {
  const { data, error } = await session.client.functions.invoke<unknown>("js-collect", {
    body: { action: "test", rule, vars },
  });
  if (error) return { ok: false, error: functionError(error) };
  const result = parseTestResult(data);
  return result ? { ok: true, value: result } : { ok: false, error: "bad-response" };
}

/** 새 사이트의 어댑터: 기존 어댑터 id 또는 올린 규칙(새 어댑터 v1로 넣는다) */
export type NewSiteAdapter = { kind: "existing"; adapterId: string } | { kind: "rule"; name: string; rule: unknown };

/**
 * 사이트 추가 (R28). 규칙 파일을 올렸으면 어댑터를 먼저 넣고 사이트를 넣는다.
 * 사이트를 넣지 못하면 방금 넣은 어댑터를 지워 쓰는 곳 없는 어댑터가 남지 않게 한다.
 */
export async function addSite(
  session: ServerSession,
  site: { name: string; url: string; vars: Record<string, string>; ownSite: boolean },
  adapter: NewSiteAdapter,
): Promise<ApiResult<null>> {
  let adapterId: string;
  let createdId: string | null = null;
  if (adapter.kind === "existing") {
    adapterId = adapter.adapterId;
  } else {
    const inserted = await session.client
      .from("js_adapters")
      .insert({ name: adapter.name, rule: adapter.rule, version: 1, builtin: false })
      .select("id")
      .single();
    if (inserted.error) return { ok: false, error: postgrestError(inserted.error, inserted.status) };
    const id: unknown = inserted.data?.id;
    if (typeof id !== "string") return { ok: false, error: "bad-response" };
    adapterId = id;
    createdId = id;
  }
  const { error, status } = await session.client
    .from("js_sites")
    .insert({ name: site.name, url: site.url, adapter_id: adapterId, vars: site.vars, own_site: site.ownSite });
  if (error) {
    if (createdId) await session.client.from("js_adapters").delete().eq("id", createdId);
    return { ok: false, error: postgrestError(error, status) };
  }
  return { ok: true, value: null };
}

/**
 * 어댑터 새 버전 올리기 (R32): 규칙을 바꾸고 버전을 1 올린다.
 * 읽어 온 버전일 때만 바꿔(다른 곳에서 먼저 바꿨으면 0줄) 버전이 겹치지 않게 한다.
 */
export async function replaceAdapterRule(session: ServerSession, adapter: Adapter, rule: unknown): Promise<ApiResult<null>> {
  const { data, error, status } = await session.client
    .from("js_adapters")
    .update({ rule, version: adapter.version + 1 })
    .eq("id", adapter.id)
    .eq("version", adapter.version)
    .select("id");
  if (error) return { ok: false, error: postgrestError(error, status) };
  return (data ?? []).length === 1 ? { ok: true, value: null } : { ok: false, error: "bad-response" };
}

// ===== 필터 (R42–R45, R47) =====

const FILTER_KINDS: readonly FilterKind[] = [
  "title-include",
  "title-exclude",
  "company-exclude",
  "skill-include",
  "skill-exclude",
  "max-years",
  "employment",
  "skill-overlap",
  "title-nondev",
  "dev-only",
];

function parseFilter(row: unknown): FilterRule | null {
  if (!isRecord(row) || typeof row.id !== "string") return null;
  const stage = toNumber(row.stage);
  const kind = FILTER_KINDS.find((k) => k === row.kind);
  if ((stage !== 1 && stage !== 2) || !kind) return null;
  return { id: row.id, stage, kind, value: row.value, enabled: row.enabled !== false };
}

async function selectFilters(session: ServerSession): Promise<ApiResult<FilterRule[]>> {
  const { data, error, status } = await session.client
    .from("js_filters")
    .select("id, stage, kind, value, enabled")
    .order("stage", { ascending: true })
    .order("id", { ascending: true });
  if (error) return { ok: false, error: postgrestError(error, status) };
  const rules = (data ?? []).map(parseFilter);
  return rules.every((r): r is FilterRule => r !== null) ? { ok: true, value: rules } : { ok: false, error: "bad-response" };
}

/**
 * 필터 조건 목록. 2차의 기술스택 자동 추림 줄(R44)이 없으면 켜진 상태로 하나 넣고 다시 읽는다 (D35).
 * 줄 순서는 넣은 순서가 아니라 id 순서라, 화면은 종류별로 묶지 않고 받은 순서대로 보여 준다.
 */
export async function loadFilters(session: ServerSession): Promise<ApiResult<FilterRule[]>> {
  const first = await selectFilters(session);
  if (!first.ok || first.value.some((r) => r.kind === "skill-overlap")) return first;
  const { error, status } = await session.client
    .from("js_filters")
    .insert({ stage: 2, kind: "skill-overlap", value: {}, enabled: true });
  if (error) return { ok: false, error: postgrestError(error, status) };
  return selectFilters(session);
}

/** 조건 추가 (R45) */
export async function addFilter(
  session: ServerSession,
  rule: { stage: 1 | 2; kind: FilterKind; value: unknown },
): Promise<ApiResult<null>> {
  const { error, status } = await session.client.from("js_filters").insert({ ...rule, enabled: true });
  return error ? { ok: false, error: postgrestError(error, status) } : { ok: true, value: null };
}

/** 조건 켜기·끄기 (R45) */
export async function setFilterEnabled(session: ServerSession, id: string, enabled: boolean): Promise<ApiResult<null>> {
  const { error, status } = await session.client.from("js_filters").update({ enabled }).eq("id", id);
  return error ? { ok: false, error: postgrestError(error, status) } : { ok: true, value: null };
}

/** 조건 삭제 (R45) */
export async function deleteFilter(session: ServerSession, id: string): Promise<ApiResult<null>> {
  const { error, status } = await session.client.from("js_filters").delete().eq("id", id);
  return error ? { ok: false, error: postgrestError(error, status) } : { ok: true, value: null };
}

/** 필터를 바꾼 뒤 아직 채점하지 않은 공고를 다시 거르게 되돌린다 (R47, `js_refilter`). 되돌린 공고 수 */
export async function refilter(session: ServerSession): Promise<ApiResult<number>> {
  const { data, error, status } = await session.client.rpc("js_refilter");
  if (error) return { ok: false, error: postgrestError(error, status) };
  const count = toNumber(data);
  return count === null ? { ok: false, error: "bad-response" } : { ok: true, value: count };
}

const POSTING_STAGES: readonly PostingStage[] = ["new", "filtered1", "extracted", "filtered2", "suspect", "scored", "waiting"];

/** 처리 순서 줄(R41)에 쓸 `sinceIso` 이후 수집 공고의 단계와 추출 결과 유무 */
export async function loadFlowPostings(session: ServerSession, sinceIso: string): Promise<ApiResult<FlowPosting[]>> {
  const postings: FlowPosting[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error, status } = await session.client
      .from("js_postings")
      .select("id, stage, js_extractions(posting_id)")
      .gte("collected_at", sinceIso)
      .order("collected_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) return { ok: false, error: postgrestError(error, status) };
    const rows: unknown[] = data ?? [];
    for (const row of rows) {
      if (!isRecord(row)) return { ok: false, error: "bad-response" };
      const stage = POSTING_STAGES.find((s) => s === row.stage);
      if (!stage) return { ok: false, error: "bad-response" };
      // 1:1 관계라 객체 하나(또는 null)로 오지만, 배열로 와도 받는다
      const ex: unknown = row.js_extractions;
      const extracted = Array.isArray(ex) ? ex.length > 0 : ex !== null && ex !== undefined;
      postings.push({ stage, extracted });
    }
    if (rows.length < PAGE_SIZE) return { ok: true, value: postings };
  }
}
