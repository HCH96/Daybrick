/** Supabase 주소·키 형식 확인 (R4, R5). 서버에 묻기 전에 앱에서 먼저 거른다. */

/** 주소에서 뽑은 값. url은 끝의 / 를 뗀 `https://<ref>.supabase.co` */
export interface SupabaseAddress {
  url: string;
  ref: string;
}

/** 프로젝트 id(ref)는 영문 소문자·숫자 (보통 20자). 너무 엄격하게 막지 않도록 길이는 넉넉히 둔다. */
const URL_PATTERN = /^https:\/\/([a-z0-9]{10,40})\.supabase\.co\/?$/;

/** 주소 형식이 맞으면 정리한 주소와 ref, 아니면 null */
export function parseSupabaseUrl(input: string): SupabaseAddress | null {
  const match = URL_PATTERN.exec(input.trim().toLowerCase());
  if (!match) return null;
  const ref = match[1];
  return { url: `https://${ref}.supabase.co`, ref };
}

/** 키 종류. secret은 앱에 넣으면 안 되는 키(secret / service_role). */
export type KeyFormat = "anon" | "publishable" | "secret";

const PUBLISHABLE_PATTERN = /^sb_publishable_[A-Za-z0-9_-]+$/;
const SECRET_PATTERN = /^sb_secret_/;
const JWT_PATTERN = /^eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

/** JWT 가운데 부분(payload)의 role. 읽지 못하면 null */
function jwtRole(token: string): string | null {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json: unknown = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "=")));
    if (typeof json === "object" && json !== null && "role" in json && typeof json.role === "string") {
      return json.role;
    }
    return null;
  } catch {
    return null;
  }
}

/** 예전 anon 키(`eyJ…`)와 publishable 키(`sb_publishable_…`)를 받는다. 형식이 아니면 null */
export function keyFormat(input: string): KeyFormat | null {
  const key = input.trim();
  if (SECRET_PATTERN.test(key)) return "secret";
  if (PUBLISHABLE_PATTERN.test(key)) return "publishable";
  if (JWT_PATTERN.test(key)) return jwtRole(key) === "service_role" ? "secret" : "anon";
  return null;
}
