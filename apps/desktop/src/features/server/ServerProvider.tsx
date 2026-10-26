import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { clearServerConnection, createDefaultServerConfig, loadServerConfig, saveServerConfig } from "./config";
import type { ServerConfig, ServerStatus } from "./types";
import { ServerContext, type ServerState } from "./useServer";

/** 앱을 켤 때 server.json을 읽고, 연결 정보와 상태를 앱 전체에 공유한다. */
export function ServerProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ServerConfig | null>(null);
  // 연달아 바꿀 때도 최신 값을 기준으로 합치기 위해 따로 들고 있는다
  const configRef = useRef<ServerConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadServerConfig()
      .catch((e: unknown) => {
        console.error("서버 연결 정보를 읽지 못함", e);
        return createDefaultServerConfig();
      })
      .then((loaded) => {
        if (cancelled) return;
        configRef.current = loaded;
        setConfig(loaded);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateConfig = useCallback<ServerState["updateConfig"]>(async (patch) => {
    const next: ServerConfig = { ...(configRef.current ?? createDefaultServerConfig()), ...patch };
    configRef.current = next;
    setConfig(next);
    await saveServerConfig(next);
  }, []);

  // 연결 해제 뒤에는 첫 실행 안내 대신 설정의 "연결 안 함" 칸을 보여주므로 welcomeDismissed는 true로 남긴다
  const clearConnection = useCallback(async () => {
    await clearServerConnection();
    const next: ServerConfig = { ...createDefaultServerConfig(), welcomeDismissed: true };
    configRef.current = next;
    setConfig(next);
    await saveServerConfig(next);
  }, []);

  // 연결 마법사가 열려 있는지 (첫 실행 안내와 설정 화면 양쪽에서 연다). 입력값은 마법사 안에만 둔다
  const [setupOpen, setSetupOpen] = useState(false);
  const openSetup = useCallback(() => setSetupOpen(true), []);
  const closeSetup = useCallback(() => setSetupOpen(false), []);

  const status: ServerStatus = config?.connection ? "connected" : "off";

  const value = useMemo<ServerState>(
    () => ({ config, status, updateConfig, clearConnection, setupOpen, openSetup, closeSetup }),
    [config, status, updateConfig, clearConnection, setupOpen, openSetup, closeSetup],
  );

  return <ServerContext.Provider value={value}>{children}</ServerContext.Provider>;
}
