import { createContext, useContext } from "react";
import type { ServerSession } from "./session";
import type { ServerConfig, ServerStatus } from "./types";

export interface ServerState {
  /** 파일을 다 읽기 전에는 null */
  config: ServerConfig | null;
  /** 1단계에서는 연결 정보가 있으면 connected, 없으면 off (7단계에서 접속 확인으로 넓힌다) */
  status: ServerStatus;
  /** 연결 정보 일부를 바꾸고 바로 저장한다 */
  updateConfig: (patch: Partial<Omit<ServerConfig, "version">>) => Promise<void>;
  /** 이 PC에 저장한 연결 정보와 로그인 정보를 지운다 */
  clearConnection: () => Promise<void>;
  /** 로그인한 상태 (없으면 null). 켤 때 저장된 로그인 정보로 복원한다 (R31). */
  session: ServerSession | null;
  /** 켤 때 로그인 복원을 마쳤는지 (연결 정보가 없으면 바로 true) */
  sessionReady: boolean;
  /**
   * 로그인에 성공했을 때: 연결 정보를 server.json에 저장하고 세션을 바꾼다.
   * 연결 정보는 이때 처음 저장한다 (그 전에 취소하면 아무것도 남지 않음).
   */
  completeLogin: (connection: { url: string; anonKey: string }, session: ServerSession) => Promise<void>;
  /** 연결 마법사가 열려 있는지 */
  setupOpen: boolean;
  /** 연결 마법사를 연다 (첫 실행 안내·설정의 [서버 연결 시작]) */
  openSetup: () => void;
  /** 연결 마법사를 닫고 원래 화면으로 돌아간다 */
  closeSetup: () => void;
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
