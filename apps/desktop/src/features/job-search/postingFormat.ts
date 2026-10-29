import { KIND_INFO, familyLabel, isAddableKind } from "./filterRules";
import type { FilterHit, ScheduleItem } from "./postingParse";
import type { PostingStage } from "./types";

/** 상세 팝업·걸러진 공고·보관함의 글자 만들기 (목업 popup.html·filtered.html·archived.html) */

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** ISO 시각 → `10/26` */
export function shortDay(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** `YYYY-MM-DD` → `2026-11-08 (일)`. 형식이 틀리면 그대로 */
export function dayWithWeekday(date: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return date;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? date : `${date} (${WEEKDAYS[d.getDay()]})`;
}

/** `YYYY-MM-DD` → `11/08` */
export function monthDay(date: string): string {
  const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(date);
  return m ? `${m[1]}/${m[2]}` : date;
}

/** 날짜와 시각을 붙인다. 날짜가 없으면 null */
export function dateTime(date: string | null, time: string | null): string | null {
  if (!date) return null;
  return time ? `${dayWithWeekday(date)} ${time}` : dayWithWeekday(date);
}

/** 전형 일정 한 줄: `코딩테스트 2026-11-15 (일)` (날짜가 없으면 이름과 "날짜 불명확") */
export function scheduleLine(item: ScheduleItem): string {
  return `${item.label} ${dateTime(item.date, item.time) ?? "(날짜 불명확)"}`;
}

/** 걸린 조건 단계: 1차 회색, 2차 파랑 */
export function hitStage(hit: FilterHit): 1 | 2 {
  return isAddableKind(hit.kind) ? KIND_INFO[hit.kind].stage : 2;
}

function quoted(words: string[]): string {
  return `“${words.join(", ")}”`;
}

/** 걸린 조건 칩 글자: `1차 · 제목·직무 제외 “아티스트”` */
export function hitLabel(hit: FilterHit): string {
  const head = `${hitStage(hit)}차 · `;
  const m = hit.matched;
  switch (hit.kind) {
    case "title-include":
      return `${head}제목·직무 포함 키워드 없음`;
    case "title-exclude":
      return `${head}제목·직무 제외 ${quoted(m)}`;
    case "company-exclude":
      return `${head}회사 제외 ${quoted(m)}`;
    case "skill-include":
      return `${head}기술스택 포함 키워드 없음`;
    case "skill-exclude":
      return `${head}기술스택 제외 ${quoted(m)}`;
    case "max-years":
      return m.length > 0 ? `${head}경력 ${m[0]}년 이상 요구` : `${head}경력 연수 기준`;
    case "employment":
      return `${head}고용 형태 ${quoted(m)} 제외`;
    case "skill-overlap":
      return `${head}기술스택 자동 추림 (겹치는 기술 없음)`;
    case "title-nondev":
      return `${head}비개발 낱말: ${m.join(", ")}`;
    case "dev-only":
      return m.length > 0 ? `${head}직군: ${m.map(familyLabel).join(", ")}` : `${head}개발 직군만`;
  }
}

/** 걸러진 공고 단계 고르기 (R46) */
export type FilteredStage = "all" | "filtered1" | "filtered2" | "suspect" | "failed";

/** 처리 실패 이유를 읽기 쉬운 말로 (원문은 Anthropic 오류 메시지) */
export function failLabel(reason: string): string {
  if (/image dimensions exceed/i.test(reason)) return "이미지가 너무 커서 AI가 받지 않음";
  if (/image/i.test(reason)) return "이미지를 AI가 받지 않음";
  return "AI가 이 공고 요청을 거절함";
}

export function matchesStage(stage: PostingStage, pick: FilteredStage): boolean {
  return pick === "all" || stage === pick;
}
