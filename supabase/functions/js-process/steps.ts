// js-process: 공고 하나의 단계별 처리 (job-search R41, R44, R48–R53).
// 1차 필터 → 추출(+인젝션 검사) → 2차 필터 → 채점. 결과 저장은 모두 호출자 user_id로 거른다.
// 추출·채점은 "요청 만들기(extractRequest·scoreRequest)"와 "결과 저장(saveExtraction·saveScore)"으로 나눠
// 바로 호출(extract·score)과 일괄 처리(batch.ts)가 같이 쓴다 (D71).
import { callClaude, type CallClaudeInput } from "../_shared/ai.ts";
import type { Caller } from "../_shared/auth.ts";
import {
  applyFirst,
  applySecond,
  type ExtractionForFilter,
  type FilterHit,
  type FilterRow,
} from "../_shared/filters.ts";
import {
  EXTRACT_SCHEMA,
  EXTRACT_SYSTEM,
  type PostingMeta,
  postingBlock,
  SCORE_PARTS,
  SCORE_SCHEMA,
  SCORE_SYSTEM,
  scoreContent,
} from "../_shared/prompts.ts";
import { type AlphaBudget, postingAttachments } from "./attach.ts";
import { guardText } from "./guard.ts";

export interface PostingRow {
  id: string;
  title: string | null;
  company: string | null;
  duty: string | null;
  body_text: string | null;
  image_paths: string[] | null;
  collected_at: string;
  stage: string;
}

export const POSTING_COLUMNS = "id, title, company, duty, body_text, image_paths, collected_at, stage";

/** 이번 실행에서 같이 쓰는 값: 필터 조건과 지금 프로필, 투명 PNG를 더 풀 수 있는 몫(AlphaBudget) */
export interface Context extends AlphaBudget {
  caller: Caller;
  filters: FilterRow[];
  profile: { version: number; data: unknown; skills: string[] } | null;
}

/** 멈춘 이유: 한도·크레딧 부족·프로필 없음·시간 부족·AI 호출 오류 */
export type Stop =
  | { reason: "limit"; which: "daily" | "monthly" }
  | { reason: "credit" }
  | { reason: "no-profile" }
  | { reason: "time" }
  | { reason: "missing-key" | "network" | "upstream" | "bad-response" | "database" }
  /** Anthropic이 이 공고의 요청만 거절함 (예: 이미지 크기). 공고를 failed로 두고 다음 공고로 간다 */
  | { reason: "rejected"; message: string };

export type StepResult = { kind: "done"; stage: string } | { kind: "stop"; stop: Stop };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function meta(p: PostingRow): PostingMeta {
  return { title: p.title, company: p.company, duty: p.duty, collectedAt: p.collected_at };
}

/** 처리 실패(failed) 공고의 filtered_by 한 줄: 거절 이유 (L28) */
export interface ProcessFailHit {
  id: "process";
  kind: "process-failed";
  matched: [string];
}

export async function setStage(ctx: Context, id: string, stage: string, hits: FilterHit[] | ProcessFailHit[] | null = null) {
  const res = await ctx.caller.admin.from("js_postings").update({ stage, filtered_by: hits })
    .eq("id", id).eq("user_id", ctx.caller.userId);
  return !res.error;
}

/** 1차 필터 (R42). 걸리면 filtered1 + 걸린 조건을 저장하고 true */
export async function firstFilter(ctx: Context, p: PostingRow): Promise<boolean | null> {
  const result = applyFirst({ title: p.title, duty: p.duty, company: p.company }, ctx.filters);
  if (result.pass) return false;
  return (await setStage(ctx, p.id, "filtered1", result.hits)) ? true : null;
}

/** 저장된 추출 결과 (R53: 있으면 다시 부르지 않는다) */
export interface Extraction {
  fields: unknown;
  suspect: boolean;
}

function strings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim() !== "").map((v) => v.trim());
}

/**
 * 추출 요청 만들기 (R48–R50): 첨부(이미지·나눈 PDF)와 규칙 검사로 보이지 않는 문자를 지운 원문.
 * 바로 호출(`extract`)과 일괄 맡기기(`batch.ts`)가 같은 요청을 쓴다 (D71).
 * 이번 실행의 투명 PNG 몫이 모자라면 null (다음 실행에 다시 만든다, L65).
 */
export async function extractRequest(ctx: Context, p: PostingRow): Promise<CallClaudeInput | null> {
  const guard = guardText(p.body_text ?? "");
  const attached = await postingAttachments(ctx.caller, p.image_paths ?? [], ctx);
  if (!attached) return null;
  return {
    task: "extract",
    model: "claude-haiku-5-5",
    system: EXTRACT_SYSTEM,
    content: [
      ...attached.blocks,
      { type: "text", text: postingBlock(meta(p), guard.text, attached.images, attached.pdfPages) },
    ],
    schema: EXTRACT_SCHEMA,
    maxTokens: 8192,
  };
}

/**
 * 추출 결과 저장: AI 결과 JSON(`{ fields, injection }`)과 규칙 검사(원문에서 다시 계산)를 합쳐 의심 여부를 정한다.
 * 같은 공고를 다시 저장해도 한 행이다 (posting_id 기준 upsert). 저장하지 못하면 null.
 */
export async function saveExtraction(ctx: Context, p: PostingRow, result: unknown): Promise<Extraction | null> {
  const guard = guardText(p.body_text ?? "");
  const data = isRecord(result) ? result : {};
  const fields = isRecord(data.fields) ? data.fields : {};
  const injection = isRecord(data.injection) ? data.injection : {};
  const quotes = [...guard.quotes, ...strings(injection.quotes)];
  const suspect = guard.quotes.length > 0 || injection.suspect === true || strings(injection.quotes).length > 0;
  const stored = await ctx.caller.admin.from("js_extractions").upsert({
    posting_id: p.id,
    user_id: ctx.caller.userId,
    fields,
    suspect,
    suspect_quotes: suspect ? [...new Set(quotes)] : [],
  }, { onConflict: "posting_id" });
  if (stored.error) return null;
  return { fields, suspect };
}

/** 추출 + 인젝션 검사 (R48–R50), 바로 호출. 이미 있으면 그것을 돌려준다 */
export async function extract(ctx: Context, p: PostingRow): Promise<Extraction | { stop: Stop }> {
  const saved = await ctx.caller.admin.from("js_extractions").select("fields, suspect")
    .eq("posting_id", p.id).eq("user_id", ctx.caller.userId).maybeSingle();
  if (saved.error) return { stop: { reason: "database" } };
  if (saved.data) return { fields: saved.data.fields, suspect: saved.data.suspect === true };

  const request = await extractRequest(ctx, p);
  // 투명 PNG 몫이 모자람: 남은 공고와 같이 다음 실행에서 한다
  if (!request) return { stop: { reason: "time" } };
  const result = await callClaude(ctx.caller, request);
  if (result.kind === "limit") return { stop: { reason: "limit", which: result.which } };
  if (result.kind === "credit") return { stop: { reason: "credit" } };
  if (result.kind === "error") {
    return { stop: result.rejected ? { reason: "rejected", message: result.rejected } : { reason: result.reason } };
  }
  const stored = await saveExtraction(ctx, p, result.data);
  return stored ?? { stop: { reason: "database" } };
}

/** 저장된 추출 항목을 2차 필터 모양으로 바꾼다 (D35) */
export function forFilter(fields: unknown): ExtractionForFilter {
  const f = isRecord(fields) ? fields : {};
  const experience = isRecord(f.experience) ? f.experience : {};
  const years = experience.minYears;
  return {
    skills: strings(f.skills),
    minYears: typeof years === "number" && Number.isFinite(years) ? years : null,
    employment: strings(f.employment),
    family: typeof f.family === "string" && f.family.trim() !== "" ? f.family.trim() : null,
  };
}

/** 2차 필터 (R43–R44). 걸리면 filtered2 + 걸린 조건을 저장하고 true */
export async function secondFilter(ctx: Context, p: PostingRow, fields: unknown): Promise<boolean | null> {
  const profile = ctx.profile ? { skills: ctx.profile.skills } : null;
  const result = applySecond(forFilter(fields), profile, ctx.filters);
  if (result.pass) return false;
  return (await setStage(ctx, p.id, "filtered2", result.hits)) ? true : null;
}

/** 등급 (ai-rules.md): 80↑ strong / 60–79 good / 40–59 fair / 40↓ low */
export function gradeOf(score: number): "strong" | "good" | "fair" | "low" {
  if (score >= 80) return "strong";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "low";
}

function reasons(value: unknown): { point: string; posting: string; profile: string }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.point !== "string" || item.point.trim() === "") return [];
    const text = (v: unknown, fallback: string) => (typeof v === "string" && v.trim() !== "" ? v.trim() : fallback);
    return [{ point: item.point.trim(), posting: text(item.posting, ""), profile: text(item.profile, "확인 불가") }];
  });
}

/** 항목 점수를 배점 안으로 자르고 더한다 */
function totalOf(parts: unknown): number {
  const r = isRecord(parts) ? parts : {};
  let sum = 0;
  for (const [key, max] of Object.entries(SCORE_PARTS)) {
    const part = isRecord(r[key]) ? r[key] as Record<string, unknown> : {};
    const n = typeof part.score === "number" && Number.isFinite(part.score) ? Math.round(part.score) : 0;
    sum += Math.min(max, Math.max(0, n));
  }
  return sum;
}

/** 채점 요청 만들기 (R51): 지금 프로필과 추출 항목. 프로필이 없으면 null */
export function scoreRequest(ctx: Context, p: PostingRow, fields: unknown): CallClaudeInput | null {
  if (!ctx.profile) return null;
  return {
    task: "score",
    model: "claude-opus-5-5",
    system: SCORE_SYSTEM,
    content: scoreContent(ctx.profile.data, meta(p), fields),
    schema: SCORE_SCHEMA,
    maxTokens: 8192,
  };
}

/**
 * 채점 결과 저장: 항목 점수를 더해 점수·등급을 정하고(D36) `scored`로 둔다.
 * `profileVersion`은 요청을 만들 때의 프로필 버전이다. 같은 공고를 다시 저장해도 한 행이다. 실패하면 false.
 * `toScored`가 false면 점수만 저장하고 단계는 그대로 둔다 (일괄 결과가 오기 전에 묶이거나 걸러진 공고, batchResult.ts).
 */
export async function saveScore(
  ctx: Context,
  p: PostingRow,
  result: unknown,
  profileVersion: number,
  toScored = true,
): Promise<boolean> {
  const data = isRecord(result) ? result : {};
  const total = totalOf(data.parts);
  const stored = await ctx.caller.admin.from("js_scores").upsert({
    posting_id: p.id,
    user_id: ctx.caller.userId,
    profile_version: profileVersion,
    score: total,
    grade: gradeOf(total),
    strengths: reasons(data.strengths),
    gaps: reasons(data.gaps),
    summary: typeof data.summary === "string" ? data.summary.trim() : "",
  }, { onConflict: "posting_id" });
  if (stored.error) return false;
  return toScored ? await setStage(ctx, p.id, "scored") : true;
}

/** 지금 프로필 버전의 점수가 이미 있는지 (R53, D73). 읽지 못하면 null */
export async function hasCurrentScore(ctx: Context, postingId: string): Promise<boolean | null> {
  if (!ctx.profile) return false;
  const saved = await ctx.caller.admin.from("js_scores").select("profile_version")
    .eq("posting_id", postingId).eq("user_id", ctx.caller.userId).maybeSingle();
  if (saved.error) return null;
  return saved.data?.profile_version === ctx.profile.version;
}

/** 적합도 채점 (R51), 바로 호출. 같은 프로필 버전의 점수가 있으면 다시 부르지 않는다 (R53) */
export async function score(ctx: Context, p: PostingRow, fields: unknown): Promise<StepResult> {
  const request = scoreRequest(ctx, p, fields);
  if (!ctx.profile || !request) return { kind: "stop", stop: { reason: "no-profile" } };
  const current = await hasCurrentScore(ctx, p.id);
  if (current === null) return { kind: "stop", stop: { reason: "database" } };
  if (!current) {
    const result = await callClaude(ctx.caller, request);
    if (result.kind === "limit") return { kind: "stop", stop: { reason: "limit", which: result.which } };
    if (result.kind === "credit") return { kind: "stop", stop: { reason: "credit" } };
    if (result.kind === "error") return { kind: "stop", stop: { reason: result.reason } };
    if (!(await saveScore(ctx, p, result.data, ctx.profile.version))) return { kind: "stop", stop: { reason: "database" } };
    return { kind: "done", stage: "scored" };
  }
  if (!(await setStage(ctx, p.id, "scored"))) return { kind: "stop", stop: { reason: "database" } };
  return { kind: "done", stage: "scored" };
}
