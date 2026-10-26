import { APP_SCHEMA_VERSION, type KeysCheck } from "./probe";

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
      return okMessage(check.schema, check.route);
  }
}

function okMessage(schema: number | null, route: Extract<KeysCheck, { kind: "ok" }>["route"]): ServerMessage {
  const versions = `구조 ${schema ?? 0} / 앱 ${APP_SCHEMA_VERSION}`;
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
