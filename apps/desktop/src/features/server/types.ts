/** 서버 연결 상태. 1단계에서는 off/connected만 쓰고, 나머지는 7·8단계에서 판정한다. */
export type ServerStatus =
  | "connected"
  | "off"
  | "login-needed"
  | "server-update"
  | "app-update"
  | "paused"
  | "unreachable";

/** 이 PC에 저장한 Supabase 연결 정보. 주소·anon 키는 공개돼도 되는 값이다. */
export interface ServerConnection {
  url: string;
  anonKey: string;
  connectedAt: string; // ISO 시각
}

/** server.json (앱 데이터 폴더) 내용 */
export interface ServerConfig {
  version: 1;
  connection: ServerConnection | null;
  welcomeDismissed: boolean; // 첫 실행 안내에서 [나중에 하기]를 눌렀는지
  lastCheck: { status: ServerStatus; at: string } | null;
}
