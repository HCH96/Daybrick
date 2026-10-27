import { EVENT_KIND_LABELS } from "../applications/statuses";
import type { EventKind, ScheduleEvent } from "../applications/types";
import type { PostingFields, ScheduleKind } from "./postingParse";

/** 공고 추출 항목 → 일정 제안 목록 (R55, R56). 화면과 무관한 순수 함수만 둔다. */

/** 날짜가 정확한 일정 하나 (체크 목록 한 줄) */
export interface SuggestedEvent {
  key: string;
  kind: EventKind;
  label: string;
  date: string; // YYYY-MM-DD
  time: string | null; // HH:mm
  /** 공고 원문 표기 (없으면 null) */
  raw: string | null;
}

/** 날짜가 정확하지 않아 제안하지 않고 카드 본문에만 적는 일정 */
export interface VagueEvent {
  label: string;
  text: string;
}

export interface ScheduleSuggestion {
  events: SuggestedEvent[];
  vague: VagueEvent[];
}

/** 지원 관리 일정 종류로 옮길 수 있는 추출 일정. "other"는 제안하지 않는다 */
const KIND_MAP: Partial<Record<ScheduleKind, EventKind>> = {
  assignment: "assignment-due",
  "coding-test": "coding-test",
  interview: "interview",
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 실제로 있는 날짜인 `YYYY-MM-DD`인지 (예: 2026-02-30은 아님) */
function isExactDate(value: string | null): value is string {
  const m = value ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
  if (!m) return false;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]);
}

function cleanTime(value: string | null): string | null {
  return value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : null;
}

/**
 * 지원 마감·과제 마감·코딩테스트·면접 중 날짜가 정확한 것만 제안하고,
 * 날짜가 없거나 틀린 것(예: "3월 중")은 원문이 있으면 vague로 돌려준다.
 */
export function suggestSchedule(fields: PostingFields | null): ScheduleSuggestion {
  const events: SuggestedEvent[] = [];
  const vague: VagueEvent[] = [];
  if (!fields) return { events, vague };

  const candidates: { kind: EventKind; label: string; date: string | null; time: string | null; text: string | null }[] = [
    { kind: "application-due", label: EVENT_KIND_LABELS["application-due"], ...fields.deadline },
  ];
  for (const item of fields.schedule) {
    const kind = KIND_MAP[item.kind];
    if (kind) candidates.push({ kind, label: EVENT_KIND_LABELS[kind], date: item.date, time: item.time, text: item.text });
  }

  candidates.forEach((c, i) => {
    if (isExactDate(c.date)) {
      events.push({ key: `${c.kind}-${i}`, kind: c.kind, label: c.label, date: c.date, time: cleanTime(c.time), raw: c.text });
    } else if (c.text) {
      vague.push({ label: c.label, text: c.text });
    }
  });
  return { events, vague };
}

/** 체크 목록 오른쪽 날짜: `11/08 (일) 23:59` */
export function suggestDateLabel(event: SuggestedEvent): string {
  const [y, m, d] = event.date.split("-").map(Number);
  const day = `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")} (${WEEKDAYS[new Date(y, m - 1, d).getDay()]})`;
  return event.time ? `${day} ${event.time}` : day;
}

/** 체크한 제안 → 카드 전형 일정. 원문 표기는 메모에 남긴다 */
export function toScheduleEvents(picked: SuggestedEvent[], newId: () => string): ScheduleEvent[] {
  return picked.map((e) => ({ id: newId(), kind: e.kind, date: e.date, time: e.time, memo: e.raw ?? "" }));
}
