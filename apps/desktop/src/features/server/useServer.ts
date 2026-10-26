import { createContext, useContext } from "react";
import type { ServerSession } from "./session";
import type { ServerConfig, ServerStatus } from "./types";

export interface ServerState {
  /** 파일을 다 읽기 전에는 null */
  config: ServerConfig | null;
  /** 연결 정보가 없으면 off, 있으면 마지막 접속 확인 결과 (첫 확인 전에는 connected) */
  status: ServerStatus;
  /** 접속 확인 중인지 */
  checking: boolean;
  /** 바로 다시 확인한다 (설정의 [지금 다시 확인] 등, R44) */
  recheck: () => void;
  /** 재개를 요청해 서버가 켜지기를 기다리는 중인지 (10초마다 확인, R43) */
  resuming: boolean;
  /** 재개를 요청한 뒤 확인한 횟수 */
  resumeChecks: number;
  /** 재개를 요청했다 (대시보드·PAT 둘 다): 켜질 때까지 10초마다 확인한다 */
  startResume: () => void;
  /** [×]로 숨긴 안내 띠 상태들 (이번 실행 동안만) */
  dismissedBanners: readonly ServerStatus[];
  dismissBanner: (status: ServerStatus) => void;
  /** 연결 정보 일부를 바꾸고 바로 저장한다 */
  updateConfig: (patch: Partial<Omit<ServerConfig, "version">>) => Promise<void>;
  /** 이 PC에 저장한 연결 정보와 로그인 정보를 지운다 */
  clearConnection: () => Promise<void>;
  /** 로그인한 상태 (없으면 null). 켤 때 저장된 로그인 정보로 복원한다 (R31). */
  session: ServerSession | null;
  /**
   * 서버 기능이 쓸 세션. 서버 업데이트·앱 업데이트가 필요하면 null (끝날 때까지 서버 기능을 막음, R24, R25).
   * 서버 연결 화면(업데이트·설정)은 위의 session을 쓴다.
   */
  serverSession: ServerSession | null;
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
  /** 서버 업데이트 화면이 본문 자리에 열려 있는지 (사이드바는 그대로) */
  updateOpen: boolean;
  /** 서버 업데이트 화면을 연다 ("서버 업데이트가 필요합니다" 띠) */
  openUpdate: () => void;
  /** 서버 업데이트 화면을 닫는다 ([나중에], 다른 메뉴로 이동) */
  closeUpdate: () => void;
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
