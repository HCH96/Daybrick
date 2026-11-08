import { createContext, useContext } from "react";
import type { SyncFile, SyncKind } from "./types";

/**
 * 동기화를 할 수 없는 이유 (R7, R32). null이면 할 수 있다.
 * - off: 서버를 연결하지 않음
 * - login: 로그인 필요
 * - server-update: 서버 구조 번호가 낮음 (로컬만 씀)
 * - app-update: 앱이 서버보다 낮음
 */
export type SyncBlocked = "off" | "login" | "server-update" | "app-update" | null;

export interface SyncState {
  /** sync.json 내용. 다 읽기 전에는 null */
  file: SyncFile | null;
  blocked: SyncBlocked;
  /** 켜기: 켜짐을 저장하고 종류마다 서버와 비교해 처리한다 (R17, R18) */
  enable: () => Promise<void>;
  /** 끄기: 켜짐만 끈다. rev·hash와 서버·로컬 데이터는 그대로 둔다 (R25, R27) */
  disable: () => Promise<void>;
  /** 켜기 흐름 등 서버와 맞추는 중인지 */
  busy: boolean;
  /** 기능이 로컬 저장에 성공했음을 알린다 (D8). 올리기는 5단계에서 채운다 */
  notifySaved: (kind: SyncKind) => void;
}

/** SyncProvider가 값을 넣는다 (D9: ServerProvider 안, 기능 Provider 바깥) */
export const SyncContext = createContext<SyncState | null>(null);

export function useSync(): SyncState {
  const sync = useContext(SyncContext);
  if (!sync) {
    throw new Error("useSync는 SyncProvider 안에서만 쓸 수 있다.");
  }
  return sync;
}
