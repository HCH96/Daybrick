// js-process: 공고 하나의 단계별 처리 (job-search R41, R44, R48–R53).
// 1차 필터 → 추출(+인젝션 검사) → 2차 필터 → 채점. 결과 저장은 모두 호출자 user_id로 거른다.
import { encodeBase64 } from "jsr:@std/encoding/base64";
import { callClaude } from "../_shared/ai.ts";
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
import { guardText } from "./guard.ts";

const BUCKET = "job-search";
/** 추출에 붙이는 이미지 합계 상한 (base64로 늘어나도 요청 크기 32MB 안) */
const MAX_IMAGE_TOTAL = 15 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

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

/** 이번 실행에서 같이 쓰는 값: 필터 조건과 지금 프로필 */
export interface Context {
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
  | { reason: "missing-key" | "network" | "upstream" | "bad-response" | "database" };

export type StepResult = { kind: "done"; stage: string } | { kind: "stop"; stop: Stop };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function meta(p: PostingRow): PostingMeta {
  return { title: p.title, company: p.company, duty: p.duty, collectedAt: p.collected_at };
}

export async function setStage(ctx: Context, id: string, stage: string, hits: FilterHit[] | null = null) {
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

/** 공고 이미지를 이미지 블록으로 읽는다 (본문이 이미지인 공고, R38) */
async function imageBlocks(ctx: Context, paths: string[]): Promise<Record<string, unknown>[]> {
  const blocks: Record<string, unknown>[] = [];
  let total = 0;
  for (const path of paths) {
    const type = IMAGE_TYPES[path.split(".").pop()?.toLowerCase() ?? ""];
    if (!type) continue;
    const file = await ctx.caller.admin.storage.from(BUCKET).download(path);
    if (file.error || !file.data) continue;
    const bytes = new Uint8Array(await file.data.arrayBuffer());
    if (total + bytes.byteLength > MAX_IMAGE_TOTAL) break;
    total += bytes.byteLength;
    blocks.push({ type: "image", source: { type: "base64", media_type: type, data: encodeBase64(bytes) } });
  }
  return blocks;
}

function strings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim() !== "").map((v) => v.trim());
}

/** 추출 + 인젝션 검사 (R48–R50). 이미 있으면 그것을 돌려준다 */
export async function extract(ctx: Context, p: PostingRow): Promise<Extraction | { stop: Stop }> {
  const saved = await ctx.caller.admin.from("js_extractions").select("fields, suspect")
    .eq("posting_id", p.id).eq("user_id", ctx.caller.userId).maybeSingle();
  if (saved.error) return { stop: { reason: "database" } };
  if (saved.data) return { fields: saved.data.fields, suspect: saved.data.suspect === true };

  const guard = guardText(p.body_text ?? "");
  const images = await imageBlocks(ctx, p.image_paths ?? []);
  const result = await callClaude(ctx.caller, {
    task: "extract",
    model: "claude-haiku-5-5",
    system: EXTRACT_SYSTEM,
    content: [...images, { type: "text", text: postingBlock(meta(p), guard.text, images.length) }],
    schema: EXTRACT_SCHEMA,
    maxTokens: 4096,
  });
  if (result.kind === "limit") return { stop: { reason: "limit", which: result.which } };
  if (result.kind === "credit") return { stop: { reason: "credit" } };
  if (result.kind === "error") return { stop: { reason: result.reason } };

  const data = isRecord(result.data) ? result.data : {};
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
  if (stored.error) return { stop: { reason: "database" } };
  return { fields, suspect };
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

/** 적합도 채점 (R51). 같은 프로필 버전의 점수가 있으면 다시 부르지 않는다 (R53) */
export async function score(ctx: Context, p: PostingRow, fields: unknown): Promise<StepResult> {
  if (!ctx.profile) return { kind: "stop", stop: { reason: "no-profile" } };
  const saved = await ctx.caller.admin.from("js_scores").select("profile_version")
    .eq("posting_id", p.id).eq("user_id", ctx.caller.userId).maybeSingle();
  if (saved.error) return { kind: "stop", stop: { reason: "database" } };
  if (saved.data?.profile_version !== ctx.profile.version) {
    const result = await callClaude(ctx.caller, {
      task: "score",
      model: "claude-opus-5-5",
      system: SCORE_SYSTEM,
      content: scoreContent(ctx.profile.data, meta(p), fields),
      schema: SCORE_SCHEMA,
      maxTokens: 2048,
    });
    if (result.kind === "limit") return { kind: "stop", stop: { reason: "limit", which: result.which } };
    if (result.kind === "credit") return { kind: "stop", stop: { reason: "credit" } };
    if (result.kind === "error") return { kind: "stop", stop: { reason: result.reason } };
    const data = isRecord(result.data) ? result.data : {};
    const total = totalOf(data.parts);
    const stored = await ctx.caller.admin.from("js_scores").upsert({
      posting_id: p.id,
      user_id: ctx.caller.userId,
      profile_version: ctx.profile.version,
      score: total,
      grade: gradeOf(total),
      strengths: reasons(data.strengths),
      gaps: reasons(data.gaps),
      summary: typeof data.summary === "string" ? data.summary.trim() : "",
    }, { onConflict: "posting_id" });
    if (stored.error) return { kind: "stop", stop: { reason: "database" } };
  }
  if (!(await setStage(ctx, p.id, "scored"))) return { kind: "stop", stop: { reason: "database" } };
  return { kind: "done", stage: "scored" };
}
