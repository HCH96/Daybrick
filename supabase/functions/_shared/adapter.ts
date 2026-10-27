// 서버 함수 공용: 어댑터 규칙 형식 v1 검사와 실행 (job-search R25, R37, D16, D30).
// 규칙은 데이터(JSON)라 사이트를 더해도 함수를 다시 배포하지 않는다. HTML은 CSS 선택자, JSON은 점 경로로 읽는다.
import { DOMParser, type Element } from "jsr:@b-fuze/deno-dom@0.1.56";

export interface FieldRule {
  /** HTML: 항목 안 CSS 선택자(없으면 항목 자체). JSON: 항목 기준 점 경로 */
  sel?: string;
  attr?: string;
  regex?: string;
  base?: string;
  optional?: boolean;
}

export interface RequestRule {
  url: string;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  /** 문자열이면 폼 본문(값은 주소 인코딩), 객체면 JSON 본문 */
  body?: string | Record<string, unknown>;
  type: "html" | "json";
}

export interface ListRule extends RequestRule {
  pages?: number;
  item: string;
  fields: Record<string, FieldRule>;
}

export interface DetailRule {
  url: string;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  type: "html" | "json";
  /** HTML: 본문 CSS 선택자(기본 body). JSON: 본문 HTML 문자열의 경로 */
  body?: string;
  /** 본문 안 이미지 선택자(기본 img) */
  images?: string;
}

export interface AdapterRule {
  format: 1;
  name: string;
  vars: string[];
  delayMs: number;
  list: ListRule;
  detail?: DetailRule;
}

/** 목록에서 읽은 공고 하나. 필수 칸이 빠졌으면 null */
export interface ListItem {
  id: string | null;
  title: string | null;
  company: string | null;
  link: string | null;
  duty: string | null;
  /** 목록이 본문을 함께 주는 사이트(넥슨)의 본문 HTML */
  body: string | null;
}

export interface DetailResult {
  text: string;
  images: string[];
}

export type ListResult =
  | { ok: true; items: ListItem[] }
  | { ok: false; reason: string };

const DEFAULT_DELAY_MS = 1500;
const MAX_PAGES = 10;
const FETCH_TIMEOUT_MS = 20_000;
const USER_AGENT = "Mozilla/5.0 (compatible; Daybrick/1.0; personal job tracker)";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringMap(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((v) => typeof v === "string");
}

function checkRequest(where: string, raw: Record<string, unknown>, errors: string[]) {
  if (typeof raw.url !== "string" || raw.url.trim() === "") errors.push(`${where}.url이 없습니다`);
  if (raw.method !== undefined && raw.method !== "GET" && raw.method !== "POST") {
    errors.push(`${where}.method는 GET 또는 POST입니다`);
  }
  if (raw.type !== "html" && raw.type !== "json") errors.push(`${where}.type은 html 또는 json입니다`);
  if (raw.headers !== undefined && !isStringMap(raw.headers)) errors.push(`${where}.headers는 문자열 값 객체입니다`);
}

/** 규칙 형식 검사. 맞으면 규칙, 아니면 고칠 점 목록 (R29의 형식 검사도 이것을 쓴다) */
export function validateRule(raw: unknown): { ok: true; rule: AdapterRule } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!isRecord(raw)) return { ok: false, errors: ["규칙이 JSON 객체가 아닙니다"] };
  if (raw.format !== 1) errors.push("format은 1이어야 합니다");
  if (typeof raw.name !== "string" || raw.name.trim() === "") errors.push("name이 없습니다");
  if (raw.vars !== undefined && !(Array.isArray(raw.vars) && raw.vars.every((v) => typeof v === "string"))) {
    errors.push("vars는 문자열 배열입니다");
  }
  if (raw.delayMs !== undefined && (typeof raw.delayMs !== "number" || raw.delayMs < 0)) {
    errors.push("delayMs는 0 이상의 숫자입니다");
  }
  const list = raw.list;
  if (!isRecord(list)) {
    errors.push("list가 없습니다");
  } else {
    checkRequest("list", list, errors);
    if (typeof list.item !== "string" || list.item.trim() === "") errors.push("list.item이 없습니다");
    if (list.pages !== undefined && (typeof list.pages !== "number" || list.pages < 1)) {
      errors.push("list.pages는 1 이상의 숫자입니다");
    }
    const fields = list.fields;
    if (!isRecord(fields)) {
      errors.push("list.fields가 없습니다");
    } else {
      if (!isRecord(fields.title)) errors.push("list.fields.title이 없습니다");
      if (!isRecord(fields.link)) errors.push("list.fields.link가 없습니다");
      for (const [key, field] of Object.entries(fields)) {
        if (!isRecord(field)) errors.push(`list.fields.${key}는 객체입니다`);
        else if (typeof field.regex === "string") {
          try {
            new RegExp(field.regex);
          } catch {
            errors.push(`list.fields.${key}.regex가 올바른 정규식이 아닙니다`);
          }
        }
      }
    }
  }
  if (raw.detail !== undefined) {
    if (!isRecord(raw.detail)) errors.push("detail은 객체입니다");
    else checkRequest("detail", raw.detail, errors);
  }
  if (errors.length > 0) return { ok: false, errors };
  const rule = raw as unknown as AdapterRule;
  return {
    ok: true,
    rule: { ...rule, vars: rule.vars ?? [], delayMs: rule.delayMs ?? DEFAULT_DELAY_MS },
  };
}

/** 사이트 값 중 규칙이 요구하는데 비어 있는 이름 */
export function missingVars(rule: AdapterRule, vars: Record<string, string>): string[] {
  return rule.vars.filter((name) => !vars[name]);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** `{이름}`을 값으로 바꾼다. 모르는 이름은 그대로 둔다 */
export function fillTemplate(text: string, values: Record<string, string>, encode = false): string {
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const value = values[name];
    if (value === undefined) return whole;
    return encode ? encodeURIComponent(value) : value;
  });
}

function fillJson(value: unknown, values: Record<string, string>): unknown {
  if (typeof value === "string") {
    const only = /^\{(\w+)\}$/.exec(value);
    if (only && values[only[1]] !== undefined) {
      const v = values[only[1]];
      return /^\d+$/.test(v) ? Number(v) : v;
    }
    return fillTemplate(value, values);
  }
  if (Array.isArray(value)) return value.map((v) => fillJson(v, values));
  if (isRecord(value)) return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillJson(v, values)]));
  return value;
}

/** 규칙의 요청 하나를 보낸다. 응답 글 또는 실패 이유 */
async function send(req: RequestRule | DetailRule, values: Record<string, string>, extra?: { body?: RequestRule["body"] }) {
  const method = req.method ?? "GET";
  const headers: Record<string, string> = { "User-Agent": USER_AGENT };
  let body: string | undefined;
  const rawBody = extra?.body;
  if (method === "POST" && rawBody !== undefined) {
    if (typeof rawBody === "string") {
      body = fillTemplate(rawBody, values, true);
      headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
    } else {
      body = JSON.stringify(fillJson(rawBody, values));
      headers["Content-Type"] = "application/json";
    }
  }
  Object.assign(headers, req.headers ?? {});
  try {
    const res = await fetch(fillTemplate(req.url, values), {
      method,
      headers,
      body,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const text = await res.text();
    if (!res.ok) return { ok: false as const, reason: `HTTP ${res.status}` };
    return { ok: true as const, text };
  } catch (e) {
    return { ok: false as const, reason: e instanceof Error ? e.message : "요청 실패" };
  }
}

/** 점 경로(`$.a.b[*].c`)로 값을 찾는다. `[*]`는 배열을 펼친다 */
export function jsonPath(root: unknown, path: string): unknown[] {
  const parts = path.replace(/^\$\.?/, "").split(".").filter((p) => p !== "");
  let current: unknown[] = [root];
  for (const part of parts) {
    const spread = part.endsWith("[*]");
    const key = spread ? part.slice(0, -3) : part;
    const next: unknown[] = [];
    for (const value of current) {
      const v = key === "" ? value : isRecord(value) ? value[key] : undefined;
      if (v === undefined || v === null) continue;
      if (spread) {
        if (Array.isArray(v)) next.push(...v);
      } else next.push(v);
    }
    current = next;
  }
  return current;
}

function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function applyField(raw: string | null, field: FieldRule): string | null {
  if (raw === null) return null;
  let value = raw.trim();
  if (field.regex) {
    const match = new RegExp(field.regex).exec(value);
    if (!match) return null;
    value = (match[1] ?? match[0]).trim();
  }
  if (field.base && value !== "") {
    try {
      value = new URL(value, field.base).href;
    } catch {
      return null;
    }
  }
  return value === "" ? null : value;
}

function htmlField(item: Element, field: FieldRule): string | null {
  const el = field.sel ? item.querySelector(field.sel) : item;
  if (!el) return null;
  const raw = field.attr ? el.getAttribute(field.attr) : collapse(el.textContent ?? "");
  return applyField(raw, field);
}

function jsonField(item: unknown, field: FieldRule): string | null {
  const [value] = field.sel ? jsonPath(item, field.sel) : [item];
  if (typeof value === "string") return applyField(value, field);
  if (typeof value === "number" || typeof value === "boolean") return applyField(String(value), field);
  return null;
}

function toItem(read: (field: FieldRule) => string | null, fields: Record<string, FieldRule>): ListItem {
  const get = (key: string) => (fields[key] ? read(fields[key]) : null);
  return {
    id: get("id"),
    title: get("title"),
    company: get("company"),
    link: get("link"),
    duty: get("duty"),
    body: get("body"),
  };
}

function parseItems(list: ListRule, text: string): ListItem[] | string {
  if (list.type === "json") {
    let root: unknown;
    try {
      root = JSON.parse(text);
    } catch {
      return "목록 응답이 JSON이 아닙니다";
    }
    return jsonPath(root, list.item).map((item) => toItem((f) => jsonField(item, f), list.fields));
  }
  const doc = new DOMParser().parseFromString(text, "text/html");
  if (!doc) return "목록 HTML을 읽지 못했습니다";
  const nodes = Array.from(doc.querySelectorAll(list.item)) as Element[];
  return nodes.map((item) => toItem((f) => htmlField(item, f), list.fields));
}

function itemKey(item: ListItem): string {
  return item.id ?? item.link ?? `${item.company ?? ""}|${item.title ?? ""}`;
}

/** 목록 쪽을 차례로 읽는다 (R37: 요청 사이 delayMs). 쪽이 비거나 새 항목이 없으면 멈춘다 */
export async function readList(rule: AdapterRule, vars: Record<string, string>, deadline: number): Promise<ListResult> {
  const list = rule.list;
  const paged = list.url.includes("{page}") || JSON.stringify(list.body ?? "").includes("{page}");
  const pages = paged ? Math.min(list.pages ?? 1, MAX_PAGES) : 1;
  const items: ListItem[] = [];
  const seen = new Set<string>();
  for (let page = 1; page <= pages; page++) {
    if (page > 1) {
      if (Date.now() + rule.delayMs > deadline) break;
      await sleep(rule.delayMs);
    }
    const res = await send(list, { ...vars, page: String(page) }, { body: list.body });
    if (!res.ok) {
      if (page === 1) return { ok: false, reason: `목록을 읽지 못함 (${res.reason})` };
      break;
    }
    const parsed = parseItems(list, res.text);
    if (typeof parsed === "string") {
      if (page === 1) return { ok: false, reason: parsed };
      break;
    }
    const fresh = parsed.filter((item) => {
      const key = itemKey(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (fresh.length === 0) break;
    items.push(...fresh);
  }
  return { ok: true, items };
}

const BLOCK_TAGS = new Set([
  "P", "DIV", "BR", "LI", "TR", "H1", "H2", "H3", "H4", "H5", "H6", "TABLE", "UL", "OL", "SECTION", "ARTICLE", "DT", "DD",
]);

/** 요소의 글을 줄바꿈을 살려 뽑는다 (script·style 제외) */
function blockText(root: Element): string {
  const out: string[] = [];
  const walk = (node: Element) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 3) {
        out.push((child.textContent ?? "").replace(/\s+/g, " "));
      } else if (child.nodeType === 1) {
        const el = child as unknown as Element;
        if (el.tagName === "SCRIPT" || el.tagName === "STYLE" || el.tagName === "NOSCRIPT") continue;
        const block = BLOCK_TAGS.has(el.tagName);
        if (block) out.push("\n");
        walk(el);
        if (block) out.push("\n");
      }
    }
  };
  walk(root);
  return out.join("").split("\n").map((line) => line.trim()).filter((line) => line !== "").join("\n");
}

/** 본문 HTML에서 글과 이미지 주소를 뽑는다 */
export function readBodyHtml(html: string, imagesSel: string, baseUrl: string): DetailResult {
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc || !doc.body) return { text: "", images: [] };
  return readBodyElement(doc.body as unknown as Element, imagesSel, baseUrl);
}

function readBodyElement(el: Element, imagesSel: string, baseUrl: string): DetailResult {
  const images: string[] = [];
  for (const img of Array.from(el.querySelectorAll(imagesSel)) as Element[]) {
    const src = img.getAttribute("src") ?? img.getAttribute("data-src");
    if (!src || src.startsWith("data:")) continue;
    try {
      const href = new URL(src, baseUrl).href;
      if (!images.includes(href)) images.push(href);
    } catch {
      // 주소가 아니면 건너뛴다
    }
  }
  return { text: blockText(el), images };
}

/** 상세 쪽을 읽어 본문 글과 이미지 주소를 돌려준다. 상세 규칙이 없으면 빈 본문 */
export async function readDetail(
  rule: AdapterRule,
  values: Record<string, string>,
): Promise<{ ok: true; detail: DetailResult } | { ok: false; reason: string }> {
  const detail = rule.detail;
  if (!detail) return { ok: true, detail: { text: "", images: [] } };
  const url = fillTemplate(detail.url, values);
  const res = await send(detail, values);
  if (!res.ok) return { ok: false, reason: res.reason };
  const imagesSel = detail.images ?? "img";
  if (detail.type === "json") {
    let root: unknown;
    try {
      root = JSON.parse(res.text);
    } catch {
      return { ok: false, reason: "상세 응답이 JSON이 아닙니다" };
    }
    const [html] = jsonPath(root, detail.body ?? "$");
    return { ok: true, detail: readBodyHtml(typeof html === "string" ? html : "", imagesSel, url) };
  }
  const doc = new DOMParser().parseFromString(res.text, "text/html");
  if (!doc) return { ok: false, reason: "상세 HTML을 읽지 못했습니다" };
  const el = doc.querySelector(detail.body ?? "body");
  if (!el) return { ok: true, detail: { text: "", images: [] } };
  return { ok: true, detail: readBodyElement(el as unknown as Element, imagesSel, url) };
}
