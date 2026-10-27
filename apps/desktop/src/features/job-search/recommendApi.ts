import type { ApiResult } from "../server/management";
import type { ServerSession } from "../server/session";
import { PAGE_SIZE, functionError, isRecord, postgrestError, toNumber } from "./api";
import { toGrade, type GradeId } from "./grade";

/** 추천 공고 탭 서버 읽기와 `js-process` 다시 채점 (R4–R8, R23). 도우미는 api.ts의 것을 같이 쓴다 */

/** 추천 카드 한 장에 쓰는 공고 (`scored` + 점수 + 추출 결과 일부, D36) */
export interface RecommendPosting {
  id: string;
  company: string | null;
  title: string | null;
  url: string | null;
  /** 수집한 사이트 이름. 사이트를 지웠으면 null */
  siteName: string | null;
  collectedAt: string;
  score: number;
  grade: GradeId;
  profileVersion: number;
  experience: string | null;
  employment: string[];
  location: string | null;
  /** 마감일 `YYYY-MM-DD`. 없으면 null (상시) */
  deadlineDate: string | null;
}

export interface RecommendState {
  postings: RecommendPosting[];
  /** 마지막 수집 시각 (`js_collect_runs` 최근 행). 수집한 적 없으면 null */
  lastCollectAt: string | null;
  /** 켜진 사이트 중 마지막 수집이 실패한 곳 수 */
  failedSites: number;
  /** 한도 때문에 채점이 미뤄진 공고 수 (`stage = waiting`, R7) */
  waiting: number;
  /** 지원 안 함 보관함 공고 수 (R9, D11) */
  archived: number;
  /** 걸러진 공고 수 (1차·2차 필터·인젝션 의심, R46) */
  filtered: number;
}

/** 1:1 관계 끼워 읽기는 객체 하나(또는 null)로 오지만, 배열로 와도 받는다 */
function one(value: unknown): Record<string, unknown> | null {
  const item: unknown = Array.isArray(value) ? value[0] : value;
  return isRecord(item) ? item : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function parseRecommend(row: Record<string, unknown>): RecommendPosting | null {
  if (typeof row.id !== "string" || typeof row.collected_at !== "string") return null;
  const score = one(row.js_scores);
  const points = score ? toNumber(score.score) : null;
  const version = score ? toNumber(score.profile_version) : null;
  if (!score || points === null || version === null) return null;
  const fields = one(one(row.js_extractions)?.fields) ?? {};
  const experience = isRecord(fields.experience) ? text(fields.experience.text) : null;
  const deadline = isRecord(fields.deadline) ? text(fields.deadline.date) : null;
  const employment = Array.isArray(fields.employment)
    ? fields.employment.filter((e): e is string => typeof e === "string" && e.trim() !== "")
    : [];
  return {
    id: row.id,
    company: text(row.company),
    title: text(row.title),
    url: text(row.url),
    siteName: text(one(row.js_sites)?.name),
    collectedAt: row.collected_at,
    score: points,
    grade: toGrade(score.grade, points),
    profileVersion: version,
    experience,
    employment,
    location: text(fields.location),
    deadlineDate: deadline,
  };
}

/** 채점이 끝났고 숨김·지원하지 않은 공고 (R4, R16). 마감·정렬은 화면에서 (sortPostings.ts) */
async function loadScored(session: ServerSession): Promise<ApiResult<RecommendPosting[]>> {
  const postings: RecommendPosting[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error, status } = await session.client
      .from("js_postings")
      .select(
        "id, company, title, url, collected_at, js_sites(name), js_scores(score, grade, profile_version), js_extractions(fields)",
      )
      .eq("stage", "scored")
      .is("hidden_at", null)
      .is("applied_at", null)
      .order("collected_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) return { ok: false, error: postgrestError(error, status) };
    const rows: unknown[] = data ?? [];
    for (const row of rows) {
      if (!isRecord(row)) return { ok: false, error: "bad-response" };
      // 점수 행이 아직 안 보이는 공고(저장 사이)는 건너뛴다
      const posting = parseRecommend(row);
      if (posting) postings.push(posting);
    }
    if (rows.length < PAGE_SIZE) return { ok: true, value: postings };
  }
}

/** 추천 공고 탭 데이터를 한 번에 읽는다 */
export async function loadRecommend(session: ServerSession): Promise<ApiResult<RecommendState>> {
  const count = () => session.client.from("js_postings").select("id", { count: "exact", head: true });
  const [postings, lastRun, sites, waiting, archived, filtered] = await Promise.all([
    loadScored(session),
    session.client.from("js_collect_runs").select("at").order("at", { ascending: false }).limit(1).maybeSingle(),
    session.client.from("js_sites").select("last_result").eq("enabled", true),
    count().eq("stage", "waiting").is("hidden_at", null),
    count().not("hidden_at", "is", null).is("applied_at", null),
    count().in("stage", ["filtered1", "filtered2", "suspect"]).is("hidden_at", null).is("applied_at", null),
  ]);
  if (!postings.ok) return postings;
  if (lastRun.error) return { ok: false, error: postgrestError(lastRun.error, lastRun.status) };
  if (sites.error) return { ok: false, error: postgrestError(sites.error, sites.status) };
  for (const r of [waiting, archived, filtered]) {
    if (r.error) return { ok: false, error: postgrestError(r.error, r.status) };
  }
  const run: unknown = lastRun.data;
  const siteRows: unknown[] = sites.data ?? [];
  const failedSites = siteRows.filter((s) => isRecord(s) && isRecord(s.last_result) && s.last_result.ok === false).length;
  return {
    ok: true,
    value: {
      postings: postings.value,
      lastCollectAt: isRecord(run) && typeof run.at === "string" ? run.at : null,
      failedSites,
      waiting: waiting.count ?? 0,
      archived: archived.count ?? 0,
      filtered: filtered.count ?? 0,
    },
  };
}

/** `js-process`가 멈춘 이유 (D37) */
export type ProcessStop =
  | { reason: "limit"; which: "daily" | "monthly" }
  | { reason: "credit" | "no-profile" | "time" | "missing-key" | "network" | "upstream" | "database" };

const STOP_REASONS = ["credit", "no-profile", "time", "missing-key", "network", "upstream", "database"] as const;

export interface ProcessResult {
  /** 이번 호출에서 끝낸 공고 수 */
  done: number;
  stopped: ProcessStop | null;
  /** 아직 남은 대상 공고 수 */
  remaining: number;
}

function parseStop(value: unknown): ProcessStop | null {
  if (!isRecord(value)) return null;
  if (value.reason === "limit") return { reason: "limit", which: value.which === "monthly" ? "monthly" : "daily" };
  return { reason: STOP_REASONS.find((r) => r === value.reason) ?? "upstream" };
}

/** 이전 프로필 기준 점수를 지금 프로필로 다시 채점한다 (R23, `js-process { mode: "rescore" }` 한 번 부르기) */
export async function rescoreOnce(session: ServerSession): Promise<ApiResult<ProcessResult>> {
  const { data, error } = await session.client.functions.invoke<unknown>("js-process", { body: { mode: "rescore" } });
  if (error) return { ok: false, error: functionError(error) };
  if (!isRecord(data) || data.ok !== true) return { ok: false, error: "bad-response" };
  return {
    ok: true,
    value: {
      done: Array.isArray(data.done) ? data.done.length : 0,
      stopped: parseStop(data.stopped),
      remaining: toNumber(data.remaining) ?? 0,
    },
  };
}
