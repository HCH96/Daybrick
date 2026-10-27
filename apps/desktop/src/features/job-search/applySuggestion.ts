import type { ApplicationPatch } from "../applications/reducer";
import type { ApplicationsStore } from "../applications/store";
import { normalizeStage } from "../applications/transitions";
import type { Application, PropertyDef, ScheduleEvent } from "../applications/types";
import type { MailSuggestion } from "./mailApi";

/**
 * 메일 제안 승인 → 로컬 지원 관리 카드 반영 (R68).
 * 카드는 `jobLink.serverId`(= `js_applications.id`)로 찾는다 (D40).
 * 상태가 바뀌면 `statusSync`가 서버 지원 건 상태를 따라 고친다.
 */

/** 분류 → 결과 속성 항목 이름 (지원 관리 기본 "결과" 속성) */
const RESULT_NAME: Partial<Record<MailSuggestion["category"], string>> = {
  rejected: "불합격",
  offer: "최종 합격",
};

export interface SuggestionPlan {
  patch: ApplicationPatch;
  events: ScheduleEvent[];
}

/** 이 제안의 대상 카드. 없으면 null */
export function findSuggestionCard(applications: readonly Application[], suggestion: MailSuggestion): Application | null {
  if (!suggestion.applicationId) return null;
  return applications.find((a) => a.jobLink?.serverId === suggestion.applicationId) ?? null;
}

/** 카드에 넣을 변경: 상태·세부 단계·결과 값과 새 전형 일정 (같은 종류·같은 날 일정이 있으면 더하지 않음) */
export function planSuggestion(
  card: Application,
  properties: readonly PropertyDef[],
  suggestion: MailSuggestion,
  newId: () => string,
): SuggestionPlan {
  const patch: ApplicationPatch = {};
  if (suggestion.toStatus) {
    patch.status = suggestion.toStatus;
    patch.stage = normalizeStage(suggestion.toStatus, suggestion.stage ?? card.stage);
  }

  const resultName = RESULT_NAME[suggestion.category];
  const resultProp = properties.find((p) => p.role === "result" && p.type === "select");
  const option = resultName ? resultProp?.options.find((o) => o.name === resultName) : undefined;
  if (resultProp && option) patch.values = { ...card.values, [resultProp.id]: option.id };

  const events: ScheduleEvent[] = [];
  const s = suggestion.schedule;
  if (s && !card.events.some((e) => e.kind === s.kind && e.date === s.date)) {
    events.push({ id: newId(), kind: s.kind, date: s.date, time: s.time, memo: s.label });
  }
  return { patch, events };
}

/** 승인한 제안을 카드에 반영한다. 카드가 없으면 false */
export function applySuggestion(store: ApplicationsStore, suggestion: MailSuggestion): boolean {
  if (store.state.kind !== "ready") return false;
  const { properties, applications } = store.state.data;
  const card = findSuggestionCard(applications, suggestion);
  if (!card) return false;
  const plan = planSuggestion(card, properties, suggestion, () => crypto.randomUUID());
  store.updateApplication(card.id, plan.patch);
  if (plan.events.length > 0) store.addEvents(card.id, plan.events);
  return true;
}
