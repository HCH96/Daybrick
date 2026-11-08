/**
 * 키를 정렬한 JSON 문자열과 그 해시 (D8).
 * 객체 키 순서만 달라진 내용은 같은 문자열·해시가 되고, 배열 순서는 그대로 둔다.
 * 순수 함수라서 Node로도 실행해 확인할 수 있다 (가져오는 모듈 없음).
 */

/** JSON.stringify와 같은 규칙(undefined·함수 칸은 빠짐, 배열 안에서는 null)으로, 객체 키만 정렬한다 */
export function stableStringify(value: unknown): string {
  return stringifyValue(value) ?? "null";
}

function stringifyValue(value: unknown): string | undefined {
  if (value === null) return "null";
  if (typeof value === "undefined" || typeof value === "function" || typeof value === "symbol") {
    return undefined;
  }
  if (typeof value !== "object") return JSON.stringify(value);

  const withJson = value as { toJSON?: () => unknown };
  if (typeof withJson.toJSON === "function") return stringifyValue(withJson.toJSON());

  if (Array.isArray(value)) {
    return `[${value.map((item) => stringifyValue(item) ?? "null").join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const parts: string[] = [];
  for (const key of Object.keys(record).sort()) {
    const text = stringifyValue(record[key]);
    if (text !== undefined) parts.push(`${JSON.stringify(key)}:${text}`);
  }
  return `{${parts.join(",")}}`;
}

/** 키를 정렬한 JSON의 SHA-256 해시 (16진수 소문자 64자) */
export async function hashOf(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(stableStringify(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
