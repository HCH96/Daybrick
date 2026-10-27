import { isRecord, toNumber } from "./api";
import type { FilterKind } from "./types";

/** 서버 JSON(D35 `filtered_by`, D36 추출·채점 결과)을 화면에서 쓰는 모양으로 읽는다 */

/** 강점·부족한 점 한 줄과 근거 (R12) */
export interface Reason {
  point: string;
  posting: string;
  profile: string;
}

export type ScheduleKind = "assignment" | "coding-test" | "interview" | "other";

export interface ScheduleItem {
  kind: ScheduleKind;
  label: string;
  date: string | null;
  time: string | null;
  text: string | null;
}

/** 추출 항목 (D36 `js_extractions.fields`) */
export interface PostingFields {
  role: string | null;
  requirements: string[];
  preferred: string[];
  skills: string[];
  experience: { minYears: number | null; text: string | null };
  employment: string[];
  location: string | null;
  deadline: { date: string | null; time: string | null; text: string | null };
  schedule: ScheduleItem[];
}

/** 걸린 조건 하나 (D35) */
export interface FilterHit {
  id: string;
  kind: FilterKind;
  matched: string[];
}

const KINDS: readonly FilterKind[] = [
  "title-include",
  "title-exclude",
  "company-exclude",
  "skill-include",
  "skill-exclude",
  "max-years",
  "employment",
  "skill-overlap",
];
const SCHEDULE_KINDS: readonly ScheduleKind[] = ["assignment", "coding-test", "interview", "other"];

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.trim() !== "") : [];
}

export function parseReasons(value: unknown): Reason[] {
  if (!Array.isArray(value)) return [];
  const list: Reason[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const point = text(item.point);
    if (!point) continue;
    list.push({ point, posting: text(item.posting) ?? "", profile: text(item.profile) ?? "" });
  }
  return list;
}

function parseSchedule(value: unknown): ScheduleItem[] {
  if (!Array.isArray(value)) return [];
  const list: ScheduleItem[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    list.push({
      kind: SCHEDULE_KINDS.find((k) => k === item.kind) ?? "other",
      label: text(item.label) ?? "일정",
      date: text(item.date),
      time: text(item.time),
      text: text(item.text),
    });
  }
  return list;
}

export function parseFields(value: unknown): PostingFields {
  const f = isRecord(value) ? value : {};
  const experience = isRecord(f.experience) ? f.experience : {};
  const deadline = isRecord(f.deadline) ? f.deadline : {};
  return {
    role: text(f.role),
    requirements: strings(f.requirements),
    preferred: strings(f.preferred),
    skills: strings(f.skills),
    experience: { minYears: toNumber(experience.minYears), text: text(experience.text) },
    employment: strings(f.employment),
    location: text(f.location),
    deadline: { date: text(deadline.date), time: text(deadline.time), text: text(deadline.text) },
    schedule: parseSchedule(f.schedule),
  };
}

/** 처리 실패 공고의 filtered_by([{ kind: "process-failed", matched: [이유] }])에서 이유를 꺼낸다 (L28) */
export function parseFailReason(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  const item: unknown = value.find((v) => isRecord(v) && v.kind === "process-failed");
  if (!isRecord(item)) return null;
  return strings(item.matched)[0] ?? "";
}

export function parseHits(value: unknown): FilterHit[] {
  if (!Array.isArray(value)) return [];
  const hits: FilterHit[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const kind = KINDS.find((k) => k === item.kind);
    if (!kind) continue;
    hits.push({ id: typeof item.id === "string" ? item.id : "", kind, matched: strings(item.matched) });
  }
  return hits;
}
