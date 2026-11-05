/**
 * 개인 일정 편집 팝오버의 입력 검사 (R26·R28, D9). 순수 함수.
 * - 시작일을 끝일 뒤로 바꾸면 끝일이 시작일로 따라온다.
 * - 끝일을 시작일 앞으로 고르면 오류 문구를 내고 [저장]을 막는다.
 * - 제목이 비어도 [저장]을 막는다.
 * - 기간 일정(시작일 ≠ 끝일)이 되면 시간은 "없음"으로 고정된다.
 * 날짜는 "YYYY-MM-DD"라 글자 비교로 앞뒤를 안다.
 */
import type { PersonalEvent, PersonalEventPatch } from "./types";

export type TimeMode = "none" | "time";

export interface PersonalForm {
  title: string;
  start: string;
  end: string;
  timeMode: TimeMode;
  time: string; // "HH:mm", 시각을 고르지 않았으면 ""
}

export const END_BEFORE_START = "끝일이 시작일보다 빨라요";

/** 시각으로 바꿀 때 비어 있으면 넣어 두는 값 */
const DEFAULT_TIME = "09:00";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function formFromEvent(event: PersonalEvent): PersonalForm {
  return {
    title: event.title,
    start: event.start,
    end: event.end,
    timeMode: event.time ? "time" : "none",
    time: event.time ?? "",
  };
}

/** 하루짜리인지. 하루짜리만 시각을 넣을 수 있다 (R26) */
export function isSingleDay(form: PersonalForm): boolean {
  return form.start === form.end;
}

/** 기간 일정이 되면 시간을 "없음"으로 */
function fixTime(form: PersonalForm): PersonalForm {
  return isSingleDay(form) ? form : { ...form, timeMode: "none" };
}

/** 시작일을 바꾼다. 끝일보다 뒤면 끝일이 따라온다 (D9) */
export function setFormStart(form: PersonalForm, start: string): PersonalForm {
  return fixTime({ ...form, start, end: start > form.end ? start : form.end });
}

/** 끝일을 바꾼다. 시작일보다 앞이어도 그대로 두고 오류로 보여준다 (D9) */
export function setFormEnd(form: PersonalForm, end: string): PersonalForm {
  return fixTime({ ...form, end });
}

/** 시간 없음/시각 고르기. 기간 일정이면 바꾸지 않는다 */
export function setFormTimeMode(form: PersonalForm, timeMode: TimeMode): PersonalForm {
  if (!isSingleDay(form)) return form;
  if (timeMode === "time" && form.time === "") return { ...form, timeMode, time: DEFAULT_TIME };
  return { ...form, timeMode };
}

/** 날짜 오류 문구. 없으면 null */
export function formDateError(form: PersonalForm): string | null {
  return form.end < form.start ? END_BEFORE_START : null;
}

/** [저장]을 누를 수 있는지 */
export function canSaveForm(form: PersonalForm): boolean {
  if (form.title.trim() === "" || formDateError(form) !== null) return false;
  return form.timeMode === "none" || TIME_PATTERN.test(form.time);
}

/** 저장소에 보낼 내용. 시각은 하루짜리 + "시각"일 때만 */
export function formToPatch(form: PersonalForm): PersonalEventPatch {
  const time = isSingleDay(form) && form.timeMode === "time" ? form.time : null;
  return { title: form.title.trim(), start: form.start, end: form.end, time };
}
