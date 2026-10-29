// 서버 함수 공용: 같은 공고 판정 (job-search R35, R84, R86). DB·네트워크 없는 순수 함수만 둔다.
// 같은 사이트 안에서는 ext_id(공고 고유 id, 없으면 주소), 사이트가 다르면
// 수집 단계는 회사+정리 제목 키(norm_key, 회사 정확히 같음, D52), 중복 확인 단계는 isSameJob(D55)로 본다.

/** 공백·기호를 지우고 소문자로. 회사 이름의 법인 표기(주식회사, (주), ㈜)도 뺀다 */
export function normalizeText(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/주식회사|\(주\)|\(유\)|유한회사/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

/** 제목 상투어 (R35). 긴 것부터 빼야 "신입/경력"이 "신입"·"경력"보다 먼저 빠진다 */
const STOP_WORDS = [
  "신입/경력", "채용", "모집", "신입", "경력", "정규직", "계약직", "상반기", "하반기", "수시", "공채",
];
const STOP_RE = new RegExp(
  [...STOP_WORDS].sort((a, b) => b.length - a.length).map((w) => w.replace(/[/]/g, "\\/")).join("|"),
  "g",
);
const LEAD_TAG = /^\s*(\[[^\]]*\]|\([^)]*\))\s*/;
const TAIL_TAG = /\s*(\[[^\]]*\]|\([^)]*\))\s*$/;

/** 상투어를 빼고 회사 이름을 뺀 정리값 (normalizeText 적용) */
function stripWords(text: string, companyKey: string): string {
  let t = normalizeText(text.normalize("NFKC").replace(STOP_RE, " "));
  if (companyKey !== "") t = t.split(companyKey).join("");
  return t;
}

/**
 * 다른 사이트 판정용 제목 정리 (R35): 앞 말머리 반복 제거 → 상투어 제거 → 회사 이름 제거 → normalizeText.
 * 뒤 괄호는 안이 상투어·회사 이름뿐일 때만 뺀다 (예: "(경력)"은 빼고 "(MMORPG)"는 남김, 엄격 판정 D53).
 * 결과가 빈 글자면 원래 제목의 normalizeText (상투어뿐인 제목이 모두 같은 키가 되는 것 막기).
 */
export function cleanTitle(title: string, company: string | null): string {
  const companyKey = company ? normalizeText(company) : "";
  let t = title.normalize("NFKC");
  for (;;) {
    const lead = t.match(LEAD_TAG);
    if (lead) { t = t.slice(lead[0].length); continue; }
    const tail = t.match(TAIL_TAG);
    if (tail && stripWords(tail[1].slice(1, -1), companyKey) === "") {
      t = t.slice(0, t.length - tail[0].length);
      continue;
    }
    break;
  }
  const cleaned = stripWords(t, companyKey);
  return cleaned !== "" ? cleaned : normalizeText(title);
}

/** 수집 단계 다른 사이트 판정 키 `정리(회사)|cleanTitle(제목)`. 회사나 제목이 비면 null (판정하지 않음) */
export function normKey(company: string | null, title: string | null): string | null {
  const c = company ? normalizeText(company) : "";
  const t = title && normalizeText(title) !== "" ? cleanTitle(title, company) : "";
  if (c === "" || t === "") return null;
  return `${c}|${t}`;
}

/** 같은 사이트 안의 같은 공고 판정 값: 고유 id, 없으면 주소 */
export function extId(id: string | null, link: string | null): string | null {
  return id ?? link;
}

/** 회사 일치 (R84): 정리한 이름이 같거나 한쪽이 다른 쪽으로 시작. 짧은 쪽이 2글자 미만이면 false (D55) */
export function companyMatch(a: string | null, b: string | null): boolean {
  const x = a ? normalizeText(a) : "";
  const y = b ? normalizeText(b) : "";
  const [short, long] = x.length <= y.length ? [x, y] : [y, x];
  if ([...short].length < 2) return false;
  return long.startsWith(short);
}

/** 마감일 일치 (R84): 둘 다 없음(상시)이거나 날짜(YYYY-MM-DD)가 같음. 시간은 보지 않는다 */
export function sameDeadline(a: string | null, b: string | null): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.slice(0, 10) === b.slice(0, 10);
}

/** 2글자 묶음 목록 (중복 포함) */
function bigrams(s: string): string[] {
  const chars = [...s];
  const out: string[] = [];
  for (let i = 0; i < chars.length - 1; i++) out.push(chars[i] + chars[i + 1]);
  return out;
}

/** 2글자 묶음 겹침 2·|A∩B| / (|A|+|B|) (중복 묶음은 개수로). 한쪽이 2글자 미만이면 같을 때만 1 */
export function dice(a: string, b: string): number {
  if ([...a].length < 2 || [...b].length < 2) return a === b && a !== "" ? 1 : 0;
  const A = bigrams(a);
  const B = bigrams(b);
  const counts = new Map<string, number>();
  for (const g of A) counts.set(g, (counts.get(g) ?? 0) + 1);
  let common = 0;
  for (const g of B) {
    const n = counts.get(g) ?? 0;
    if (n > 0) { common++; counts.set(g, n - 1); }
  }
  return (2 * common) / (A.length + B.length);
}

/** 판정 입력: 공고 하나 */
export interface JobLike {
  siteId: string;
  company: string | null;
  title: string | null;
  /** 추출 직무 (fields.role) */
  role?: string | null;
  deadline: string | null;
}

/** 직무·제목 비슷함 (D55): 정리 제목이 같거나 Dice ≥ 0.8, 또는 정리한 추출 직무가 둘 다 있고 같음 */
export function titleSimilar(a: JobLike, b: JobLike): boolean {
  const ra = a.role ? normalizeText(a.role) : "";
  const rb = b.role ? normalizeText(b.role) : "";
  if (ra !== "" && ra === rb) return true;
  if (!a.title || !b.title) return false;
  const ta = cleanTitle(a.title, a.company);
  const tb = cleanTitle(b.title, b.company);
  if (ta === "" || tb === "") return false;
  return ta === tb || dice(ta, tb) >= 0.8;
}

/** 같은 공고 판정 (R84, 엄격): 다른 사이트 && 회사 일치 && 마감일 일치 && 직무·제목 비슷함 */
export function isSameJob(a: JobLike, b: JobLike): boolean {
  return a.siteId !== b.siteId
    && companyMatch(a.company, b.company)
    && sameDeadline(a.deadline, b.deadline)
    && titleSimilar(a, b);
}

/** 대표 고르기 입력 */
export interface RepCandidate {
  id: string;
  applied: boolean;
  scored: boolean;
  ownSite: boolean;
  collectedAt: string;
}

/**
 * 대표 고르기 (R86, R89, D57): 지원함 → (소급일 때) 채점 있음 → 자사 사이트 → 먼저 수집 → id 순.
 * 빈 목록이면 null.
 */
export function pickRep<T extends RepCandidate>(list: T[], backfill = false): T | null {
  if (list.length === 0) return null;
  const rank = (x: T): number[] => [
    x.applied ? 0 : 1,
    backfill && x.scored ? 0 : 1,
    x.ownSite ? 0 : 1,
  ];
  const sorted = [...list].sort((x, y) => {
    const rx = rank(x);
    const ry = rank(y);
    for (let i = 0; i < rx.length; i++) if (rx[i] !== ry[i]) return rx[i] - ry[i];
    const tx = Date.parse(x.collectedAt);
    const ty = Date.parse(y.collectedAt);
    if (Number.isFinite(tx) && Number.isFinite(ty) && tx !== ty) return tx - ty;
    return x.id < y.id ? -1 : x.id > y.id ? 1 : 0;
  });
  return sorted[0];
}
