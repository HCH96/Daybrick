/**
 * 어댑터 규칙 파일 형식 v1을 앱에서 먼저 검사한다 (R29, D16, D30).
 * 서버 `supabase/functions/_shared/adapter.ts`의 `validateRule`과 같은 필수 칸·같은 순서로 본다.
 * 서버 쪽을 바꾸면 이 파일도 같이 바꾼다.
 */

export type RuleCheck = { ok: true; rule: Record<string, unknown>; vars: string[] } | { ok: false; errors: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringMap(value: unknown): boolean {
  return isRecord(value) && Object.values(value).every((v) => typeof v === "string");
}

function checkRequest(where: string, raw: Record<string, unknown>, errors: string[]) {
  if (typeof raw.url !== "string" || raw.url.trim() === "") errors.push(`${where}.url이 없어요`);
  if (raw.method !== undefined && raw.method !== "GET" && raw.method !== "POST") {
    errors.push(`${where}.method는 GET 또는 POST여야 해요`);
  }
  if (raw.type !== "html" && raw.type !== "json") errors.push(`${where}.type은 html 또는 json이어야 해요`);
  if (raw.headers !== undefined && !isStringMap(raw.headers)) errors.push(`${where}.headers는 글자 값만 든 객체여야 해요`);
}

function checkFields(fields: Record<string, unknown>, errors: string[]) {
  if (!isRecord(fields.title)) errors.push("list.fields.title이 없어요");
  if (!isRecord(fields.link)) errors.push("list.fields.link가 없어요");
  for (const [key, field] of Object.entries(fields)) {
    if (!isRecord(field)) {
      errors.push(`list.fields.${key}는 객체여야 해요`);
    } else if (typeof field.regex === "string") {
      try {
        new RegExp(field.regex);
      } catch {
        errors.push(`list.fields.${key}.regex가 올바른 정규식이 아니에요`);
      }
    }
  }
}

function checkFrame(detail: Record<string, unknown>, errors: string[]) {
  if (detail.frame === undefined) return;
  if (typeof detail.frame !== "string" || detail.frame.trim() === "") errors.push("detail.frame은 선택자 글자여야 해요");
  else if (detail.type !== "html") errors.push("detail.frame은 detail.type이 html일 때만 쓸 수 있어요");
}

/** 규칙 형식 검사. 맞으면 규칙과 사이트별 값 이름, 아니면 고칠 점 목록 */
export function checkRule(raw: unknown): RuleCheck {
  const errors: string[] = [];
  if (!isRecord(raw)) return { ok: false, errors: ["규칙이 JSON 객체가 아니에요"] };
  if (raw.format !== 1) errors.push("format은 1이어야 해요");
  if (typeof raw.name !== "string" || raw.name.trim() === "") errors.push("name이 없어요");
  const varsOk = raw.vars === undefined || (Array.isArray(raw.vars) && raw.vars.every((v) => typeof v === "string"));
  if (!varsOk) errors.push("vars는 글자 배열이어야 해요");
  if (raw.delayMs !== undefined && (typeof raw.delayMs !== "number" || raw.delayMs < 0)) {
    errors.push("delayMs는 0 이상의 숫자여야 해요");
  }
  const list = raw.list;
  if (!isRecord(list)) {
    errors.push("list가 없어요");
  } else {
    checkRequest("list", list, errors);
    if (typeof list.item !== "string" || list.item.trim() === "") errors.push("list.item이 없어요");
    if (list.pages !== undefined && (typeof list.pages !== "number" || list.pages < 1)) {
      errors.push("list.pages는 1 이상의 숫자여야 해요");
    }
    if (!isRecord(list.fields)) errors.push("list.fields가 없어요");
    else checkFields(list.fields, errors);
  }
  if (raw.detail !== undefined) {
    if (!isRecord(raw.detail)) errors.push("detail은 객체여야 해요");
    else {
      checkRequest("detail", raw.detail, errors);
      checkFrame(raw.detail, errors);
    }
  }
  if (errors.length > 0) return { ok: false, errors };
  const vars = Array.isArray(raw.vars) ? raw.vars.filter((v): v is string => typeof v === "string") : [];
  return { ok: true, rule: raw, vars };
}

/** 올린 파일 글을 JSON으로 읽고 형식을 검사한다 */
export function checkRuleText(text: string): RuleCheck {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    const detail = e instanceof Error ? e.message : "";
    return { ok: false, errors: [`JSON 문법이 맞지 않아요${detail ? ` (${detail})` : ""}`] };
  }
  return checkRule(parsed);
}

/** 규칙의 이름 (형식 검사를 통과한 규칙) */
export function ruleName(rule: Record<string, unknown>): string {
  return typeof rule.name === "string" ? rule.name : "";
}
