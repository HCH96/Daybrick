import type { ApiResult } from "../server/management";
import type { ServerSession } from "../server/session";
import { PAGE_SIZE, functionError, isRecord, postgrestError, toNumber } from "./api";
import { toGrade, type GradeId } from "./grade";
import { parseFailReason, parseFields, parseHits, parseReasons, type FilterHit, type PostingFields, type Reason } from "./postingParse";
import { loadBundleSources } from "./bundleApi";
import type { BundleSource, PostingStage } from "./types";

/** 공고 하나 읽기·지원 안 함·되돌리기·그래도 채점, 걸러진 공고·보관함 목록 (R9–R16, R46, R49, D11, D37) */

const BUCKET = "job-search";
const STAGES: readonly PostingStage[] = ["new", "filtered1", "extracted", "filtered2", "suspect", "scored", "waiting", "failed", "duplicate"];

export interface PostingScore {
  score: number;
  grade: GradeId;
  profileVersion: number;
  summary: string;
  strengths: Reason[];
  gaps: Reason[];
}

/** 상세 팝업 한 장에 쓰는 공고 전체 */
export interface PostingDetail {
  id: string;
  company: string | null;
  title: string | null;
  url: string | null;
  siteName: string | null;
  collectedAt: string;
  stage: PostingStage;
  /** null이면 원문을 아직 받지 못한 공고 (D31) */
  bodyText: string | null;
  imagePaths: string[];
  hits: FilterHit[];
  hiddenAt: string | null;
  appliedAt: string | null;
  /** 아직 추출하지 않았으면 null */
  fields: PostingFields | null;
  suspect: boolean;
  suspectQuotes: string[];
  score: PostingScore | null;
}

function one(value: unknown): Record<string, unknown> | null {
  const item: unknown = Array.isArray(value) ? value[0] : value;
  return isRecord(item) ? item : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.trim() !== "") : [];
}

function toStage(value: unknown): PostingStage {
  return STAGES.find((s) => s === value) ?? "new";
}

function parseScore(value: unknown): PostingScore | null {
  const row = one(value);
  const points = row ? toNumber(row.score) : null;
  const version = row ? toNumber(row.profile_version) : null;
  if (!row || points === null || version === null) return null;
  return {
    score: points,
    grade: toGrade(row.grade, points),
    profileVersion: version,
    summary: text(row.summary) ?? "",
    strengths: parseReasons(row.strengths),
    gaps: parseReasons(row.gaps),
  };
}

/** 상세 팝업용으로 공고 하나를 모두 읽는다 (R10–R13) */
export async function loadPostingDetail(session: ServerSession, id: string): Promise<ApiResult<PostingDetail | null>> {
  const { data, error, status } = await session.client
    .from("js_postings")
    .select(
      "id, company, title, url, collected_at, stage, body_text, image_paths, filtered_by, hidden_at, applied_at, " +
        "js_sites(name), js_extractions(fields, suspect, suspect_quotes), " +
        "js_scores(score, grade, profile_version, summary, strengths, gaps)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) return { ok: false, error: postgrestError(error, status) };
  const row: unknown = data;
  if (row === null) return { ok: true, value: null };
  if (!isRecord(row) || typeof row.id !== "string" || typeof row.collected_at !== "string") {
    return { ok: false, error: "bad-response" };
  }
  const extraction = one(row.js_extractions);
  return {
    ok: true,
    value: {
      id: row.id,
      company: text(row.company),
      title: text(row.title),
      url: text(row.url),
      siteName: text(one(row.js_sites)?.name),
      collectedAt: row.collected_at,
      stage: toStage(row.stage),
      bodyText: typeof row.body_text === "string" ? row.body_text : null,
      imagePaths: strings(row.image_paths),
      hits: parseHits(row.filtered_by),
      hiddenAt: text(row.hidden_at),
      appliedAt: text(row.applied_at),
      fields: extraction ? parseFields(extraction.fields) : null,
      suspect: extraction?.suspect === true,
      suspectQuotes: strings(extraction?.suspect_quotes),
      score: parseScore(row.js_scores),
    },
  };
}

/** 저장된 공고 이미지를 1시간짜리 서명 주소로 (R11, D14 비공개 버킷) */
export async function signImageUrls(session: ServerSession, paths: string[]): Promise<ApiResult<string[]>> {
  if (paths.length === 0) return { ok: true, value: [] };
  const { data, error } = await session.client.storage.from(BUCKET).createSignedUrls(paths, 3600);
  if (error) return { ok: false, error: "server" };
  return { ok: true, value: (data ?? []).map((d) => d.signedUrl ?? "").filter((u) => u !== "") };
}

/** 지원 안 함 (R15, D11): `hidden_at`을 남겨 추천에서 빼고 보관함으로. 되돌리기는 null로 */
export async function setPostingHidden(session: ServerSession, id: string, hidden: boolean): Promise<ApiResult<null>> {
  const { error, status } = await session.client
    .from("js_postings")
    .update({ hidden_at: hidden ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return { ok: false, error: postgrestError(error, status) };
  return { ok: true, value: null };
}

/** 그래도 채점 실패 이유 (D37 force) */
export type ForceFailure =
  | { reason: "limit"; which: "daily" | "monthly" }
  | { reason: "rejected"; message: string }
  | { reason: "credit" | "no-profile" | "no-body" | "not-found" | "missing-key" | "network" | "upstream" | "database" };

const FORCE_REASONS = ["credit", "no-profile", "no-body", "not-found", "missing-key", "network", "upstream", "database"] as const;

export type ForceResult = { ok: true; stage: PostingStage } | ({ ok: false } & ForceFailure);

/** 필터·의심을 건너뛰고 추출(없으면)·채점한다 (R46, R49, `js-process { mode: "force" }`) */
export async function forceScore(session: ServerSession, postingId: string): Promise<ApiResult<ForceResult>> {
  const { data, error } = await session.client.functions.invoke<unknown>("js-process", {
    body: { mode: "force", postingId },
  });
  if (error) return { ok: false, error: functionError(error) };
  if (!isRecord(data)) return { ok: false, error: "bad-response" };
  if (data.ok === true) return { ok: true, value: { ok: true, stage: toStage(data.stage) } };
  if (data.reason === "unauthorized") return { ok: false, error: "unauthorized" };
  if (data.reason === "limit") {
    return { ok: true, value: { ok: false, reason: "limit", which: data.which === "monthly" ? "monthly" : "daily" } };
  }
  if (data.reason === "rejected") {
    return { ok: true, value: { ok: false, reason: "rejected", message: typeof data.message === "string" ? data.message : "" } };
  }
  return { ok: true, value: { ok: false, reason: FORCE_REASONS.find((r) => r === data.reason) ?? "upstream" } };
}

/** 걸러진 공고·보관함 목록 한 줄 */
export interface ListPosting {
  id: string;
  company: string | null;
  title: string | null;
  siteName: string | null;
  collectedAt: string;
  stage: PostingStage;
  hits: FilterHit[];
  /** 처리 실패(failed) 공고의 거절 이유 (L28). 아니면 null */
  failReason: string | null;
  suspectQuotes: string[];
  hiddenAt: string | null;
  experience: string | null;
  employment: string[];
  location: string | null;
  deadlineDate: string | null;
  score: number | null;
  grade: GradeId | null;
  /** 묶음 출처 (대표 먼저, R91). 묶인 공고가 없으면 빈 배열 */
  sources: BundleSource[];
}

function parseListRow(row: Record<string, unknown>): ListPosting | null {
  if (typeof row.id !== "string" || typeof row.collected_at !== "string") return null;
  const extraction = one(row.js_extractions);
  const fields = extraction ? parseFields(extraction.fields) : null;
  const score = one(row.js_scores);
  const points = score ? toNumber(score.score) : null;
  return {
    id: row.id,
    company: text(row.company),
    title: text(row.title),
    siteName: text(one(row.js_sites)?.name),
    collectedAt: row.collected_at,
    stage: toStage(row.stage),
    hits: parseHits(row.filtered_by),
    failReason: parseFailReason(row.filtered_by),
    suspectQuotes: strings(extraction?.suspect_quotes),
    hiddenAt: text(row.hidden_at),
    experience: fields?.experience.text ?? null,
    employment: fields?.employment ?? [],
    location: fields?.location ?? null,
    deadlineDate: fields?.deadline.date ?? null,
    score: points,
    grade: score && points !== null ? toGrade(score.grade, points) : null,
    sources: [],
  };
}

const LIST_COLUMNS =
  "id, company, title, collected_at, stage, filtered_by, hidden_at, js_sites(name), " +
  "js_extractions(fields, suspect_quotes), js_scores(score, grade)";

type ListKind = "filtered" | "archived";

/** 걸러진 공고(1차·2차·인젝션 의심, 숨기지 않음, R46) 또는 보관함(숨김·지원 안 함·묶인 공고 아님, R15, D54). 대표 행에는 묶음 출처를 붙인다 (R91) */
export async function loadPostingList(session: ServerSession, kind: ListKind): Promise<ApiResult<ListPosting[]>> {
  const list: ListPosting[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const base = session.client.from("js_postings").select(LIST_COLUMNS).is("applied_at", null);
    const query =
      kind === "filtered"
        ? base.in("stage", ["filtered1", "filtered2", "suspect", "failed"]).is("hidden_at", null).order("collected_at", { ascending: false })
        : base.not("hidden_at", "is", null).neq("stage", "duplicate").order("hidden_at", { ascending: false });
    const { data, error, status } = await query.range(from, from + PAGE_SIZE - 1);
    if (error) return { ok: false, error: postgrestError(error, status) };
    const rows: unknown[] = data ?? [];
    for (const row of rows) {
      if (!isRecord(row)) return { ok: false, error: "bad-response" };
      const item = parseListRow(row);
      if (item) list.push(item);
    }
    if (rows.length < PAGE_SIZE) break;
  }
  const sources = await loadBundleSources(session, list.map((p) => p.id));
  if (!sources.ok) return sources;
  return { ok: true, value: list.map((p) => ({ ...p, sources: sources.value.get(p.id) ?? [] })) };
}
