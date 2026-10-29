// 서버 함수 공용: 어댑터 규칙의 세션 준비 `list.session` (job-search R25, D50).
// 목록 API가 세션 쿠키·CSRF 토큰을 요구하는 사이트(엔씨소프트)를 위해, 목록 첫 쪽 전에 화면을 한 번 받아
// Set-Cookie와 토큰을 목록 요청 헤더로 만든다. 상세 요청에는 붙이지 않는다.

export interface SessionRule {
  /** 먼저 GET으로 받을 화면 주소. {이름}에 사이트 값이 들어간다 */
  url: string;
  /** 화면 HTML에서 토큰을 뽑아 헤더로 붙인다 (선택) */
  token?: { regex: string; header: string };
}

export type SessionResult = { ok: true; headers: Record<string, string> } | { ok: false; reason: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** list.session 형식 검사. 없으면 아무것도 하지 않는다 */
export function checkSession(raw: unknown, errors: string[]) {
  if (raw === undefined) return;
  if (!isRecord(raw)) {
    errors.push("list.session은 객체입니다");
    return;
  }
  if (typeof raw.url !== "string" || raw.url.trim() === "") errors.push("list.session.url이 없습니다");
  if (raw.token === undefined) return;
  if (!isRecord(raw.token)) {
    errors.push("list.session.token은 객체입니다");
    return;
  }
  const { regex, header } = raw.token;
  if (typeof regex !== "string" || regex === "") errors.push("list.session.token.regex가 없습니다");
  else {
    try {
      new RegExp(regex);
    } catch {
      errors.push("list.session.token.regex가 올바른 정규식이 아닙니다");
    }
  }
  if (typeof header !== "string" || header.trim() === "") errors.push("list.session.token.header가 없습니다");
}

/** 세션 화면을 받아 목록 요청에 붙일 헤더(Cookie, 토큰)를 만든다. url은 값이 채워진 주소 */
export async function prepareSession(
  url: string,
  session: SessionRule,
  userAgent: string,
  timeoutMs: number,
): Promise<SessionResult> {
  let res: Response;
  let text: string;
  try {
    res = await fetch(url, { headers: { "User-Agent": userAgent }, signal: AbortSignal.timeout(timeoutMs) });
    text = await res.text();
  } catch (e) {
    return { ok: false, reason: `세션 준비 실패 (${e instanceof Error ? e.message : "요청 실패"})` };
  }
  if (!res.ok) return { ok: false, reason: `세션 준비 실패 (HTTP ${res.status})` };
  const headers: Record<string, string> = {};
  const cookie = res.headers.getSetCookie().map((c) => c.split(";")[0].trim()).filter((c) => c.includes("=")).join("; ");
  if (cookie !== "") headers.Cookie = cookie;
  if (session.token) {
    const match = new RegExp(session.token.regex).exec(text);
    const value = (match?.[1] ?? match?.[0] ?? "").trim();
    if (value === "") return { ok: false, reason: "세션 토큰을 찾지 못함" };
    headers[session.token.header] = value;
  }
  return { ok: true, headers };
}
