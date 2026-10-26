import type { KeysCheck } from "./probe";
import type { ApiErrorKind, SetupPrecheck } from "./management";
import { RUN_STEPS, type RunFailure } from "./setupRunner";

/** 서버 연결 화면의 안내·오류 문구는 모두 여기 둔다. PAT·키 값은 어떤 문구에도 넣지 않는다. */

/** 결과 줄 색: 성공 초록, 오류 빨강, 일시정지 주황, 이미 세팅·업데이트 필요 보라 */
export type MessageTone = "ok" | "bad" | "warn" | "info";

export interface ServerMessage {
  tone: MessageTone;
  title: string;
  desc: string;
  /** 기본 브라우저로 여는 링크 (대시보드 등) */
  link?: { label: string; url: string };
}

export const SUPABASE_DASHBOARD_URL = "https://supabase.com/dashboard";

/** 프로젝트 대시보드 주소 */
export function projectDashboardUrl(ref: string): string {
  return `${SUPABASE_DASHBOARD_URL}/project/${ref}`;
}

/** ② 주소·키 확인 결과 문구 (R4, R6) */
export function keysCheckMessage(check: KeysCheck): ServerMessage {
  switch (check.kind) {
    case "bad-url":
      return {
        tone: "bad",
        title: "주소 형식이 맞지 않습니다",
        desc: "https://프로젝트id.supabase.co 모양이어야 합니다.",
      };
    case "bad-key-format":
      return {
        tone: "bad",
        title: "키 형식이 맞지 않습니다",
        desc: "eyJ…로 시작하는 anon 키나 sb_publishable_…로 시작하는 publishable 키를 넣으세요.",
      };
    case "secret-key":
      return {
        tone: "bad",
        title: "Secret 키는 넣을 수 없습니다",
        desc: "secret / service_role 키는 서버의 모든 데이터를 열 수 있습니다. anon 또는 publishable 키를 넣으세요.",
      };
    case "bad-key":
      return {
        tone: "bad",
        title: "키가 맞지 않습니다",
        desc: "이 주소의 프로젝트에서 복사한 anon 또는 publishable 키인지 확인하세요.",
      };
    case "unreachable":
      return {
        tone: "bad",
        title: "서버에 접속할 수 없습니다",
        desc: "인터넷 연결과 주소를 확인하세요. 프로젝트를 막 만들었다면 1~2분 뒤 다시 [확인].",
      };
    case "paused":
      return {
        tone: "warn",
        title: "서버가 일시정지돼 있습니다",
        desc: "대시보드에서 [Restore project]를 누른 뒤 다시 [확인]하세요.",
        link: { label: "대시보드 열기", url: projectDashboardUrl(check.ref) },
      };
    case "ok":
      return okMessage(check);
  }
}

function okMessage({ schema, appSchema, route }: Extract<KeysCheck, { kind: "ok" }>): ServerMessage {
  const versions = `구조 ${schema ?? 0} / 앱 ${appSchema}`;
  switch (route) {
    case "setup":
      return {
        tone: "ok",
        title: "접속했습니다 · 빈 서버",
        desc: "Daybrick 구조가 없는 새 서버입니다. 다음 단계에서 자동으로 세팅합니다.",
      };
    case "login":
      return {
        tone: "info",
        title: `접속했습니다 · 이미 세팅된 서버 (${versions})`,
        desc: "다른 PC에서 세팅한 서버입니다. [다음]을 누르면 로그인으로 넘어갑니다.",
      };
    case "login-update":
      return {
        tone: "info",
        title: `접속했습니다 · 서버 업데이트 필요 (${versions})`,
        desc: "로그인한 뒤 서버 업데이트를 진행합니다.",
      };
    case "app-update":
      return {
        tone: "info",
        title: `접속했습니다 · 앱 업데이트 필요 (${versions})`,
        desc: "서버가 이 앱보다 새 버전입니다. [다음]을 누르면 앱 업데이트 안내로 넘어갑니다.",
      };
  }
}

/** 네트워크·서버 쪽 원인일 때 덧붙이는 말 (값이 틀린 경우와 구분) */
function transientDesc(reason: ApiErrorKind): string | null {
  switch (reason) {
    case "network":
      return "인터넷 연결을 확인하고 다시 [세팅 시작]을 누르세요.";
    case "rate-limited":
      return "요청이 너무 많다고 합니다. 잠시 뒤 다시 [세팅 시작]을 누르세요.";
    case "server":
    case "bad-response":
      return "서버가 예상하지 못한 응답을 보냈습니다. 잠시 뒤 다시 [세팅 시작]을 누르세요.";
    default:
      return null;
  }
}

/** ③ [세팅 시작] 전 사전 확인 실패 문구 (R12–R14). 성공·빈 프로젝트 아님은 null. */
export function setupPrecheckMessage(precheck: SetupPrecheck, ref: string): ServerMessage | null {
  switch (precheck.kind) {
    case "ok":
    case "not-empty":
      return null;
    case "anthropic-failed":
      return {
        tone: "bad",
        title: "Anthropic 키를 확인하지 못했습니다",
        desc:
          transientDesc(precheck.reason) ??
          "키가 틀렸거나 결제 수단이 등록되지 않았습니다. 세팅은 시작하지 않았습니다.",
      };
    case "pat-failed":
      return {
        tone: "bad",
        title: "PAT로 이 프로젝트에 접근할 수 없습니다",
        desc:
          transientDesc(precheck.reason) ??
          (precheck.reason === "unauthorized"
            ? "토큰이 틀렸거나 만료됐습니다. 새로 발급해 붙여넣으세요."
            : `프로젝트 ${ref}에 권한이 있는 계정의 토큰인지, 만료되지 않았는지 확인하세요.`),
      };
    case "inspect-failed":
      return {
        tone: "bad",
        title: "서버의 테이블 목록을 읽지 못했습니다",
        desc:
          transientDesc(precheck.reason) ??
          `PAT에 프로젝트 ${ref}의 데이터베이스 권한이 있는지 확인하세요. 세팅은 시작하지 않았습니다.`,
      };
  }
}

/** 빈 프로젝트가 아닐 때 확인 팝업 (R14) */
export function notEmptyConfirm(otherTables: number): { title: string; message: string; confirmLabel: string } {
  return {
    title: "빈 프로젝트가 아닙니다",
    message: `Daybrick 구조는 없는데 다른 테이블이 ${otherTables}개 있습니다. 계속하면 기존 테이블은 그대로 두고 Daybrick 테이블을 추가합니다. 새 프로젝트를 쓰는 것을 권장합니다.`,
    confirmLabel: "그래도 계속",
  };
}

/** 실패 문구 끝에 붙이는 말: 다시 시도는 실패한 단계부터 (R17) */
const RETRY_NOTE = "완료된 단계는 다시 하지 않습니다.";

/** ③ 실행 중 단계가 실패했을 때 그 줄 아래 보여주는 이유 (R17) */
export function runFailMessage(failure: RunFailure): { title: string; desc: string } {
  const name = RUN_STEPS[failure.index]?.name ?? "세팅";
  switch (failure.reason) {
    case "network":
      return {
        title: "서버에 접속할 수 없습니다",
        desc: `인터넷 연결을 확인한 뒤 [다시 시도]를 누르세요. ${RETRY_NOTE}`,
      };
    case "rate-limited":
      return { title: "Supabase가 요청을 거절했습니다 (429)", desc: `잠시 뒤 다시 시도하세요. ${RETRY_NOTE}` };
    case "unauthorized":
      return {
        title: "PAT가 만료됐거나 취소됐습니다",
        desc: "[이전]을 눌러 새 PAT를 넣고 다시 [세팅 시작]을 누르세요. 끝난 단계는 다시 해도 데이터가 지워지지 않습니다.",
      };
    case "forbidden":
    case "not-found":
      return {
        title: `${name} 권한이 없습니다`,
        desc: "PAT를 만든 계정이 이 프로젝트를 관리할 수 있는지 확인하세요.",
      };
    case "server":
    case "bad-response":
      return {
        title: `${name}에 실패했습니다`,
        desc: `Supabase가 예상하지 못한 응답을 보냈습니다. 잠시 뒤 다시 시도하세요. ${RETRY_NOTE}`,
      };
  }
}
