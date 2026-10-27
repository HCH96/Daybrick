import type { ApiErrorKind } from "../server/management";
import { hhmm } from "./cronSlots";
import { AI_CREDIT_MESSAGE, aiLimitMessage, reason } from "./messages";
import type { ProcessStop } from "./recommendApi";

/** 처리 상태 줄과 [지금 평가] 문구 (사용자 테스트 r1 추가 요청 3·5) */

export const PROCESS_NOTHING = "처리할 공고 없음";

export function processStateErrorMessage(kind: ApiErrorKind): string {
  return `처리 상태를 읽지 못했어요. ${reason(kind)}`;
}

export function processCallErrorMessage(kind: ApiErrorKind, done: number): string {
  const head = done > 0 ? `${done}개를 평가한 뒤 멈췄어요. ` : "";
  if (kind === "not-found") return `${head}처리 서버 함수가 없어요. 서버 업데이트를 해 주세요.`;
  return `${head}평가를 부르지 못했어요. ${reason(kind)}`;
}

export function processDoneMessage(done: number): string {
  return done > 0 ? `대기 공고를 모두 처리했어요. 이번에 ${done}개를 평가했어요.` : "대기 공고가 없어요.";
}

export function processCancelMessage(done: number, remaining: number): string {
  return `멈췄어요. 이번에 ${done}개를 평가했고 ${remaining}개가 남았어요. 남은 공고는 예약 처리가 이어 받아요.`;
}

export function processLeftMessage(done: number, remaining: number): string {
  return `이번에 ${done}개를 평가했고 ${remaining}개가 남았어요. [지금 평가]를 다시 누르면 이어서 해요.`;
}

/** 평가가 중간에 멈춘 이유 (js-process stopped) */
export function processStopMessage(stop: ProcessStop, done: number, remaining: number): string {
  const head = `${done}개를 평가했고 ${remaining}개가 남았어요.`;
  switch (stop.reason) {
    case "limit":
      return `${head} ${aiLimitMessage(stop.which)}`;
    case "credit":
      return `${head} ${AI_CREDIT_MESSAGE}`;
    case "no-profile":
      return `${head} 저장된 프로필이 없어 채점은 못 했어요. 프로필 탭에서 프로필을 저장해 주세요.`;
    case "time":
      return processLeftMessage(done, remaining);
    case "missing-key":
      return `${head} 서버에 Anthropic 키가 없어요. 설정에서 서버 업데이트를 해 주세요.`;
    case "network":
    case "upstream":
      return `${head} AI 서버에 닿지 못했어요. 잠시 뒤 다시 시도해 주세요.`;
    case "database":
      return `${head} 서버에서 결과를 저장하지 못했어요.`;
  }
}

export function pauseText(until: Date): string {
  return `예약 처리와 겹치지 않게 ${hhmm(until)}까지 쉬는 중`;
}

/** 120 → "약 2시간", 45 → "약 45분" */
export function etaText(minutes: number): string {
  if (minutes < 60) return `약 ${minutes}분`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `약 ${h}시간` : `약 ${h}시간 ${m}분`;
}
