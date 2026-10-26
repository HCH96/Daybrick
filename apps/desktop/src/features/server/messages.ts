import type { LoginErrorKind } from "./googleLogin";
import type { KeysCheck } from "./probe";
import type { ApiErrorKind, SetupPrecheck } from "./management";
import { stepsForFlow, type RunFlow } from "./serverUpdate";
import type { RunFailure } from "./setupRunner";
import type { ServerStatus } from "./types";

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

/**
 * PAT 접근 확인 실패 문구 (R13). 제목도 원인에 맞춘다: 틀린 토큰(401) / 권한 없음(403·404) / 접속 실패.
 * Supabase는 형식이 틀린 토큰에도 401을 돌려준다 (2026-10-27 확인).
 */
function patFailMessage(reason: ApiErrorKind, ref: string): ServerMessage {
  switch (reason) {
    case "unauthorized":
      return {
        tone: "bad",
        title: "PAT가 맞지 않습니다",
        desc: "토큰이 틀렸거나 만료됐습니다. 새로 발급해 붙여넣으세요.",
      };
    case "forbidden":
    case "not-found":
      return {
        tone: "bad",
        title: "PAT로 이 프로젝트에 접근할 수 없습니다",
        desc: `PAT를 만든 계정이 이 프로젝트(${ref})를 관리할 수 있는지 확인하세요.`,
      };
    case "network":
      return {
        tone: "bad",
        title: "Supabase에 접속하지 못해 PAT를 확인하지 못했습니다",
        desc: "인터넷 연결을 확인하고 다시 [세팅 시작]을 누르세요.",
      };
    case "rate-limited":
    case "server":
    case "bad-response":
      return { tone: "bad", title: "PAT를 확인하지 못했습니다", desc: transientDesc(reason) ?? "" };
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
      return patFailMessage(precheck.reason, ref);
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

/** 안내 띠가 있는 상태 (연결됨·연결 안 함은 띠 없음, R40) */
export type BannerStatus = Exclude<ServerStatus, "connected" | "off">;

/** 안내 띠 색: 할 일이 있음 주황, 접속 불가 빨강, 앱 업데이트 보라 */
export type BannerTone = "warn" | "bad" | "info";

/** 안내 띠 문구 (R40). link는 밑줄 링크 글자. */
export const BANNER_TEXTS: Record<BannerStatus, { tone: BannerTone; message: string; link: string }> = {
  "login-needed": { tone: "warn", message: "로그인이 필요합니다.", link: "설정에서 로그인" },
  "server-update": { tone: "warn", message: "서버 업데이트가 필요합니다.", link: "업데이트하기" },
  "app-update": { tone: "info", message: "앱을 업데이트하세요.", link: "자세히" },
  paused: { tone: "warn", message: "서버가 일시정지됐습니다.", link: "재개 방법 보기" },
  unreachable: { tone: "bad", message: "서버에 접속할 수 없습니다.", link: "몇 분마다 다시 확인 중 · 설정 열기" },
};

/** 재개 안내 팝업의 이유 (R42) */
export const RESUME_REASON =
  "Supabase 무료 플랜은 7일 동안 쓰지 않으면 서버를 멈춥니다. 데이터는 그대로 있고, 다시 켜면 1~2분 뒤 이어서 쓸 수 있습니다.";

/** [여기서 재개] 실패 문구 (R42). PAT 값은 넣지 않는다. */
export function resumeFailMessage(reason: ApiErrorKind): { title: string; desc: string } {
  switch (reason) {
    case "unauthorized":
      return { title: "PAT가 맞지 않습니다", desc: "토큰이 틀렸거나 만료됐습니다. 새로 발급해 붙여넣으세요." };
    case "forbidden":
    case "not-found":
      return {
        title: "이 프로젝트를 재개할 권한이 없습니다",
        desc: "PAT를 만든 계정이 이 프로젝트를 관리할 수 있는지 확인하세요. 대시보드에서 직접 재개할 수도 있습니다.",
      };
    case "network":
      return { title: "Supabase에 접속할 수 없습니다", desc: "인터넷 연결을 확인한 뒤 다시 시도하세요." };
    case "rate-limited":
      return { title: "Supabase가 요청을 거절했습니다 (429)", desc: "잠시 뒤 다시 시도하세요." };
    case "server":
    case "bad-response":
      return {
        title: "재개를 요청하지 못했습니다",
        desc: "Supabase가 예상하지 못한 응답을 보냈습니다. 대시보드에서 직접 재개해 보세요.",
      };
  }
}

/** 실패 문구 끝에 붙이는 말: 다시 시도는 실패한 단계부터 (R17) */
const RETRY_NOTE = "완료된 단계는 다시 하지 않습니다.";

/** 로그인 실패 문구 (R51, R53). 등록되지 않은 계정은 따로 거부 카드를 보여준다. */
export function loginFailMessage(kind: LoginErrorKind): { title: string; desc: string } {
  switch (kind) {
    case "login-denied":
      return {
        title: "이 서버에 등록된 계정이 아닙니다",
        desc: "이 서버는 처음 세팅한 Google 계정 하나만 쓸 수 있습니다.",
      };
    case "login-timeout":
      return {
        title: "로그인을 기다리다 시간이 지났습니다",
        desc: "5분 안에 브라우저에서 로그인을 마치지 않았습니다. 다시 로그인하세요.",
      };
    case "login-cancelled":
      return { title: "로그인을 마치지 않았습니다", desc: "브라우저에서 로그인을 취소했습니다. 다시 로그인하세요." };
    case "network":
      return { title: "서버에 접속할 수 없습니다", desc: "인터넷 연결을 확인한 뒤 다시 로그인하세요." };
    case "login-failed":
      return {
        title: "Google 로그인에 실패했습니다",
        desc: "서버의 Google 로그인 설정(클라이언트 ID·비밀값, 리디렉션 주소)을 확인한 뒤 다시 시도하세요.",
      };
  }
}

/** ③ 실행·서버 업데이트 중 단계가 실패했을 때 그 줄 아래 보여주는 이유 (R17, R23) */
export function runFailMessage(failure: RunFailure, flow: RunFlow = "setup"): { title: string; desc: string } {
  const step = stepsForFlow(flow)[failure.index];
  const name = step?.name ?? (flow === "update" ? "서버 업데이트" : flow === "rerun" ? "다시 실행" : "세팅");
  switch (failure.reason) {
    case "login-denied":
    case "login-timeout":
    case "login-cancelled":
    case "login-failed": {
      const login = loginFailMessage(failure.reason);
      return { title: login.title, desc: `${login.desc} [다시 시도]를 누르면 브라우저를 다시 엽니다.` };
    }
    case "key-check-failed":
      if (flow === "rerun") {
        return {
          title: "서버에서 Anthropic 키가 동작하지 않습니다",
          desc: "등록된 키가 만료됐거나 결제 수단에 문제가 있을 수 있습니다. 창을 닫고 Anthropic 키 [교체]로 새 키를 넣으세요.",
        };
      }
      return {
        title: "서버에서 Anthropic 키가 동작하지 않습니다",
        desc: `비밀값 등록이 아직 반영되지 않았을 수 있습니다. 잠시 뒤 다시 시도하세요. ${RETRY_NOTE}`,
      };
    case "schema-mismatch":
      return {
        title: "서버 구조 번호가 앱과 다릅니다",
        desc: `서버 구조 적용이 끝나지 않았을 수 있습니다. 다시 시도하세요. ${RETRY_NOTE}`,
      };
  }
  // 마무리 확인의 서버 오류는 PAT가 아니라 로그인·서버 함수 쪽 원인이다
  if (step?.id === "verify" && failure.reason !== "network" && failure.reason !== "rate-limited") {
    return {
      title: `${name}에 실패했습니다`,
      desc: `서버 함수가 아직 준비되지 않았거나 로그인이 풀렸습니다. 잠시 뒤 다시 시도하세요. ${RETRY_NOTE}`,
    };
  }
  switch (failure.reason) {
    case "network":
      return {
        title: "서버에 접속할 수 없습니다",
        desc: `인터넷 연결을 확인한 뒤 [다시 시도]를 누르세요. ${RETRY_NOTE}`,
      };
    case "rate-limited":
      return { title: "Supabase가 요청을 거절했습니다 (429)", desc: `잠시 뒤 다시 시도하세요. ${RETRY_NOTE}` };
    case "unauthorized":
      if (flow === "rerun") {
        return {
          title: "PAT가 맞지 않습니다",
          desc: "토큰이 틀렸거나 만료됐습니다. 창을 닫고 새 PAT로 다시 실행하세요. 끝난 단계는 다시 해도 데이터가 지워지지 않습니다.",
        };
      }
      if (flow === "update") {
        return {
          title: "PAT가 맞지 않습니다",
          desc: "토큰이 틀렸거나 만료됐습니다. [나중에]를 누르고 다시 열어 새 PAT로 [업데이트]를 누르세요. 끝난 단계는 다시 해도 데이터가 지워지지 않습니다.",
        };
      }
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

/** 설정 서버 연결 칸 머리 오른쪽의 상태 점·글자 (R40 색): 연결됨 초록, 할 일 있음 주황, 접속 불가 빨강, 연결 안 함 회색 */
export const SETTINGS_STATE: Record<ServerStatus, { tone: "ok" | "warn" | "bad" | "none"; label: string }> = {
  connected: { tone: "ok", label: "연결됨" },
  off: { tone: "none", label: "연결 안 함" },
  "login-needed": { tone: "warn", label: "로그인 필요" },
  "server-update": { tone: "warn", label: "서버 업데이트 필요" },
  "app-update": { tone: "warn", label: "앱 업데이트 필요" },
  paused: { tone: "warn", label: "일시정지" },
  unreachable: { tone: "bad", label: "접속 불가" },
};

/** Anthropic 키 교체에서 어느 단계가 실패했는지 */
export type KeyReplaceFailure =
  | { step: "anthropic" | "pat" | "record"; reason: ApiErrorKind }
  | { step: "server-check"; reason: ApiErrorKind | "key-check-failed" };

/** Anthropic 키 교체 실패 문구 (R49). 키·PAT 값은 넣지 않는다. */
export function keyReplaceFailMessage(failure: KeyReplaceFailure): ServerMessage {
  // 인터넷·Supabase 쪽 원인이면 값이 아니라 잠시 뒤 다시 하라고 안내한다
  const transient =
    failure.reason === "network" || failure.reason === "rate-limited" || failure.reason === "server"
      ? "인터넷 연결을 확인하고 잠시 뒤 다시 [확인 후 교체]를 누르세요. 서버의 키는 바뀌지 않았습니다."
      : null;
  switch (failure.step) {
    case "anthropic":
      return {
        tone: "bad",
        title: "새 Anthropic 키를 확인하지 못했습니다",
        desc: transient ?? "키가 틀렸거나 결제 수단이 등록되지 않았습니다. 서버의 키는 바뀌지 않았습니다.",
      };
    case "pat":
      return {
        tone: "bad",
        title: "서버의 키를 바꾸지 못했습니다",
        desc:
          transient ??
          (failure.reason === "unauthorized"
            ? "PAT가 틀렸거나 만료됐습니다. 새로 발급해 붙여넣으세요. 서버의 키는 바뀌지 않았습니다."
            : "PAT를 만든 계정이 이 프로젝트를 관리할 수 있는지 확인하세요. 서버의 키는 바뀌지 않았습니다."),
      };
    case "record":
      return {
        tone: "warn",
        title: "키는 바꿨지만 등록일을 기록하지 못했습니다",
        desc: "서버의 키는 새 키로 바뀌었습니다. 로그인이 풀렸을 수 있으니 확인한 뒤 다시 교체하면 등록일이 기록됩니다.",
      };
    case "server-check":
      return {
        tone: "warn",
        title: "키는 바꿨지만 서버에서 아직 확인되지 않았습니다",
        desc: "비밀값이 반영되는 데 잠시 걸릴 수 있습니다. 조금 뒤 [자동 세팅 다시 실행]으로 마무리 확인을 해 보세요.",
      };
  }
}

/** 서버 연결 해제 확인 팝업 (R50) */
export const DISCONNECT_CONFIRM = {
  title: "서버 연결을 해제할까요?",
  message:
    "이 PC에 저장한 서버 주소·키와 로그인 정보를 지웁니다. 알림·구직 관리처럼 서버가 필요한 기능은 쓸 수 없게 됩니다. 같은 주소로 다시 연결하면 데이터를 그대로 이어서 씁니다.",
  confirmLabel: "연결 해제",
};

/** 다른 Supabase로 바꾸기 확인 팝업 (R50) */
export function switchConfirm(ref: string | null): { title: string; message: string; confirmLabel: string } {
  const current = ref ? `지금 연결(${ref})` : "지금 연결";
  return {
    title: "다른 Supabase로 바꿀까요?",
    message: `${current}을 해제하고 처음 연결 화면을 엽니다. 지금 서버의 데이터는 새 서버로 옮겨지지 않습니다.`,
    confirmLabel: "해제하고 새로 연결",
  };
}

/** 연결 해제·바꾸기 팝업의 초록 문구 (R50) */
export const SERVER_DATA_KEPT = "서버의 데이터는 지워지지 않습니다";
