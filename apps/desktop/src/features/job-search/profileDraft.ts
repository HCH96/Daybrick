import type { ProfileData, ProfileExperience, ProfileSkill, ProfileTextField, SkillLevel } from "./types";

/**
 * 프로필 초안 ↔ 편집 값, 버전 번호 (R19–R22).
 * 서버 data(jsonb)는 `parseProfileData`로 읽고, 편집 칸은 빈 글자("")를 쓰는 `ProfileForm`으로 바꿔 고친 뒤
 * 저장할 때 `fromForm`으로 다시 `ProfileData`(빈 값은 null)로 만든다.
 */

export const SKILL_LEVELS: readonly { id: SkillLevel; label: string }[] = [
  { id: "high", label: "상" },
  { id: "mid", label: "중" },
  { id: "low", label: "하" },
];

export function skillLevelLabel(level: SkillLevel): string {
  return SKILL_LEVELS.find((l) => l.id === level)?.label ?? "중";
}

/** 숙련도 칩을 누를 때: 상 → 중 → 하 → 상 */
export function nextSkillLevel(level: SkillLevel): SkillLevel {
  return level === "high" ? "mid" : level === "mid" ? "low" : "high";
}

// ===== 서버 data 읽기 =====

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.trim() !== "") : [];
}

function parseTextField(value: unknown): ProfileTextField {
  const r = isRecord(value) ? value : {};
  return { value: text(r.value), sources: strings(r.sources) };
}

function parseSkill(value: unknown): ProfileSkill | null {
  if (!isRecord(value)) return null;
  const name = text(value.name);
  const level: SkillLevel = value.level === "high" || value.level === "low" ? value.level : "mid";
  return name ? { name, level } : null;
}

function parseExperience(value: unknown): ProfileExperience | null {
  if (!isRecord(value)) return null;
  return {
    title: text(value.title) ?? "",
    period: text(value.period),
    did: text(value.did),
    results: text(value.results),
    tech: strings(value.tech),
    sources: strings(value.sources),
  };
}

/** 서버의 프로필 data를 읽는다. 모양이 어긋난 칸은 빈 값으로 둔다 */
export function parseProfileData(value: unknown): ProfileData {
  const r = isRecord(value) ? value : {};
  const skills = isRecord(r.skills) ? r.skills : {};
  return {
    desiredRoles: parseTextField(r.desiredRoles),
    years: parseTextField(r.years),
    skills: {
      items: (Array.isArray(skills.items) ? skills.items : []).map(parseSkill).filter((s) => s !== null),
      sources: strings(skills.sources),
    },
    experiences: (Array.isArray(r.experiences) ? r.experiences : []).map(parseExperience).filter((e) => e !== null),
    education: parseTextField(r.education),
    awards: parseTextField(r.awards),
    strengths: parseTextField(r.strengths),
  };
}

export function emptyProfile(): ProfileData {
  return parseProfileData(null);
}

// ===== 편집 값 =====

export interface FormText {
  value: string;
  sources: string[];
}

export interface FormExperience {
  /** 화면 목록 key (저장하지 않는다) */
  key: string;
  title: string;
  period: string;
  did: string;
  results: string;
  /** 사용 기술: 쉼표로 나눈 글자 */
  tech: string;
  sources: string[];
}

export interface ProfileForm {
  desiredRoles: FormText;
  years: FormText;
  skills: { items: ProfileSkill[]; sources: string[] };
  experiences: FormExperience[];
  education: FormText;
  awards: FormText;
  strengths: FormText;
}

/** 글자 항목 키 (ProfileField 하나로 그리는 칸들) */
export type TextFieldKey = "desiredRoles" | "years" | "education" | "awards" | "strengths";

let keySeq = 0;
export function newRowKey(): string {
  keySeq += 1;
  return `exp-${keySeq}`;
}

function toFormText(field: ProfileTextField): FormText {
  return { value: field.value ?? "", sources: field.sources };
}

export function emptyExperience(): FormExperience {
  return { key: newRowKey(), title: "", period: "", did: "", results: "", tech: "", sources: [] };
}

export function toForm(data: ProfileData): ProfileForm {
  return {
    desiredRoles: toFormText(data.desiredRoles),
    years: toFormText(data.years),
    skills: { items: data.skills.items.map((s) => ({ ...s })), sources: data.skills.sources },
    experiences: data.experiences.map((e) => ({
      key: newRowKey(),
      title: e.title,
      period: e.period ?? "",
      did: e.did ?? "",
      results: e.results ?? "",
      tech: e.tech.join(", "),
      sources: e.sources,
    })),
    education: toFormText(data.education),
    awards: toFormText(data.awards),
    strengths: toFormText(data.strengths),
  };
}

function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** 빈 값을 지운 글자 항목. 사용자가 비운 칸은 출처도 지운다 */
function fromFormText(field: FormText): ProfileTextField {
  const value = orNull(field.value);
  return { value, sources: value === null ? [] : field.sources };
}

/** 저장할 프로필: 앞뒤 공백·빈 줄을 지운다. 제목과 내용이 모두 빈 경력 줄은 버린다 */
export function fromForm(form: ProfileForm): ProfileData {
  const experiences = form.experiences.flatMap((e): ProfileExperience[] => {
    const row: ProfileExperience = {
      title: e.title.trim(),
      period: orNull(e.period),
      did: orNull(e.did),
      results: orNull(e.results),
      tech: e.tech.split(",").map((t) => t.trim()).filter((t) => t !== ""),
      sources: e.sources,
    };
    const empty = row.title === "" && !row.period && !row.did && !row.results && row.tech.length === 0;
    return empty ? [] : [row];
  });
  const items = form.skills.items.map((s) => ({ ...s, name: s.name.trim() })).filter((s) => s.name !== "");
  return {
    desiredRoles: fromFormText(form.desiredRoles),
    years: fromFormText(form.years),
    skills: { items, sources: items.length ? form.skills.sources : [] },
    experiences,
    education: fromFormText(form.education),
    awards: fromFormText(form.awards),
    strengths: fromFormText(form.strengths),
  };
}

// ===== 버전 =====

/** 다음 저장 버전: 저장된 가장 큰 버전 + 1 (처음이면 v1) */
export function nextVersion(versions: readonly { version: number }[]): number {
  return versions.reduce((max, v) => Math.max(max, v.version), 0) + 1;
}
