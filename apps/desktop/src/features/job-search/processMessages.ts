import type { ApiErrorKind } from "../server/management";
import { hhmm } from "./cronSlots";
import { AI_CREDIT_MESSAGE, aiLimitMessage, reason } from "./messages";
import type { BatchRunResult } from "./processApi";
import type { ProcessStop } from "./recommendApi";
import type { BatchState } from "./types";

/** 처리 상태 줄과 [지금 평가] 문구 (사용자 테스트 r1 추가 요청 3·5, R105, R106) */

export const PROCESS_NOTHING = "처리할 공고 없음";

export function processStateErrorMessage(kind: ApiErrorKind): string {
  return `처리 상태를 읽지 못했어요. ${reason(kind)}`;
}

/** 원문 받기·일괄 맡기기 서버 함수를 부르지 못함 */
export function processCallErrorMessage(kind: ApiErrorKind): string {
  if (kind === "not-found") return "처리 서버 함수가 없어요. 서버 업데이트를 해 주세요.";
  return `일괄 처리를 맡기지 못했어요. ${reason(kind)}`;
}

export function processCancelMessage(): string {
  return "멈췄어요. 남은 공고는 예약 처리가 이어서 맡겨요.";
}

/** 일괄 처리 종류 이름 */
const BATCH_KIND_LABEL: Record<BatchState["kind"], string> = { extract: "추출", score: "채점", family: "직군" };

/** "추출 3개 · 채점 5개" (0개인 종류는 뺀다) */
function submittedText(submitted: { extract: number; score: number }): string {
  const parts: string[] = [];
  if (submitted.extract > 0) parts.push(`추출 ${submitted.extract}개`);
  if (submitted.score > 0) parts.push(`채점 ${submitted.score}개`);
  return parts.join(" · ");
}

/** 일괄 맡기기가 멈춘 이유 (js-process batch stopped) */
function batchStopText(stop: ProcessStop): string {
  switch (stop.reason) {
    case "limit":
      return aiLimitMessage(stop.which);
    case "credit":
      return AI_CREDIT_MESSAGE;
    case "no-profile":
      return "저장된 프로필이 없어 채점은 맡기지 못했어요. 프로필 탭에서 프로필을 저장해 주세요.";
    case "time":
      return "남은 공고는 예약 처리가 이어서 맡겨요.";
    case "missing-key":
      return "서버에 Anthropic 키가 없어요. 설정에서 서버 업데이트를 해 주세요.";
    case "network":
    case "upstream":
      return "AI 서버에 닿지 못했어요. 잠시 뒤 다시 시도해 주세요.";
    case "database":
      return "서버에서 일괄 작업을 저장하지 못했어요.";
  }
}

/**
 * [지금 평가] 결과 글 (R106): "일괄 처리로 맡겼어요: 추출 N개 · 채점 M개.",
 * 월 한도로 남긴 공고가 있으면 "월 한도 때문에 K개는 다음에 맡겨요." (R110). 다른 이유로 멈췄으면 ok false.
 */
export function batchRunMessage(run: BatchRunResult): { ok: boolean; text: string } {
  const sent = submittedText(run.submitted);
  const parts: string[] = [];
  if (sent) parts.push(`일괄 처리로 맡겼어요: ${sent}.`);
  if (run.held > 0) parts.push(`월 한도 때문에 ${run.held}개는 다음에 맡겨요.`);
  const stop = run.stopped;
  const heldOnly = stop?.reason === "limit" && stop.which === "monthly" && run.held > 0;
  if (stop && !heldOnly) {
    parts.push(batchStopText(stop));
    return { ok: stop.reason === "time", text: parts.join(" ") };
  }
  if (parts.length > 0) return { ok: sent !== "", text: parts.join(" ") };
  const saved = run.saved.extract + run.saved.score;
  return {
    ok: true,
    text: saved > 0 ? `끝난 일괄 결과를 ${saved}개 저장했어요. 새로 맡길 공고는 없어요.` : "맡길 공고가 없어요.",
  };
}

/** 10/30 06:12 (이 PC 시간) */
function monthDayTime(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd} ${hhmm(d)}`;
}

/** 진행 중 일괄 줄: 종류별 한 줄, 맡긴 수는 합, 시각은 가장 이른 것 (R105) */
export function batchLines(states: readonly BatchState[]): { kind: BatchState["kind"]; text: string }[] {
  const lines: { kind: BatchState["kind"]; text: string }[] = [];
  for (const kind of ["extract", "score", "family"] as const) {
    const same = states.filter((s) => s.kind === kind);
    if (same.length === 0) continue;
    const count = same.reduce((sum, s) => sum + s.count, 0);
    const earliest = same.reduce((min, s) => Math.min(min, new Date(s.submittedAt).getTime()), Infinity);
    lines.push({ kind, text: `${BATCH_KIND_LABEL[kind]} ${count}개 맡김 · ${monthDayTime(new Date(earliest))}` });
  }
  return lines;
}

/** 진행 중 일괄이 있어 [지금 평가]를 끈 까닭 (버튼 title) */
export const BATCH_BUSY_TITLE = "맡긴 일괄 처리가 끝나면 다시 누를 수 있어요";

export function pauseText(until: Date): string {
  return `예약 처리와 겹치지 않게 ${hhmm(until)}까지 쉬는 중`;
}
