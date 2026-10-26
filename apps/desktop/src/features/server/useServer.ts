import { createContext, useContext } from "react";
import type { ServerConfig, ServerStatus } from "./types";

export interface ServerState {
  /** 파일을 다 읽기 전에는 null */
  config: ServerConfig | null;
  /** 1단계에서는 연결 정보가 있으면 connected, 없으면 off (7단계에서 접속 확인으로 넓힌다) */
  status: ServerStatus;
  /** 연결 정보 일부를 바꾸고 바로 저장한다 */
  updateConfig: (patch: Partial<Omit<ServerConfig, "version">>) => Promise<void>;
  /** 이 PC에 저장한 연결 정보를 지운다 */
  clearConnection: () => Promise<void>;
}

/** 서버 연결 정보와 상태를 하위 컴포넌트에 공유한다. ServerProvider가 값을 넣는다. */
export const ServerContext = createContext<ServerState | null>(null);

export function useServer(): ServerState {
  const server = useContext(ServerContext);
  if (!server) {
    throw new Error("useServer는 ServerProvider 안에서만 쓸 수 있다.");
  }
  return server;
}
