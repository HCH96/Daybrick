// js-profile: 사용자의 프로필 자료를 모아 Opus 5.5로 프로필 초안을 만든다 (job-search R18–R20, R22).
// JWT 확인을 켜고 배포한다. 자료는 서비스 역할로 읽되 항상 호출자 user_id로 거른다.
// 결과는 js_profile_drafts에 넣는다 (저장 전까지 기존 프로필은 그대로, R22).
// 응답: { ok: true } 또는 { ok: false, reason, which? } (reason: no-sources·too-large·limit·credit·missing-key·network·upstream·bad-response·database)
import { encodeBase64 } from "jsr:@std/encoding/base64";
import { callClaude } from "../_shared/ai.ts";
import { getCaller } from "../_shared/auth.ts";
import { handleOptions, json } from "../_shared/cors.ts";
import { PROFILE_SCHEMA, PROFILE_SYSTEM, profileIntro, sourceBlock } from "../_shared/prompts.ts";

const BUCKET = "job-search";
/** PDF 합계 상한 (Anthropic 요청 크기 32MB보다 넉넉히 작게, base64로 늘어나는 것까지 고려) */
const MAX_PDF_BYTES = 20 * 1024 * 1024;

interface SourceRow {
  name: string;
  kind: "pdf" | "md" | "text";
  storage_path: string | null;
  text: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

/** 자료 이름 중 실제로 넣은 자료만 남긴다 (지어낸 출처를 보여주지 않는다) */
function sourcesOf(value: unknown, names: Set<string>): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const v of value) if (typeof v === "string" && names.has(v) && !out.includes(v)) out.push(v);
  return out;
}

function textField(value: unknown, names: Set<string>) {
  const r = isRecord(value) ? value : {};
  const v = str(r.value);
  return { value: v, sources: v === null ? [] : sourcesOf(r.sources, names) };
}

/** AI 결과를 정해진 모양으로 다듬는다. 모르는 칸은 버리고, 빈 값은 null */
function normalizeProfile(raw: unknown, names: Set<string>) {
  const r = isRecord(raw) ? raw : {};
  const skillsRaw = isRecord(r.skills) ? r.skills : {};
  const items = Array.isArray(skillsRaw.items) ? skillsRaw.items : [];
  const skills = items.flatMap((item) => {
    if (!isRecord(item)) return [];
    const name = str(item.name);
    const level = item.level === "high" || item.level === "low" ? item.level : "mid";
    return name ? [{ name, level }] : [];
  });
  const experiences = (Array.isArray(r.experiences) ? r.experiences : []).flatMap((item) => {
    if (!isRecord(item)) return [];
    const title = str(item.title);
    if (!title) return [];
    const tech = Array.isArray(item.tech) ? item.tech.flatMap((t) => (str(t) ? [str(t) as string] : [])) : [];
    return [{
      title,
      period: str(item.period),
      did: str(item.did),
      results: str(item.results),
      tech,
      sources: sourcesOf(item.sources, names),
    }];
  });
  return {
    desiredRoles: textField(r.desiredRoles, names),
    years: textField(r.years, names),
    skills: { items: skills, sources: skills.length ? sourcesOf(skillsRaw.sources, names) : [] },
    experiences,
    education: textField(r.education, names),
    awards: textField(r.awards, names),
    strengths: textField(r.strengths, names),
  };
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  const caller = await getCaller(req);
  if (!caller) return json({ ok: false, reason: "unauthorized" }, 401);

  const rows = await caller.admin
    .from("js_profile_sources")
    .select("name, kind, storage_path, text")
    .eq("user_id", caller.userId)
    .order("created_at");
  if (rows.error) return json({ ok: false, reason: "database" });
  const sources = (rows.data ?? []) as SourceRow[];
  if (sources.length === 0) return json({ ok: false, reason: "no-sources" });

  // 자료마다 내용 블록 하나: PDF는 문서 블록(base64), 글은 <source> 데이터 칸
  const content: Record<string, unknown>[] = [];
  let pdfBytes = 0;
  for (const source of sources) {
    if (source.kind === "pdf") {
      if (!source.storage_path) continue;
      const file = await caller.admin.storage.from(BUCKET).download(source.storage_path);
      if (file.error || !file.data) return json({ ok: false, reason: "database" });
      const bytes = new Uint8Array(await file.data.arrayBuffer());
      pdfBytes += bytes.byteLength;
      if (pdfBytes > MAX_PDF_BYTES) return json({ ok: false, reason: "too-large" });
      content.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: encodeBase64(bytes) },
        title: source.name,
      });
    } else {
      content.push({ type: "text", text: sourceBlock(source.name, source.kind, source.text ?? "") });
    }
  }
  const names = sources.map((s) => s.name);
  content.push({ type: "text", text: profileIntro(names) });

  const result = await callClaude(caller, {
    task: "profile",
    model: "claude-opus-5-5",
    system: PROFILE_SYSTEM,
    content,
    schema: PROFILE_SCHEMA,
    maxTokens: 8192,
  });
  if (result.kind === "limit") return json({ ok: false, reason: "limit", which: result.which });
  if (result.kind === "credit") return json({ ok: false, reason: "credit" });
  if (result.kind === "error") return json({ ok: false, reason: result.reason });

  const data = normalizeProfile(result.data, new Set(names));
  const saved = await caller.admin
    .from("js_profile_drafts")
    .upsert({ user_id: caller.userId, data, created_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (saved.error) return json({ ok: false, reason: "database" });
  return json({ ok: true });
});
