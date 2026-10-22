import { findStatus } from "./statuses";
import type { Application, EventKind, ScheduleEvent, StageId, StatusId } from "./types";

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
 * - 지원 완료(R21): 상태만 바꾼다. 일정·날짜는 만들지 않는다.
 * - 종료(R20)의 결과 고르기, 전형 준비(R22)의 날짜 고르기는 화면이 이어서 띄운다.
 */
export function changeStatus(application: Application, status: StatusId, stage: StageId | null): Application {
  if (isSameStatus(application, status, stage)) return application;
  return { ...application, status, stage: normalizeStage(status, stage) };
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
