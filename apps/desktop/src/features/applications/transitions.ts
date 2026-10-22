import { withValue } from "./propertyOps";
import { getDateValue, findPropertyByRole } from "./properties";
import { findStatus } from "./statuses";
import type { Application, EventKind, PropertyDef, ScheduleEvent, StageId, StatusId } from "./types";

/**
 * 상태를 바꿀 때의 규칙 (R20~R22). 화면과 무관한 순수 함수만 둔다.
 * id·오늘 날짜처럼 매번 달라지는 값은 부르는 쪽에서 넣는다.
 */

/** 세부 단계 → 그 전형의 일정 종류 (R22·R25) */
const STAGE_EVENT_KIND: Record<StageId, EventKind> = {
  assignment: "assignment-due",
  "coding-test": "coding-test",
  interview: "interview",
};

/** 세부 단계가 없는 상태면 stage를 비운다 */
export function normalizeStage(status: StatusId, stage: StageId | null): StageId | null {
  return findStatus(status).hasStage ? stage : null;
}

/** 지금과 같은 상태·세부 단계를 다시 골랐는지 */
export function isSameStatus(application: Application, status: StatusId, stage: StageId | null): boolean {
  return application.status === status && application.stage === normalizeStage(status, stage);
}

/**
 * 상태를 바꾼 새 카드를 돌려준다. 같은 상태를 다시 골랐으면 원래 카드를 그대로 돌려준다.
 * - 지원 완료(R21): 오늘 "지원 완료" 일정을 만든다(같은 날 것이 이미 있으면 만들지 않음).
 *   지원일 속성이 있고 비어 있으면 오늘로 채운다. 지원일을 지웠으면 건너뛴다(D4).
 * - 종료(R20)의 결과 고르기, 전형 준비(R22)의 날짜 고르기는 화면이 이어서 띄운다.
 */
export function changeStatus(
  application: Application,
  properties: readonly PropertyDef[],
  status: StatusId,
  stage: StageId | null,
  todayKey: string,
  newEventId: string,
): Application {
  if (isSameStatus(application, status, stage)) return application;

  let next: Application = { ...application, status, stage: normalizeStage(status, stage) };

  if (status === "applied" && application.status !== "applied") {
    const hasToday = next.events.some((e) => e.kind === "applied" && e.date === todayKey);
    if (!hasToday) {
      next = { ...next, events: [...next.events, makeEvent(newEventId, "applied", todayKey)] };
    }
    const appliedDate = findPropertyByRole(properties, "appliedDate");
    if (appliedDate && appliedDate.type === "date" && getDateValue(next, appliedDate) === null) {
      next = { ...next, values: withValue(next.values, appliedDate.id, todayKey) };
    }
  }

  return next;
}

/** 전형 준비의 세부 단계를 고른 뒤 날짜를 고르면 만드는 일정 (R22). 같은 종류·같은 날 일정이 있으면 null. */
export function createStageEvent(
  application: Application,
  stage: StageId,
  date: string,
  newEventId: string,
): ScheduleEvent | null {
  const kind = STAGE_EVENT_KIND[stage];
  if (application.events.some((e) => e.kind === kind && e.date === date)) return null;
  return makeEvent(newEventId, kind, date);
}

function makeEvent(id: string, kind: EventKind, date: string): ScheduleEvent {
  return { id, kind, date, time: null, memo: "" };
}
