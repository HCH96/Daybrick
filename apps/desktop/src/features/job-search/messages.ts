import type { ApiErrorKind } from "../server/management";
import type { CollectFailReason, ProfileGenerateFailure } from "./api";

/** 구직 관리 화면의 오류·안내 문구는 모두 여기 둔다. 키·토큰 값은 어떤 문구에도 넣지 않는다. */

function reason(kind: ApiErrorKind): string {
  switch (kind) {
    case "network":
      return "인터넷 연결을 확인해 주세요.";
    case "unauthorized":
      return "로그인이 만료됐어요. 설정에서 다시 로그인해 주세요.";
    case "forbidden":
      return "권한이 없어요. 서버 업데이트가 끝났는지 확인해 주세요.";
    case "not-found":
      return "서버에 필요한 표가 없어요. 서버 업데이트를 해 주세요.";
    case "rate-limited":
      return "요청이 많아요. 잠시 뒤 다시 시도해 주세요.";
    case "bad-response":
      return "서버 응답을 읽지 못했어요.";
    case "server":
      return "서버에서 오류가 났어요. 잠시 뒤 다시 시도해 주세요.";
  }
}

/** 설정·사용량을 읽지 못했을 때 */
export function loadErrorMessage(kind: ApiErrorKind): string {
  return `구직 관리 설정을 읽지 못했어요. ${reason(kind)}`;
}

/** 저장하지 못했을 때 */
export function saveErrorMessage(kind: ApiErrorKind): string {
  return `저장하지 못했어요. ${reason(kind)}`;
}

export const SAVED_MESSAGE = "저장했어요";
export const BALANCE_SAVED_MESSAGE = "기준 잔액을 넣었어요. 지금부터 사용액을 $0부터 다시 세요.";
export const INVALID_DAILY_LIMIT = "하루 호출 수는 1 이상의 정수로 넣어 주세요.";
export const INVALID_MONTHLY_LIMIT = "월 사용액은 0보다 큰 숫자로 넣어 주세요.";
export const INVALID_BALANCE = "잔액은 0 이상의 숫자로 넣어 주세요.";
export const INVALID_PRICE = "단가는 0 이상의 숫자로 넣어 주세요.";
export const CALC_NOTE = "이 앱의 호출만 계산한 값";
export const CALC_HINT = "사용액은 이 앱의 호출만 계산한 값이라 실제 잔액과 다를 수 있어요.";

// ===== 프로필 (R17–R22) =====

/** 자료·프로필을 읽지 못했을 때 */
export function profileLoadErrorMessage(kind: ApiErrorKind): string {
  return `프로필을 읽지 못했어요. ${reason(kind)}`;
}

export function sourceAddErrorMessage(name: string, kind: ApiErrorKind): string {
  return `"${name}"을(를) 넣지 못했어요. ${reason(kind)}`;
}

export function sourceDeleteErrorMessage(kind: ApiErrorKind): string {
  return `자료를 지우지 못했어요. ${reason(kind)}`;
}

export function unsupportedFileMessage(name: string): string {
  return `"${name}"은(는) 넣을 수 없어요. PDF나 마크다운(.md) 파일만 넣을 수 있어요.`;
}

export function fileTooLargeMessage(name: string, limitMb: number): string {
  return `"${name}"이(가) 너무 커요. 파일 하나는 ${limitMb}MB까지 넣을 수 있어요.`;
}

export const EMPTY_PASTE = "붙여 넣을 내용을 넣어 주세요.";
export const NO_SOURCES_HINT = "자료를 하나 이상 넣으면 프로필을 만들 수 있어요.";

/** AI 사용을 멈추게 한 한도·크레딧 안내 (프로필 만들기·채점 등에서 같이 쓴다, R74, R78) */
export function aiLimitMessage(which: "daily" | "monthly"): string {
  return which === "daily"
    ? "오늘 AI 호출 한도에 이르렀어요. 내일 다시 시도하거나 설정 탭에서 한도를 늘려 주세요."
    : "이번 달 AI 사용액 한도에 이르렀어요. 설정 탭에서 한도를 늘리거나 다음 달에 다시 시도해 주세요.";
}

export const AI_CREDIT_MESSAGE =
  "Anthropic 크레딧이 부족해요. Anthropic 콘솔에서 크레딧을 충전한 뒤 다시 시도해 주세요.";

/** 프로필 만들기 실패 (서버 함수가 돌려준 이유) */
export function profileGenerateFailMessage(
  failure: ProfileGenerateFailure,
): string {
  switch (failure.reason) {
    case "limit":
      return aiLimitMessage(failure.which);
    case "credit":
      return AI_CREDIT_MESSAGE;
    case "no-sources":
      return NO_SOURCES_HINT;
    case "too-large":
      return "PDF 자료가 너무 커요. 합계 20MB 아래로 줄여 주세요.";
    case "missing-key":
      return "서버에 Anthropic 키가 없어요. 설정에서 자동 세팅 다시 실행으로 키를 등록해 주세요.";
    case "network":
      return "서버에서 Anthropic에 연결하지 못했어요. 잠시 뒤 다시 시도해 주세요.";
    case "upstream":
      return "AI 응답에 문제가 있었어요. 잠시 뒤 다시 시도해 주세요.";
    case "bad-response":
      return "AI 결과를 읽지 못했어요. 다시 시도해 주세요.";
    case "database":
      return "서버에서 자료나 초안을 읽고 쓰지 못했어요. 서버 업데이트가 끝났는지 확인해 주세요.";
  }
}

/** 서버 함수를 부르지 못했을 때 (함수가 아직 배포되지 않았으면 not-found) */
export function profileCallErrorMessage(kind: ApiErrorKind): string {
  if (kind === "not-found") return "프로필 서버 함수가 없어요. 서버 업데이트를 해 주세요.";
  return `프로필을 만들지 못했어요. ${reason(kind)}`;
}

export function profileSaveErrorMessage(kind: ApiErrorKind): string {
  return `프로필을 저장하지 못했어요. ${reason(kind)}`;
}

export function draftDiscardErrorMessage(kind: ApiErrorKind): string {
  return `초안을 버리지 못했어요. ${reason(kind)}`;
}

export const PROFILE_GENERATED = "새 초안을 만들었어요. 고친 뒤 저장해 주세요.";
export const BLANK_FIELD = "자료에 없음";

// ===== 수집 사이트 (R24, R31, R34) =====

export function sourcesLoadErrorMessage(kind: ApiErrorKind): string {
  return `수집 사이트를 읽지 못했어요. ${reason(kind)}`;
}

export function siteToggleErrorMessage(kind: ApiErrorKind): string {
  return `사이트를 켜거나 끄지 못했어요. ${reason(kind)}`;
}

export function siteDeleteErrorMessage(kind: ApiErrorKind): string {
  return `사이트를 지우지 못했어요. ${reason(kind)}`;
}

export const SITE_DELETE_NOTE = "이미 모은 공고는 남아요";
export const NO_SITES = "수집할 사이트가 없어요. [사이트 추가]로 사이트를 넣어 주세요.";
export const NO_ADAPTERS = "등록된 어댑터가 없어요.";
export const COLLECTING = "수집하는 중… 최대 2분쯤 걸려요.";
export const NEVER_COLLECTED = "아직 수집 안 함";

/** 서버 함수를 부르지 못했을 때 (함수가 아직 배포되지 않았으면 not-found) */
export function collectCallErrorMessage(kind: ApiErrorKind): string {
  if (kind === "not-found") return "수집 서버 함수가 없어요. 서버 업데이트를 해 주세요.";
  return `수집하지 못했어요. ${reason(kind)}`;
}

/** 수집 함수가 실패로 돌려준 이유 */
export function collectFailMessage(failure: CollectFailReason): string {
  switch (failure) {
    case "no-sites":
      return "켜진 사이트가 없어요. 수집할 사이트를 켜 주세요.";
    case "database":
      return "서버에서 사이트나 공고를 읽고 쓰지 못했어요. 서버 업데이트가 끝났는지 확인해 주세요.";
    case "unauthorized":
      return reason("unauthorized");
  }
}

/** 지금 수집이 끝났을 때 한 줄: 새 공고 수, 실패한 사이트 수, 다음에 받을 원문 수 */
export function collectDoneMessage(added: number, failed: number, pending: number): string {
  const parts = [`수집을 마쳤어요. 새 공고 ${added}개`];
  if (failed > 0) parts.push(`실패한 사이트 ${failed}곳`);
  let text = parts.join(" · ");
  if (pending > 0) text += ` (원문 ${pending}개는 다음 수집 때 받아요)`;
  return text;
}
