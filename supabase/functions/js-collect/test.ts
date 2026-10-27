// js-collect "test": 시험 수집 (job-search R29, R32). 규칙과 사이트별 값을 받아 목록을 읽고,
// 상세는 처음 5개만 받아 본문이 읽히는지 본다. DB·저장소에는 아무것도 쓰지 않는다.
// 응답: { ok: true, passed, problem, read, fields: { 칸: 읽힌 수 }, sample: TestSample[], ms }
//       { ok: false, reason: "invalid-rule", errors } / { ok: false, reason: "missing-vars", missing }
import {
  judgeList,
  type ListItem,
  missingVars,
  readBodyHtml,
  readDetail,
  readList,
  sleep,
  stringVars,
  validateRule,
} from "../_shared/adapter.ts";
import { json } from "../_shared/cors.ts";

/** 함수 시간 한도보다 넉넉히 일찍 멈춘다 */
const BUDGET_MS = 100_000;
const SAMPLE_SIZE = 5;
/** 읽힘 개수를 세는 칸 (목록 결과 ListItem의 칸) */
const COUNTED_FIELDS = ["id", "title", "company", "link", "duty", "body"] as const;

interface TestSample {
  title: string | null;
  company: string | null;
  link: string | null;
  /** 본문 글자 수·이미지 수. 상세 규칙이 없거나 받지 못했으면 null */
  bodyChars: number | null;
  images: number | null;
  /** 상세를 받지 못한 이유 */
  bodyError: string | null;
}

async function sampleOf(
  item: ListItem,
  read: (item: ListItem) => Promise<{ ok: true; text: string; images: string[] } | { ok: false; reason: string } | null>,
): Promise<TestSample> {
  const base = { title: item.title, company: item.company, link: item.link };
  const detail = await read(item);
  if (!detail) return { ...base, bodyChars: null, images: null, bodyError: null };
  if (!detail.ok) return { ...base, bodyChars: null, images: null, bodyError: detail.reason };
  return { ...base, bodyChars: detail.text.length, images: detail.images.length, bodyError: null };
}

export async function testRule(rawRule: unknown, rawVars: unknown): Promise<Response> {
  const started = Date.now();
  const deadline = started + BUDGET_MS;
  const checked = validateRule(rawRule);
  if (!checked.ok) return json({ ok: false, reason: "invalid-rule", errors: checked.errors });
  const rule = checked.rule;
  const vars = stringVars(rawVars);
  const missing = missingVars(rule, vars);
  if (missing.length > 0) return json({ ok: false, reason: "missing-vars", missing });

  const list = await readList(rule, vars, deadline);
  if (!list.ok) {
    return json({ ok: true, passed: false, problem: list.reason, read: 0, fields: {}, sample: [], ms: Date.now() - started });
  }
  const items = list.items;
  const fields: Record<string, number> = {};
  for (const key of COUNTED_FIELDS) {
    if (rule.list.fields[key]) fields[key] = items.filter((item) => item[key] !== null).length;
  }

  // 상세는 처음 5개만. 바로 앞 요청(목록 또는 앞 상세)과 간격(delayMs)을 둔다 (R37)
  const readOne = async (item: ListItem) => {
    const link = item.link ?? "";
    if (item.body !== null) {
      const body = readBodyHtml(item.body, rule.detail?.images ?? "img", link);
      return { ok: true as const, ...body };
    }
    if (!rule.detail) return null;
    if (Date.now() + rule.delayMs > deadline) return { ok: false as const, reason: "시간이 모자라 건너뜀" };
    await sleep(rule.delayMs);
    const res = await readDetail(rule, { ...vars, id: item.id ?? "", link });
    return res.ok ? { ok: true as const, ...res.detail } : { ok: false as const, reason: res.reason };
  };
  const sample: TestSample[] = [];
  for (const item of items.slice(0, SAMPLE_SIZE)) sample.push(await sampleOf(item, readOne));

  const problem = judgeList(items);
  return json({ ok: true, passed: problem === null, problem, read: items.length, fields, sample, ms: Date.now() - started });
}
