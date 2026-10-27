import type { ApiErrorKind } from "../server/management";

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
