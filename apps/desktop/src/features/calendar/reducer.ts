import { addDays } from "../../utils/date";
import type { CalendarData, PersonalEvent, PersonalEventPatch } from "./types";

/** 데이터 상태: 읽는 중 / 준비됨 / 읽기 실패 (플랜·투데이와 같은 흐름) */
export type CalendarState =
  | { kind: "loading" }
  | { kind: "ready"; data: CalendarData }
  | { kind: "error"; message: string };

/**
 * reducer에 보내는 동작. id·시각처럼 매번 달라지는 값은 보내는 쪽에서 만들어 넣는다.
 * 시각(now)은 ISO 문자열이다.
 */
export type CalendarAction =
  | { type: "loaded"; data: CalendarData }
  | { type: "load-failed"; message: string }
  /** 새 일정. 제목은 보내는 쪽에서 다듬어 비어 있지 않은 것만 보낸다 */
  | { type: "add"; event: PersonalEvent }
  /** 칸 몇 개를 바꾼다. 제목이 비거나 시작일이 끝일보다 늦어지면 무시한다 */
  | { type: "update"; id: string; patch: PersonalEventPatch; now: string }
  /** 시작일·끝일을 함께 days일 옮긴다 (드래그) */
  | { type: "move"; id: string; days: number; now: string }
  | { type: "delete"; id: string };

/** 시간은 하루짜리 일정에만 둔다 (R26). 기간 일정이면 time을 비운다 */
export function normalizeTime(start: string, end: string, time: string | null): string | null {
  return start === end ? time : null;
}

function updateData(state: CalendarState, fn: (data: CalendarData) => CalendarData): CalendarState {
  if (state.kind !== "ready") return state;
  const next = fn(state.data);
  return next === state.data ? state : { kind: "ready", data: next };
}

function replaceEvent(data: CalendarData, id: string, fn: (e: PersonalEvent) => PersonalEvent | null): CalendarData {
  const index = data.events.findIndex((e) => e.id === id);
  if (index < 0) return data;
  const next = fn(data.events[index]);
  if (next === null) return data;
  const events = data.events.slice();
  events[index] = next;
  return { ...data, events };
}

function applyPatch(event: PersonalEvent, patch: PersonalEventPatch, now: string): PersonalEvent | null {
  const title = patch.title === undefined ? event.title : patch.title.trim();
  const start = patch.start ?? event.start;
  const end = patch.end ?? event.end;
  if (title === "" || start > end) return null;
  const time = normalizeTime(start, end, patch.time === undefined ? event.time : patch.time);
  return { ...event, title, start, end, time, updatedAt: now };
}

export function reducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case "loaded":
      return { kind: "ready", data: action.data };
    case "load-failed":
      return { kind: "error", message: action.message };
    case "add":
      return updateData(state, (data) => ({ ...data, events: [...data.events, action.event] }));
    case "update":
      return updateData(state, (data) => replaceEvent(data, action.id, (e) => applyPatch(e, action.patch, action.now)));
    case "move":
      if (action.days === 0) return state;
      return updateData(state, (data) =>
        replaceEvent(data, action.id, (e) => ({
          ...e,
          start: addDays(e.start, action.days),
          end: addDays(e.end, action.days),
          updatedAt: action.now,
        })),
      );
    case "delete":
      return updateData(state, (data) => {
        const events = data.events.filter((e) => e.id !== action.id);
        return events.length === data.events.length ? data : { ...data, events };
      });
  }
}
