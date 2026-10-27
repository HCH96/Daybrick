// 서버 함수 공용: 필터 판정 순수 함수 (job-search R42–R45, D10). AI를 쓰지 않는다.
// 1차는 목록 정보(제목·직무·회사), 2차는 추출 항목(기술스택·경력 연수·고용 형태)과 프로필 기술스택으로 거른다.
// 켜진 조건을 모두 만족해야 통과하고, 걸리면 걸린 조건을 모두 돌려준다 (R45).
// 값이 비어 판단할 수 없는 조건은 통과로 본다 (원문에 없는 항목은 비어 있다, R50).
// 앱 `features/job-search/filterRules.ts`가 같은 종류·값 모양을 쓴다 (D35). 한쪽을 바꾸면 둘 다 바꾼다.

export type FilterKind =
  | "title-include"
  | "title-exclude"
  | "company-exclude"
  | "skill-include"
  | "skill-exclude"
  | "max-years"
  | "employment"
  | "skill-overlap";

/** `js_filters` 한 줄. value는 낱말 목록 `{ words }`, 경력 기준 `{ years }`, 자동 추림 `{}` */
export interface FilterRow {
  id: string;
  stage: 1 | 2;
  kind: FilterKind;
  value: unknown;
  enabled: boolean;
}

/** 걸린 조건 하나 (`js_postings.filtered_by`에 목록으로 저장). matched: 걸리게 한 값 */
export interface FilterHit {
  id: string;
  kind: FilterKind;
  matched: string[];
}

export type FilterResult = { pass: true } | { pass: false; hits: FilterHit[] };

/** 1차 필터에 쓰는 목록 정보 */
export interface PostingForFilter {
  title: string | null;
  duty: string | null;
  company: string | null;
}

/** 2차 필터에 쓰는 추출 항목 (9단계가 `js_extractions.fields`에서 만든다) */
export interface ExtractionForFilter {
  skills: string[];
  /** 요구하는 최소 경력 연수. 원문에 없거나 신입이면 null */
  minYears: number | null;
  /** 고용 형태 (예: 정규직, 계약직) */
  employment: string[];
}

/** 프로필에서 쓰는 값: 기술스택 이름 */
export interface ProfileForFilter {
  skills: string[];
}

/** 비교용: 호환 문자 정리·소문자·공백 제거. 기호(C++, C#)는 남긴다 */
export function normalizeWord(text: string): string {
  return text.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

export function filterWords(value: unknown): string[] {
  if (typeof value !== "object" || value === null || !("words" in value)) return [];
  const words: unknown = value.words;
  if (!Array.isArray(words)) return [];
  return words.filter((w): w is string => typeof w === "string" && normalizeWord(w) !== "");
}

export function filterYears(value: unknown): number | null {
  if (typeof value !== "object" || value === null || !("years" in value)) return null;
  const years: unknown = value.years;
  return typeof years === "number" && Number.isFinite(years) && years > 0 ? years : null;
}

/** words 중 text 안에 들어 있는 것 */
function containedWords(words: string[], texts: (string | null)[]): string[] {
  const hay = texts.filter((t): t is string => !!t).map(normalizeWord);
  return words.filter((w) => hay.some((h) => h.includes(normalizeWord(w))));
}

/** words 중 items와 같은 것 (정리한 값끼리 비교) */
function equalWords(words: string[], items: string[]): string[] {
  const set = new Set(items.map(normalizeWord));
  return words.filter((w) => set.has(normalizeWord(w)));
}

function result(hits: FilterHit[]): FilterResult {
  return hits.length === 0 ? { pass: true } : { pass: false, hits };
}

/** 1차 필터 (R42): 제목·직무 포함(하나라도)/제외, 회사 제외 */
export function applyFirst(posting: PostingForFilter, filters: FilterRow[]): FilterResult {
  const hits: FilterHit[] = [];
  const texts = [posting.title, posting.duty];
  const hasText = texts.some((t) => !!t && t.trim() !== "");
  for (const f of filters) {
    if (!f.enabled || f.stage !== 1) continue;
    const words = filterWords(f.value);
    if (words.length === 0) continue;
    if (f.kind === "title-include") {
      if (hasText && containedWords(words, texts).length === 0) hits.push({ id: f.id, kind: f.kind, matched: [] });
    } else if (f.kind === "title-exclude") {
      const matched = containedWords(words, texts);
      if (matched.length > 0) hits.push({ id: f.id, kind: f.kind, matched });
    } else if (f.kind === "company-exclude") {
      const matched = containedWords(words, [posting.company]);
      if (matched.length > 0) hits.push({ id: f.id, kind: f.kind, matched });
    }
  }
  return result(hits);
}

/**
 * 2차 필터 (R43–R44): 기술스택 포함(하나라도)/제외, 경력 연수(N년 이상 요구하면 제외),
 * 고용 형태 제외(공고의 고용 형태가 모두 제외 목록에 걸릴 때만), 기술스택 자동 추림(프로필과 하나도 안 겹치면).
 */
export function applySecond(
  extraction: ExtractionForFilter,
  profile: ProfileForFilter | null,
  filters: FilterRow[],
): FilterResult {
  const hits: FilterHit[] = [];
  const skills = extraction.skills.filter((s) => normalizeWord(s) !== "");
  for (const f of filters) {
    if (!f.enabled || f.stage !== 2) continue;
    if (f.kind === "max-years") {
      const years = filterYears(f.value);
      if (years !== null && extraction.minYears !== null && extraction.minYears >= years) {
        hits.push({ id: f.id, kind: f.kind, matched: [`${extraction.minYears}`] });
      }
      continue;
    }
    if (f.kind === "skill-overlap") {
      const mine = profile?.skills ?? [];
      if (skills.length > 0 && mine.length > 0 && equalWords(skills, mine).length === 0) {
        hits.push({ id: f.id, kind: f.kind, matched: [] });
      }
      continue;
    }
    const words = filterWords(f.value);
    if (words.length === 0) continue;
    if (f.kind === "skill-include") {
      if (skills.length > 0 && equalWords(words, skills).length === 0) hits.push({ id: f.id, kind: f.kind, matched: [] });
    } else if (f.kind === "skill-exclude") {
      const matched = equalWords(words, skills);
      if (matched.length > 0) hits.push({ id: f.id, kind: f.kind, matched });
    } else if (f.kind === "employment") {
      const types = extraction.employment.filter((e) => normalizeWord(e) !== "");
      const blocked = types.filter((t) => containedWords(words, [t]).length > 0);
      if (types.length > 0 && blocked.length === types.length) {
        hits.push({ id: f.id, kind: f.kind, matched: containedWords(words, types) });
      }
    }
  }
  return result(hits);
}
