// 서버 함수 공용: 같은 공고 판정 키 (job-search R35).
// 같은 사이트 안에서는 ext_id(공고 고유 id, 없으면 주소), 사이트가 다르면 회사+제목 정리 키(norm_key)로 본다.

/** 공백·기호를 지우고 소문자로. 회사 이름의 법인 표기(주식회사, (주), ㈜)도 뺀다 */
export function normalizeText(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/주식회사|\(주\)|\(유\)|유한회사/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

/** 다른 사이트 사이의 같은 공고 판정 키. 회사나 제목이 비면 null (판정하지 않음) */
export function normKey(company: string | null, title: string | null): string | null {
  const c = company ? normalizeText(company) : "";
  const t = title ? normalizeText(title) : "";
  if (c === "" || t === "") return null;
  return `${c}|${t}`;
}

/** 같은 사이트 안의 같은 공고 판정 값: 고유 id, 없으면 주소 */
export function extId(id: string | null, link: string | null): string | null {
  return id ?? link;
}
