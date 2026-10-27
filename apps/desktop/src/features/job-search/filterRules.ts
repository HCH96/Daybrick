import type { FilterKind, FilterRule, PostingStage } from "./types";

/**
 * 필터 탭 규칙 (R41–R45, D35). 종류·값 모양은 서버 `supabase/functions/_shared/filters.ts`와 같다.
 * 값: 낱말 목록 `{ words: string[] }`, 경력 기준 `{ years: number }`, 기술스택 자동 추림 `{}`.
 */

/** 화면에서 칩 색: 포함 보라, 제외 빨강, 숫자 기준 파랑 */
export type ChipTone = "accent" | "red" | "blue";

/** 사용자가 추가할 수 있는 종류 (자동 추림은 2차 판의 고정 줄) */
export type AddableKind = Exclude<FilterKind, "skill-overlap">;

interface KindInfo {
  stage: 1 | 2;
  label: string;
  tone: ChipTone;
  placeholder: string;
}

export const KIND_INFO: Record<AddableKind, KindInfo> = {
  "title-include": { stage: 1, label: "제목·직무 포함 (하나라도)", tone: "accent", placeholder: "키워드 입력 후 Enter (쉼표로 여러 개)" },
  "title-exclude": { stage: 1, label: "제목·직무 제외", tone: "red", placeholder: "키워드 입력 후 Enter (쉼표로 여러 개)" },
  "company-exclude": { stage: 1, label: "회사 제외", tone: "red", placeholder: "회사 이름 입력 후 Enter (쉼표로 여러 개)" },
  "skill-include": { stage: 2, label: "기술스택 포함 (하나라도)", tone: "accent", placeholder: "기술 입력 후 Enter (쉼표로 여러 개)" },
  "skill-exclude": { stage: 2, label: "기술스택 제외", tone: "red", placeholder: "기술 입력 후 Enter (쉼표로 여러 개)" },
  "max-years": { stage: 2, label: "경력 연수", tone: "blue", placeholder: "연수 입력 (예: 5)" },
  employment: { stage: 2, label: "고용 형태 제외", tone: "red", placeholder: "고용 형태 입력 후 Enter (예: 인턴, 파견)" },
};

export const FIRST_KINDS: AddableKind[] = ["title-include", "title-exclude", "company-exclude"];
export const SECOND_KINDS: AddableKind[] = ["skill-exclude", "skill-include", "max-years", "employment"];

export function isAddableKind(kind: FilterKind): kind is AddableKind {
  return kind !== "skill-overlap";
}

export function ruleWords(value: unknown): string[] {
  if (typeof value !== "object" || value === null || !("words" in value)) return [];
  const words: unknown = value.words;
  return Array.isArray(words) ? words.filter((w): w is string => typeof w === "string" && w.trim() !== "") : [];
}

export function ruleYears(value: unknown): number | null {
  if (typeof value !== "object" || value === null || !("years" in value)) return null;
  const years: unknown = value.years;
  return typeof years === "number" && Number.isFinite(years) && years > 0 ? years : null;
}

/** 줄에 보여 줄 칩 글자 */
export function ruleChips(rule: FilterRule): string[] {
  if (rule.kind === "max-years") {
    const years = ruleYears(rule.value);
    return years === null ? [] : [`${years}년 이상 요구하면 제외`];
  }
  return ruleWords(rule.value);
}

export type ParsedInput = { ok: true; value: { words: string[] } | { years: number } } | { ok: false; error: string };

/** 추가 칸 입력을 값으로 바꾼다. 낱말은 쉼표로 나누고 같은 것은 하나만 */
export function parseFilterInput(kind: AddableKind, text: string): ParsedInput {
  if (kind === "max-years") {
    const years = Number(text.trim().replace(/년$/, ""));
    if (!Number.isInteger(years) || years < 1 || years > 50) {
      return { ok: false, error: "경력 연수는 1–50 사이의 정수로 넣어 주세요." };
    }
    return { ok: true, value: { years } };
  }
  const words: string[] = [];
  for (const part of text.split(",")) {
    const word = part.trim();
    if (word !== "" && !words.some((w) => w.toLowerCase() === word.toLowerCase())) words.push(word);
  }
  if (words.length === 0) return { ok: false, error: "값을 하나 이상 넣어 주세요." };
  return { ok: true, value: { words } };
}

// ===== 처리 순서 줄 (R41) =====

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 한국 시간 이번 주 월요일 0시 (D25와 같은 경계 계산) */
export function kstWeekStart(now: Date): Date {
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  const dayStart = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate());
  const sinceMonday = (kst.getUTCDay() + 6) % 7;
  return new Date(dayStart - sinceMonday * DAY_MS - KST_OFFSET_MS);
}

/** 이번 주 공고 한 개의 처리 상태 */
export interface FlowPosting {
  stage: PostingStage;
  /** 추출 결과가 있는지 */
  extracted: boolean;
}

export interface FlowCounts {
  collected: number;
  firstPassed: number;
  extractedOk: number;
  secondPassed: number;
  scored: number;
  waiting: number;
}

/**
 * 단계별 개수. 한도 대기(waiting) 공고는 추출 결과가 있으면 2차까지 통과하고 채점을 기다리는 것으로 본다.
 * 필터를 바꿔 new로 되돌린 공고는 다시 처리하기 전까지 수집 개수에만 든다.
 */
export function summarizeFlow(postings: readonly FlowPosting[]): FlowCounts {
  const counts: FlowCounts = { collected: 0, firstPassed: 0, extractedOk: 0, secondPassed: 0, scored: 0, waiting: 0 };
  for (const p of postings) {
    counts.collected += 1;
    const waitingScore = p.stage === "waiting" && p.extracted;
    if (p.stage === "waiting") counts.waiting += 1;
    if (["extracted", "filtered2", "suspect", "scored"].includes(p.stage) || waitingScore) counts.firstPassed += 1;
    if (["extracted", "filtered2", "scored"].includes(p.stage) || waitingScore) counts.extractedOk += 1;
    if (p.stage === "scored" || waitingScore) counts.secondPassed += 1;
    if (p.stage === "scored") counts.scored += 1;
  }
  return counts;
}
