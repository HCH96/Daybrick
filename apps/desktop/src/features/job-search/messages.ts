import type { ApiErrorKind } from "../server/management";
import type { CollectFailReason, ProfileGenerateFailure } from "./api";
import type { ForceFailure } from "./postingApi";
import type { ProcessStop } from "./recommendApi";
import type { PostingStage } from "./types";

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

// ===== 사이트 추가·시험 수집·어댑터 교체 (R28, R29, R32) =====

export const TESTING = "시험 수집 중… 목록과 처음 5개 공고를 읽고 있어요.";
export const TEST_IDLE = "왼쪽을 채우고 [시험 수집]을 누르면 읽힌 공고 수와 처음 5개가 여기 나와요.";
export const TEST_NEEDED = "시험 수집이 성공해야 저장할 수 있어요.";
export const ADD_SITE_NOTE = "저장하면 다음 수집부터 포함돼요";
export const INVALID_SITE_URL = "주소는 http:// 또는 https://로 시작해야 해요.";
export const NO_RULE_FILE = "규칙 파일(.json)을 골라 주세요.";

export function replaceNote(nextVersion: number): string {
  return `저장하면 v${nextVersion}이 되고, 이 어댑터를 쓰는 사이트는 다음 수집부터 새 규칙을 써요`;
}

/** 시험 수집 함수를 부르지 못했을 때 (예전 함수면 test를 몰라 server 오류) */
export function testCallErrorMessage(kind: ApiErrorKind): string {
  if (kind === "not-found" || kind === "server") {
    return "시험 수집을 하지 못했어요. 서버 업데이트로 수집 함수를 새로 올렸는지 확인해 주세요.";
  }
  return `시험 수집을 하지 못했어요. ${reason(kind)}`;
}

export function missingVarsMessage(missing: string[]): string {
  return `사이트별 값이 비어 있어요: ${missing.join(", ")}`;
}

export function testPassedMessage(read: number, ms: number): string {
  return `시험 수집 성공 · 공고 ${read}개를 읽었어요 (${(ms / 1000).toFixed(1)}초)`;
}

export function testFailedMessage(problem: string | null): string {
  return `저장할 수 없어요: ${problem ?? "알 수 없는 이유"}`;
}

export function siteAddErrorMessage(kind: ApiErrorKind): string {
  return `사이트를 저장하지 못했어요. ${reason(kind)}`;
}

/** 버전이 겹치면(다른 곳에서 먼저 바꿈) bad-response로 온다 */
export function adapterReplaceErrorMessage(kind: ApiErrorKind): string {
  if (kind === "bad-response") return "어댑터가 그사이 바뀌었어요. 창을 닫고 다시 열어 주세요.";
  return `어댑터를 바꾸지 못했어요. ${reason(kind)}`;
}

export const COPIED = "복사했어요";
export const COPY_FAILED = "복사하지 못했어요";
export const NAME_NEEDED = "사이트 이름을 넣어 주세요.";
export const PICK_ADAPTER = "어댑터를 골라 주세요.";
export const RULE_HAS_ERRORS = "규칙 파일의 형식 오류를 고친 뒤 다시 올려 주세요.";

/** 새 버전이 요구하는 사이트별 값이 시험 사이트에 없을 때 (사이트 값은 이 창에서 바꾸지 않는다) */
export function testSiteMissingVarsMessage(siteName: string, missing: string[]): string {
  return `새 규칙이 요구하는 값(${missing.join(", ")})이 ${siteName} 사이트에 없어요. 같은 값 이름을 쓰는 규칙으로 올려 주세요.`;
}

export function siteAddedMessage(name: string): string {
  return `${name} 사이트를 추가했어요. 다음 수집부터 포함돼요.`;
}

export function adapterReplacedMessage(name: string, version: number): string {
  return `${name} 어댑터를 v${version}로 바꿨어요.`;
}

// ===== 필터 (R41–R47) =====

export function filtersLoadErrorMessage(kind: ApiErrorKind): string {
  return `필터를 읽지 못했어요. ${reason(kind)}`;
}

export function filterChangeErrorMessage(kind: ApiErrorKind): string {
  return `필터를 바꾸지 못했어요. ${reason(kind)}`;
}

/** 필터는 바뀌었지만 공고를 되돌리지 못했을 때 (R47) */
export function refilterErrorMessage(kind: ApiErrorKind): string {
  return `필터는 바꿨지만 공고에 다시 적용하지 못했어요. 조건을 한 번 더 바꾸면 다시 시도해요. ${reason(kind)}`;
}

export function refilteredMessage(count: number): string {
  return count > 0
    ? `바꿨어요. 아직 채점하지 않은 공고 ${count}개를 다음 처리 때 다시 걸러요.`
    : "바꿨어요. 다음 처리부터 적용돼요.";
}

export function flowLoadErrorMessage(kind: ApiErrorKind): string {
  return `이번 주 공고 수를 읽지 못했어요. ${reason(kind)}`;
}

export const FILTER_FOOT_NOTE =
  "켜진 조건을 모두 만족해야 통과해요. 조건을 바꾸면 아직 채점하지 않은 공고에만 다시 적용하고, 이미 채점한 결과는 그대로 둬요.";

// ===== 추천 공고 (R4–R8, R23) =====

export function recommendLoadErrorMessage(kind: ApiErrorKind): string {
  return `추천 공고를 읽지 못했어요. ${reason(kind)}`;
}

export const NO_RECOMMEND = "아직 채점된 공고가 없어요. 수집 사이트 탭에서 [지금 수집]을 누르면 수집·채점이 시작돼요.";
export const NOT_COLLECTED_YET = "아직 수집 안 함";
export const WAITING_NOTE = "한도에 걸려 내일 이어서 채점";
export const RESCORING = "다시 채점하는 중…";

export function staleNote(count: number): string {
  return `프로필이 바뀌어 ${count}개가 이전 프로필 기준이에요`;
}

/** 다시 채점 함수를 부르지 못했을 때 */
export function rescoreCallErrorMessage(kind: ApiErrorKind): string {
  if (kind === "not-found") return "처리 서버 함수가 없어요. 서버 업데이트를 해 주세요.";
  return `다시 채점하지 못했어요. ${reason(kind)}`;
}

/** 다시 채점이 중간에 멈췄을 때 (D37 stopped) */
export function rescoreStopMessage(stop: ProcessStop, done: number, remaining: number): string {
  const head = `${done}개를 다시 채점했고 ${remaining}개가 남았어요.`;
  switch (stop.reason) {
    case "limit":
      return `${head} ${aiLimitMessage(stop.which)}`;
    case "credit":
      return `${head} ${AI_CREDIT_MESSAGE}`;
    case "no-profile":
      return "저장된 프로필이 없어요. 프로필 탭에서 프로필을 저장해 주세요.";
    case "time":
      return `${head} [다시 채점]을 한 번 더 눌러 이어 주세요.`;
    case "missing-key":
      return `${head} 서버에 Anthropic 키가 없어요. 설정에서 서버 업데이트를 해 주세요.`;
    case "network":
    case "upstream":
      return `${head} AI 서버에 닿지 못했어요. 잠시 뒤 다시 시도해 주세요.`;
    case "database":
      return `${head} 서버에서 점수를 저장하지 못했어요.`;
  }
}

export function rescoredMessage(done: number): string {
  return `${done}개를 지금 프로필로 다시 채점했어요.`;
}

// ===== 상세 팝업·걸러진 공고·보관함 (R9–R16, R46, R49) =====

export function postingLoadErrorMessage(kind: ApiErrorKind): string {
  return `공고를 읽지 못했어요. ${reason(kind)}`;
}

export const POSTING_GONE = "이 공고를 찾지 못했어요. 지워졌을 수 있어요.";

export function listLoadErrorMessage(kind: ApiErrorKind): string {
  return `목록을 읽지 못했어요. ${reason(kind)}`;
}

export function hideErrorMessage(kind: ApiErrorKind): string {
  return `보관함으로 옮기지 못했어요. ${reason(kind)}`;
}

export function restoreErrorMessage(kind: ApiErrorKind): string {
  return `되돌리지 못했어요. ${reason(kind)}`;
}

export const IMAGE_LOAD_ERROR = "공고 이미지를 읽지 못했어요.";
export const NO_BODY_YET = "원문을 아직 받지 못했어요. 다음 수집 때 이어 받아요.";
export const NOT_EXTRACTED = "아직 항목을 추출하지 않았어요. [그래도 채점]을 누르면 추출부터 해요.";
export const NO_REASON = "해당 내용 없음";
export const FORCE_SCORING = "채점하는 중… 1분쯤 걸릴 수 있어요.";
export const NO_FILTERED = "걸러진 공고가 없어요.";
export const NO_ARCHIVED = "보관한 공고가 없어요.";
export const FILTERED_DESC = "필터나 인젝션 검사에 걸려 채점하지 않은 공고예요. 줄을 누르면 상세 팝업이 열려요.";
export const ARCHIVED_DESC = "여기 있는 공고는 다시 수집되어도 추천 목록에 나오지 않아요. 되돌리면 추천 목록으로 돌아가요.";
export const INJECTION_TITLE = "프롬프트 인젝션 의심 공고예요";
export const INJECTION_BODY =
  "공고 안에 AI에게 하는 지시로 보이는 문장이 있어 채점하지 않았어요. 내용을 확인하고 괜찮으면 \"그래도 채점\"을 눌러 주세요.";
export const INJECTION_SCORED_BODY = "공고 안에 AI에게 하는 지시로 보이는 문장이 있어요. \"그래도 채점\"으로 채점한 공고예요.";

/** 그래도 채점 결과 (D37 force) */
export function forceDoneMessage(stage: PostingStage): string {
  return stage === "scored" ? "채점했어요. 추천 목록에 들어갔어요." : "처리했지만 아직 채점이 끝나지 않았어요.";
}

export function forceFailMessage(failure: ForceFailure): string {
  switch (failure.reason) {
    case "limit":
      return aiLimitMessage(failure.which);
    case "credit":
      return AI_CREDIT_MESSAGE;
    case "no-profile":
      return "저장된 프로필이 없어요. 프로필 탭에서 프로필을 저장해 주세요.";
    case "no-body":
      return "원문을 아직 받지 못해 채점할 수 없어요. 다음 수집 뒤 다시 눌러 주세요.";
    case "not-found":
      return POSTING_GONE;
    case "missing-key":
      return "서버에 Anthropic 키가 없어요. 설정에서 서버 업데이트를 해 주세요.";
    case "network":
    case "upstream":
      return "AI 서버에 닿지 못했어요. 잠시 뒤 다시 시도해 주세요.";
    case "database":
      return "서버에서 결과를 저장하지 못했어요.";
  }
}

export function forceCallErrorMessage(kind: ApiErrorKind): string {
  if (kind === "not-found") return "처리 서버 함수가 없어요. 서버 업데이트를 해 주세요.";
  return `채점하지 못했어요. ${reason(kind)}`;
}
